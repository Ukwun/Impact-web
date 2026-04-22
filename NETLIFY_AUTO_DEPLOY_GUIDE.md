# Netlify Auto-Deployment Setup & Verification

## ✅ STATUS: DEPLOYMENT ACTIVE

**Repository:** https://github.com/Ukwun/Impact-web  
**Deployment Platform:** Netlify  
**Auto-Deploy Trigger:** Git push to `master` branch  
**Last Deployment:** 2026-04-22 (This release)

---

## HOW AUTOMATIC DEPLOYMENTS WORK

### 1️⃣ **Code Push Triggers Deployment**
```
Your local machine
    ↓ (git push)
GitHub Repository
    ↓ (webhook)
Netlify Build System
    ↓ (npm run build)
Live Site
```

### 2️⃣ **What Happens After `git push`**

When you push to `master` branch:
1. ✅ GitHub receives your commits
2. ✅ GitHub triggers Netlify webhook automatically
3. ✅ Netlify clones your repository
4. ✅ Netlify runs build command: `npm run build`
5. ✅ Netlify runs post-build migration: `prisma migrate deploy` (if configured)
6. ✅ Netlify deploys to CDN across 300+ global locations
7. ✅ Your site is live in ~30-60 seconds

### 3️⃣ **Build Environment**
Netlify automatically provides:
- ✅ Node.js 18+ (LTS)
- ✅ npm/pnpm package managers
- ✅ Environment variables from Netlify Settings → Environment
- ✅ 1GB memory during builds (sufficient for this app)
- ✅ 15-minute timeout per build

---

## ENVIRONMENT VARIABLES SETUP

### Step 1: Add Variables to Netlify Dashboard

Go to **Site Settings → Environment → Environment Variables**

Add these variables (copy from `.env.local`):

```
STRIPE_SECRET_KEY = sk_live_51TObsJFIely4np1I... (SENSITIVE - Use Netlify Secrets)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_51TObsJFIely4np1I...
STRIPE_WEBHOOK_SECRET = whsec_... (SENSITIVE - Use Netlify Secrets)

DATABASE_URL = postgresql://user:pass@host:5432/impactapp
JWT_SECRET = your-super-secret-key-32-chars (SENSITIVE - Use Netlify Secrets)

RESEND_API_KEY = re_... (SENSITIVE - Use Netlify Secrets)
NEXT_PUBLIC_API_BASE_URL = https://impactapp.netlify.app

AWS_S3_BUCKET = your-bucket-name
AWS_S3_REGION = us-east-1
AWS_ACCESS_KEY_ID = AKIA... (SENSITIVE - Use Netlify Secrets)
AWS_SECRET_ACCESS_KEY = ... (SENSITIVE - Use Netlify Secrets)

SENTRY_DSN = https://your-sentry-dsn@sentry.io/...
NEXT_PUBLIC_SENTRY_ENVIRONMENT = production
```

### Step 2: Use Netlify Secrets for Sensitive Values

⚠️ **IMPORTANT:** For sensitive values (API keys, secrets), use **Netlify Secrets** instead of regular environment variables:

1. Go to **Site Settings → Environment → Environment Variables**
2. Click **Edit variables**
3. For sensitive keys, Netlify will automatically flag them as **Secrets**
4. Your secrets are:
   - ✅ Hidden from build logs
   - ✅ Never shown in Netlify UI
   - ✅ Never exposed in client-side code
   - ✅ Encrypted at rest

### Step 3: Configure Build Settings

Go to **Site Settings → Build & Deploy → Build Settings**

Set these values:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Publish Directory** | `.next` |
| **Production Branch** | `master` |

---

## VERIFY AUTO-DEPLOYMENT IS WORKING

### Method 1: Monitor Deployment in Netlify Dashboard

1. Go to https://app.netlify.com
2. Select your site (Impact-web)
3. Go to **Deploys** tab
4. You should see your most recent deployment with:
   - ✅ Status: "Published" (green)
   - ✅ Deployment time
   - ✅ Commit message: "Production Release: Global Stripe Integration..."
   - ✅ Build duration (~3-5 minutes)

### Method 2: Check Build Logs

1. Click on the deployment (green "Published" status)
2. Click **Deployment Log** button
3. Verify these key steps completed successfully:
   ```
   ✅ Building site
   ✅ Fetching dependencies with npm
   ✅ Running "npm run build"
   ✅ Next.js build successful
   ✅ (Optional) Running post-build command
   ✅ Functions bundled
   ✅ Caching with git metadata
   ✅ Build complete (time: 3m 45s)
   ```

### Method 3: Test the Live Site

1. Go to your Netlify site URL: https://[your-site].netlify.app
2. Navigate to **/payments** page
3. Verify you see three payment options:
   - ✅ Flutterwave (existing)
   - ✅ Stripe (NEW - with blue "CreditCard" icon)
   - ✅ Bank Transfer
4. Click Stripe card - should see currency selector (USD/GBP)

### Method 4: Verify Admin Dashboard Real Data

