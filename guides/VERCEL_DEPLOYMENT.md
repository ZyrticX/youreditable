# 🚀 Vercel Deployment Guide for youreditable.com

## ✅ Pre-Deployment Checklist

Your app is ready for deployment to **https://www.youreditable.com/**! Here's what's configured:

### 📁 **Files Ready**:
- ✅ `vercel.json` - Complete Vercel configuration
- ✅ `env.production` - Production environment template
- ✅ `dist/` folder - Production build ready
- ✅ Domain-specific Paddle configuration

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Set Up Environment Variables
Before deploying, you need to configure your production environment variables in Vercel:

#### A. Required Environment Variables
```bash
# Supabase (REQUIRED - Replace with your actual values)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# App Configuration
VITE_APP_NAME=Editable - Video Review Platform
VITE_APP_URL=https://www.youreditable.com
VITE_API_URL=https://www.youreditable.com/api

# Paddle Payment (REQUIRED for payments)
VITE_PADDLE_ENVIRONMENT=production
VITE_PADDLE_CLIENT_TOKEN=live_your_paddle_token_here
```

#### B. Optional Environment Variables
```bash
# Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_id

# Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn

# Contact
VITE_SUPPORT_EMAIL=support@youreditable.com
VITE_CONTACT_EMAIL=hello@youreditable.com
```

### Step 4: Deploy to Vercel

#### Option A: Deploy via CLI
```bash
# From your project root
vercel --prod
```

#### Option B: Deploy via GitHub (Recommended)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

### Step 5: Configure Custom Domain
1. **In Vercel Dashboard**:
   - Go to your project settings
   - Click "Domains"
   - Add `www.youreditable.com`
   - Add `youreditable.com` (redirect to www)

2. **DNS Configuration**:
   ```dns
   # Add these DNS records in your domain provider:
   
   # For www.youreditable.com
   CNAME  www  cname.vercel-dns.com
   
   # For youreditable.com (apex domain)
   A      @    76.76.19.61
   AAAA   @    2606:4700:10::6814:55ad
   ```

### Step 6: Environment Variables in Vercel
1. **Via Dashboard**:
   - Project Settings → Environment Variables
   - Add each variable from your `env.production` file
   - Set environment to "Production"

2. **Via CLI**:
   ```bash
   # Add environment variables
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   # ... add all other variables
   ```

## ⚙️ Vercel Configuration Explained

### `vercel.json` Features:
```json
{
  "name": "youreditable-app",           // Project name
  "rewrites": [...],                    // SPA routing support
  "redirects": [...],                   // Root → /Home redirect
  "headers": [...],                     // Security headers
  "functions": [...]                    // API functions support
}
```

### Security Headers Included:
- ✅ **X-Frame-Options**: Prevents clickjacking
- ✅ **X-Content-Type-Options**: MIME type security
- ✅ **Referrer-Policy**: Controls referrer information
- ✅ **Permissions-Policy**: Restricts browser features

## 🔧 Post-Deployment Setup

### 1. **Update Paddle Webhooks**
- Paddle Dashboard → Notifications
- Update webhook URL to: `https://your-supabase-project.supabase.co/functions/v1/paddle-webhook`

### 2. **Test Your Deployment**
- ✅ Visit https://www.youreditable.com/
- ✅ Test authentication flow
- ✅ Test payment integration
- ✅ Verify all pages load correctly

### 3. **Monitor Performance**
- Vercel Analytics (built-in)
- Core Web Vitals monitoring
- Function execution logs

## 📊 Expected Performance

### Vercel Optimizations:
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Edge Functions**: Serverless API support
- ✅ **Automatic HTTPS**: SSL certificate included
- ✅ **Image Optimization**: Built-in optimization
- ✅ **Caching**: Intelligent static asset caching

### Build Output:
```
dist/index.html                     5.33 kB │ gzip:   1.93 kB
dist/assets/index-C_Hc4n61.css    101.96 kB │ gzip:  16.76 kB
dist/assets/supabase-BdM9p2i0.js  132.30 kB │ gzip:  35.93 kB
dist/assets/ui-g_hmjoXy.js        172.63 kB │ gzip:  52.00 kB
dist/assets/vendor-CVKNWIPv.js    175.90 kB │ gzip:  58.00 kB
dist/assets/index-MG6F59Ye.js     870.69 kB │ gzip: 236.07 kB
```

## 🚨 Pre-Launch Checklist

### Required Before Going Live:
- [ ] **Supabase**: Database set up and configured
- [ ] **Paddle**: Account created, products configured, tokens added
- [ ] **Environment Variables**: All production values set in Vercel
- [ ] **Domain**: DNS configured and verified
- [ ] **Testing**: Full payment flow tested in sandbox

### Optional Enhancements:
- [ ] **Analytics**: Google Analytics configured
- [ ] **Error Tracking**: Sentry configured
- [ ] **Email**: Support/contact email configured
- [ ] **SEO**: Meta tags and sitemap
- [ ] **Social**: Open Graph images

## 🎯 Quick Deploy Commands

```bash
# Quick deployment (if everything is set up)
npm run build
vercel --prod

# Or with environment check
vercel env ls
vercel --prod
```

## 🆘 Troubleshooting

### Common Issues:
1. **Build Fails**: Check environment variables are set
2. **404 on Routes**: Verify `vercel.json` rewrites are correct
3. **Payment Not Working**: Check Paddle tokens and price IDs
4. **Database Errors**: Verify Supabase configuration

### Support:
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: Available in dashboard

Your **youreditable.com** deployment is ready! 🎉
