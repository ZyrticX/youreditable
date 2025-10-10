# 🚀 Vercel Project Management Guide

## 🎯 Current Status
Your Editable app is successfully deployed on Vercel with the following configuration:

**Project Details:**
- **Project Name**: `youreditable-app`
- **Domain**: `https://www.youreditable.com`
- **Vercel CLI**: v48.2.0 ✅
- **Auto-deployments**: Enabled ✅

---

## 📍 Current Configuration

### Environment Variables (Already Set)
```
✅ VITE_SUPABASE_ANON_KEY      (Production)
✅ VITE_SUPABASE_URL           (Production) 
✅ VITE_PADDLE_ENVIRONMENT     (All environments)
✅ VITE_PADDLE_CLIENT_TOKEN    (All environments)
```

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "build": {
    "env": {
      "VITE_APP_URL": "https://www.youreditable.com"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "redirects": [
    {
      "source": "/",
      "destination": "/Home", 
      "permanent": false
    }
  ]
}
```

---

## 🔧 Managing Your Vercel Project

### Deployment Commands
```bash
# Deploy to production
npm run build
vercel --prod

# Deploy preview (staging)
npm run build  
vercel

# Quick deploy (uses npm script)
npm run deploy        # Production
npm run deploy:preview # Preview
```

### Environment Variables Management

#### View Current Variables
```bash
vercel env ls
```

#### Add New Variable
```bash
vercel env add VARIABLE_NAME
# Then enter the value when prompted
# Choose environments: Development, Preview, Production
```

#### Remove Variable
```bash
vercel env rm VARIABLE_NAME
```

#### Pull Variables to Local
```bash
vercel env pull .env.local
```

---

## 🔄 API Integration Updates for Vercel

### 1. Paddle Configuration
**Current Status**: ✅ Tokens configured, ❌ Price IDs need update

**To Update Paddle:**
1. Get Price IDs from Paddle Dashboard
2. Update `index.html` lines 28-33
3. Deploy:
   ```bash
   npm run deploy
   ```

### 2. Google APIs Configuration
**Redirect URLs to configure in Google Cloud Console:**
```
https://gewffjhkvxppwxhqmtqx.supabase.co/auth/v1/callback
https://www.youreditable.com/auth/v1/callback
```

**If you need to add Google Client ID:**
```bash
vercel env add VITE_GOOGLE_CLIENT_ID
# Enter your Google Client ID
# Select: Production
```

### 3. Supabase Configuration
**Current Status**: ✅ Already configured

**If you need to update Supabase domain:**
```bash
# Update Supabase URL
vercel env rm VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_URL
# Enter: https://your-new-project.supabase.co

# Update Supabase Key
vercel env rm VITE_SUPABASE_ANON_KEY  
vercel env add VITE_SUPABASE_ANON_KEY
# Enter your new anon key
```

---

## 🧪 Testing & Monitoring

### Check Deployment Status
```bash
# View recent deployments
vercel ls

# View deployment logs
vercel logs
```

### Test Your APIs
After any configuration changes:

1. **Test Authentication**:
   - Go to `https://www.youreditable.com/Login`
   - Try email/password login
   - Try "Sign in with Google"

2. **Test Google Drive Import**:
   - Go to `https://www.youreditable.com/Import`
   - Enter Google Drive folder URL
   - Check console for API responses

3. **Test Paddle Payments**:
   - Go to `https://www.youreditable.com/Pricing`
   - Try to purchase a plan
   - Check Paddle Dashboard for webhooks

### Monitor Performance
- **Vercel Analytics**: Available in Vercel Dashboard
- **Console Logs**: Check browser console for errors
- **Supabase Logs**: Monitor Edge Function logs

---

## 🚨 Common Vercel Issues & Solutions

### Issue 1: Environment Variables Not Working
**Solution**:
```bash
# Redeploy after changing env vars
vercel --prod
```

### Issue 2: Build Failures
**Solution**:
```bash
# Test build locally first
npm run build

# Check for linting errors
npm run lint

# Deploy with build logs
vercel --prod --debug
```

### Issue 3: Domain Not Working
**Solution**:
1. Check domain configuration in Vercel Dashboard
2. Verify DNS settings point to Vercel
3. Check SSL certificate status

### Issue 4: API Calls Failing
**Solution**:
1. Check environment variables are set
2. Verify API endpoints are correct
3. Check CORS settings in APIs
4. Monitor browser network tab

---

## 📋 Deployment Checklist

### Before Each Deployment
- [ ] Test build locally: `npm run build`
- [ ] Check for console errors
- [ ] Verify environment variables are set
- [ ] Test critical user flows

### After Each Deployment
- [ ] Verify site loads: `https://www.youreditable.com`
- [ ] Test authentication flow
- [ ] Test Google Drive import
- [ ] Test payment flow (if Paddle configured)
- [ ] Check for any console errors

### API Configuration Updates
- [ ] Update Paddle Price IDs in `index.html`
- [ ] Configure Google OAuth redirect URLs
- [ ] Set up Paddle webhooks
- [ ] Test all integrations

---

## 🔧 Quick Commands Reference

```bash
# Deployment
npm run deploy              # Deploy to production
npm run deploy:preview      # Deploy preview

# Environment Variables  
vercel env ls              # List all variables
vercel env add VAR_NAME    # Add new variable
vercel env rm VAR_NAME     # Remove variable
vercel env pull .env.local # Pull to local file

# Monitoring
vercel logs               # View deployment logs
vercel ls                 # List deployments
vercel --debug           # Deploy with debug info

# Project Management
vercel link              # Link local project to Vercel
vercel projects ls       # List all projects
```

---

## 🎯 Next Steps for Full API Integration

### Priority 1: Paddle Price IDs
1. Go to Paddle Dashboard
2. Create products and get Price IDs
3. Update `index.html` lines 28-33
4. Deploy: `npm run deploy`

### Priority 2: Google OAuth
1. Set up Google Cloud Console
2. Configure Supabase Google provider
3. Test "Sign in with Google"

### Priority 3: Webhooks
1. Configure Paddle webhooks
2. Test payment flow end-to-end

**Your Vercel setup is solid - just need to complete the API configurations!** 🚀