1. Log in with admin account
2. Go to **/dashboard/admin**
3. Check metrics should show REAL numbers:
   - ✅ Total Users: (actual count, not `Math.random()`)
   - ✅ Active Today: (actual 24-hour logins)
   - ✅ Total Revenue: (actual sum of payments)
   - ❌ Should NOT show random numbers like 8,392 → 7,291

---

## AUTOMATIC DEPLOYMENT WORKFLOW

### For Every Future Update

**Step 1: Make code changes locally**
```bash
# Edit files, test locally
npm run dev
# Test your changes
```

**Step 2: Commit your changes**
```bash
git add .
git commit -m "feat: your meaningful commit message"
```

**Step 3: Push to GitHub**
```bash
git push origin master
```

**Step 4: Netlify Deploys Automatically** (No Action Needed!)
- ✅ GitHub webhook triggers instantly
- ✅ Netlify receives notification
- ✅ Build starts automatically
- ✅ Site updates within 30-60 seconds
- ✅ No manual deployment button needed

**Step 5: Monitor (Optional)**
- Go to Netlify **Deploys** tab to watch build progress
- Deployment complete when status turns "Published" (green)
- Live site updates automatically

---

## TROUBLESHOOTING DEPLOYMENT FAILURES

### Build Failed: "stripe not found"

**Problem:** Netlify can't find `@stripe/stripe-js` package

**Solution:**
1. Go to **Site Settings → Build & Deploy → Build Settings**
2. For **Node.js version**, set to: **18.x** or **latest**
3. Trigger redeploy: On **Deploys** tab, click **Trigger Deploy** → **Deploy Site**

### Build Failed: Type Errors in stripe-service.ts

**Problem:** TypeScript compilation error

**Solution:**
1. Run locally: `npm run build`
2. Fix any TypeScript errors
3. Commit and push:
   ```bash
   git add src/lib/stripe-service.ts
   git commit -m "fix: resolve TypeScript errors"
   git push origin master
   ```
4. Netlify auto-deploys with fix

### Build Failed: Prisma Migration

**Problem:** `prisma migrate deploy` errors

**Solution:**
- Migrations run automatically on deploy (if configured)
- If database credentials are wrong:
  1. Verify `DATABASE_URL` in Netlify environment variables
  2. Test connection locally: `npx prisma db push`
  3. Update Netlify env var if needed
  4. Trigger redeploy

### Build Stuck / Timeout

**Problem:** Build taking >15 minutes

**Solution:**
1. Check build logs for what's slow
2. Most likely: dependency installation
3. Clear Netlify cache:
   - Go to **Build & Deploy → Clear Cache & Redeploy**
4. This forces fresh npm install and rebuild

---

## DEPLOYMENT MONITORING

### View Real-Time Deployment Status

**Netlify Dashboard URL:** https://app.netlify.com/sites/[your-site-name]/deploys

**What to Monitor:**
- ✅ **Status**: Published (green) = Live | Building (orange) = In progress | Failed (red) = Error
- ✅ **Build Duration**: Should be 3-5 minutes
- ✅ **Deploy Summary**: Shows changes in commit
- ✅ **Preview URL**: Can preview before going live (for PRs)

### Enable Email Notifications (Optional)

1. Go to **Team Settings → Notifications**
2. Add email for deployment alerts
3. Select: "Notify me of failed deploys"
4. You'll get email if build fails

---

## CONTINUOUS IMPROVEMENTS

### Next Steps to Optimize:

1. **Enable Pre-built Preview Deploys**
   - Go to **Build & Deploy → Deploy Previews**
   - Set to "Deploy my pull requests from forks"
   - Each PR gets a preview URL before merge

2. **Configure Post-Merge Notifications**
   - Go to **Build & Deploy → Notifications**
   - Add Slack webhook for deployment alerts
   - Get instant notification when site goes live

3. **Monitor Performance**
   - Netlify provides built-in analytics
   - Track: Page load times, user locations, top pages
   - Go to **Analytics** tab on dashboard

4. **Set Up Error Tracking**
   - Already integrated: Sentry
   - Monitor: Runtime errors, exceptions
   - Go to https://sentry.io dashboard for real-time alerts

---

## QUICK REFERENCE: DEPLOYMENT CHECKLIST

Before Pushing to Master:

- [ ] Code tested locally: `npm run dev`
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Environment variables working
- [ ] Commit message is descriptive
- [ ] Ready for production

After Pushing to Master:

- [ ] GitHub shows new commit
- [ ] Netlify shows "Building" status
- [ ] Build completes (5 min)
- [ ] Netlify shows "Published" (green)
- [ ] Test live site URL
- [ ] Verify features work correctly
- [ ] Check admin dashboard (real data)
- [ ] Monitor Sentry for errors

---

## NEED HELP?

**Netlify Support:** https://support.netlify.com  
**Next.js Deploy Docs:** https://nextjs.org/docs/deployment/netlify  
**GitHub Actions CI/CD:** See included `.github/workflows/` for automated testing

---

**Last Updated:** 2026-04-22  
**Status:** ✅ Production Auto-Deployment Active  
**Next Deployment Trigger:** Next git push to master branch
