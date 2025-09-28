Integrating Paddle in a Vite + Supabase Site

Paddle provides a merchant‑of‑record service that handles payments, subscription management and tax compliance across hundreds of countries. Below is a detailed guide on how to integrate Paddle into a site built with Vite (frontend bundler) and Supabase (authentication and database).

1. Create an Account and Choose a Sandbox Environment

Sign up for Paddle: Start by opening a Paddle account. It is recommended to begin with a Sandbox account for testing and later switch to the live environment once your integration is ready. The live account requires identity verification, so there may be a delay before you can use it
developer.paddle.com
.

Create products and prices: In the Paddle dashboard you must create items in your catalog—Products and Prices. Each price has a unique priceId used in your code. You can define recurring prices (monthly or annual) and one‑time products. It is also advisable to set country‑specific prices where needed
developer.paddle.com
.

Use Supabase for authentication and user data: Supabase provides authentication, user profiles and database access. You can enable Supabase’s Paddle Wrapper to read and write data directly to Paddle from PostgreSQL; this extension works as a Wasm Foreign Data Wrapper
supabase.com
. However, for basic payment processing you can rely on Paddle.js and use webhooks to trigger Supabase functions.

2. Create a Client‑Side Token

Paddle issues client‑side tokens with limited scope for frontend use. You can generate them in the dashboard under Developer tools → Authentication. Each environment (Sandbox/Live) has its own tokens; sandbox tokens start with test_
developer.paddle.com
.

3. Add Paddle.js to a Vite Project

Vite doesn’t require special configuration—add the Paddle.js script in your index.html or dynamically import it on the client:

<!-- index.html in the <head> tag -->
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script type="text/javascript">
  // set Sandbox environment
  Paddle.Environment.set("sandbox");
  // initialise with your client‑side token and default settings
  Paddle.Initialize({
    token: "test_xxxxxxxxxxxxxxxxx", // replace with your real token
    checkout: {
      settings: {
        // for inline checkout
        displayMode: "inline",
        frameTarget: "checkout-container", // element where the iframe will load
        frameInitialHeight: "450",
        frameStyle: "width: 100%; min-width: 312px; background-color: transparent; border: none;"
      }
    }
  });
</script>


Calling Paddle.Environment.set('sandbox') selects the correct environment for testing. When switching to production, call Paddle.Environment.set('production') and replace the token and priceId values with those from your live environment
developer.paddle.com
.

4. Create a Checkout and Present It to Users
Overlay Checkout

This method displays a modal window over the page. Advantages: quick integration with minimal code. Disadvantage: less control over layout and structure.

Define a button: Any HTML element can act as a checkout launcher. For example:

<a href="#" onclick="openCheckout()">Sign up now</a>


Call Paddle.Checkout.open(): This function accepts an array of items (priceId and quantity) and opens the overlay. Example:

<script>
  // define items list (priceId and quantity)
  const itemsList = [
    { priceId: 'pri_01gsz8ntc6z7npqqp6j4ys0w1w', quantity: 1 },
    { priceId: 'pri_01h1vjfevh5etwq3rb416a23h2', quantity: 1 }
  ];

  function openCheckout() {
    Paddle.Checkout.open({ items: itemsList });
  }
</script>


Behaviour: Once the user pays, Paddle automatically creates a subscription and stores the payment method
developer.paddle.com
. After receiving the payment you can listen for webhook events in Supabase to update your database.

Inline Checkout

Inline checkout embeds the payment form in your page so you can display items and totals yourself. In Vite the integration looks like this:

Create a target element: Add a div that will host the Paddle iframe:

<div id="checkout-container"></div>


Special settings: As shown in the code above, you need to add displayMode: "inline", frameTarget, frameInitialHeight and frameStyle to your Paddle.Initialize call
developer.paddle.com
.

Open checkout with items: Write a function openCheckout(items) that calls Paddle.Checkout.open() and passes the items list. You can run it on page load using onLoad so the checkout appears automatically
developer.paddle.com
.

Update items dynamically: If you want to let users switch from monthly to yearly plans or adjust quantities, use Paddle.Checkout.updateCheckout() to replace the items list in the open checkout
developer.paddle.com
.

Display item and price details: The Paddle iframe does not show a full breakdown of items; you can listen for events like checkout.loaded to get item, tax and total information and render it in your own UI
developer.paddle.com
.

5. Use Webhooks and Synchronise with Supabase

After a payment completes, Paddle sends webhooks (e.g., subscription.created, payment_succeeded) to a URL you define. It is recommended to set up a Notification Destination in the Paddle dashboard and point it to Supabase Functions
 or your own server. In Supabase you can process these events and insert or update user and subscription data in your database.

Examples of actions when listening to webhooks:

Insert a row in a subscriptions table when a subscription is created.

Mark the user’s account as active after receiving payment_succeeded.

Remove or reduce access when a cancellation event is received.

6. Tips on Countries and Payment Methods

Paddle operates in more than 200 countries and supports many currencies. When creating prices you can define local prices and choose payment methods such as credit card, PayPal, Apple Pay and more.

Specifying a customerIpAddress when displaying prices enables Paddle to show localized prices including estimated taxes.

All items in the items array must have the same billing interval (monthly or annual); otherwise the checkout will throw an error
developer.paddle.com
.

Summary

Integrating Paddle into a Vite + Supabase site involves:

Opening a Paddle account and creating a product catalog.

Generating a client‑side token and adding the paddle.js script to your Vite project.

Calling Paddle.Environment.set() and running Paddle.Initialize() with the appropriate settings.

Building a checkout—either overlay or inline—using Paddle.Checkout.open() and passing a list of items (priceId/quantity).

Using webhooks to synchronise subscription data with Supabase and to grant or revoke user access.

By following these steps you can add subscription and one‑time payment capabilities to your site using Paddle’s interface without dealing with invoices, taxes or VAT yourself. If you need full flexibility in managing Paddle data from your database, consider installing Supabase’s Paddle Wrapper, which lets you read and write to Paddle via SQL commands
supabase.com
.