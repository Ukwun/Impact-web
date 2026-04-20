# 🚀 Netlify Deployment Guide - ImpactApp Web Platform

## 🎯 Deployment Overview

This guide walks you through deploying the complete 8-role ImpactApp platform to Netlify.

**Estimated Time:** 15-30 minutes
**Prerequisites:** GitHub account connected, environment variables ready
**Status:** All code complete and tested ✅

---

## ✅ Pre-Deployment Checklist

Before deploying, verify:
- [x] All 8 roles implemented
- [x] Build passing locally (`npm run build`)
- [x] Code pushed to GitHub
- [x] Environment variables collected
- [x] Database configured
- [ ] Netlify account ready
- [ ] GitHub repository connected
- [ ] Environment variables added to Netlify

---

## 📋 Step 1: Prepare Environment Variables

Collect these from your `.env.local` file:

```env
# Database
DATABASE_URL=your_postgresql_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-domain.netlify.app

# JWT/Auth
JWT_SECRET=your_jwt_secret_key

# API Keys (if using)
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Third-party Services
SENTRY_DSN=https://xxx@sentry.io/xxxx
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project

# Others
NODE_ENV=production
```

---

## 🔗 Step 2: Connect GitHub to Netlify

### Option A: First Time Setup
1. Go to [netlify.com](https://netlify.com)
2. Click **Sign up** (or **Log in** if you have account)
3. Choose **GitHub** as signup method
4. Authorize Netlify to access your GitHub
5. Select **"impactapp-web"** repository

### Option B: Existing Netlify Account
1. Log in to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Choose **GitHub** provider
4. Search for **"impactapp-web"** repository
5. Select it

---

## ⚙️ Step 3: Configure Build Settings

### Netlify Build Configuration

When Netlify prompts for build settings, use:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Publish directory** | `.next` |
| **Node version** | `18` (minimum) or `20` (recommended) |

### In Netlify UI:
1. Under **Build settings**, set:
   - Build command: `npm run build`
   - Publish directory: `.next`
2. Click **"Show advanced"** → click **"New variable"**
3. Add each environment variable (see Step 1)

---

## 🔐 Step 4: Add Environment Variables

### Method 1: Netlify UI
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add each key-value pair:
   ```
   DATABASE_URL = your_db_url
   NEXTAUTH_SECRET = your_secret
   JWT_SECRET = your_jwt_secret
   ...etc
   ```
4. Click **Save**

### Method 2: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your site
netlify link

# Set environment variables
netlify env:set DATABASE_URL "your_database_url"
netlify env:set NEXTAUTH_SECRET "your_secret"
netlify env:set JWT_SECRET "your_jwt_secret"
# ... repeat for all variables
```

---

## 🚀 Step 5: Deploy

### Automatic Deployment (Recommended)
Once you've configured everything, Netlify automatically deploys when you push to GitHub:

```bash
# Make a commit
git add .
git commit -m "prepare for netlify deployment"

# Push to GitHub (this triggers Netlify deployment automatically)
git push origin main
```

### Manual Deployment
In Netlify dashboard:
1. Go to **Deployments**
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

**Deployment typically takes 3-5 minutes.**

---

## 📊 Step 6: Monitor Deployment

### During Build
1. Go to **Deployments** tab
2. Watch the build progress
3. You'll see:
   - ✅ **Building** → Compiling Next.js
   - ✅ **Validating** → Type checking
   - ✅ **Uploading** → Pushing to CDN
   - ✅ **Done** → Deployment complete

### Watch for Errors
Common build errors:
```
Error: ENOENT: no such file or directory

→ Check environment variables are set
→ Verify DATABASE_URL is correct
→ Ensure Node version is 18+
```

---

## ✅ Step 7: Verify Deployment

### Check Deployment Status
1. Netlify shows a green checkmark ✅ = deployment successful
2. You get a deployment URL: `https://xxxx.netlify.app`
3. Click the URL to visit your live site

### Test All 8 Roles
1. **STUDENT**
   - Log in as student
   - Navigate to `/dashboard/student`
   - Try enrolling in a course
   - ✅ Verify metrics load

2. **FACILITATOR**
   - Log in as teacher/facilitator
   - Navigate to `/dashboard/facilitator`
   - Try creating a course
   - ✅ Verify submission grading loads

3. **PARENT**
   - Log in as parent
   - Navigate to `/dashboard/parent`
   - Verify child data displays
   - ✅ Cannot see other parents' data

4. **MENTOR**
   - Log in as mentor
   - Navigate to `/dashboard/mentor`
   - Check mentee list
   - ✅ Session scheduling works

5. **ADMIN**
   - Log in as admin
   - Navigate to `/dashboard/admin`
   - Check user management
   - ✅ Can view all users

6. **SCHOOL_ADMIN**
   - Log in as school admin
   - Check school-specific data
   - ✅ Cannot see other schools

7. **UNI_MEMBER**
   - Check peer networking
   - ✅ Can discover courses

8. **CIRCLE_MEMBER**
   - Check community features
   - ✅ Can join circles

### Check Console for Errors
Open browser DevTools (F12):
- **Console tab**: Should have no red errors
- **Network tab**: Check for failed requests (should be 0)
- **Applications tab**: Verify localStorage has auth token

---

## 🔍 Step 8: Troubleshooting

### Build Failed
```
Error: Failed to compile
```
**Solution:**
1. Check build logs in Netlify
2. Most common: Missing environment variable
3. Add missing var in Netlify dashboard
4. Retry build: **Deployments** → **Trigger deploy**

### 502 Bad Gateway
```
Error: 502 Bad Gateway
```
**Solution:**
1. Usually means backend is down
2. Check if database is running
3. Verify DATABASE_URL is correct
4. Restart Netlify deployment

### "Cannot find module" errors
```
Error: Cannot find module '@/lib/auth'
```
**Solution:**
1. Verify working locally first: `npm run build`
2. Check Node version on Netlify (should be 18+)
3. Clear Netlify cache: **Site settings** → **Clear build cache** → **Trigger deploy**

### 403 Unauthorized errors
```
Error: Forbidden (403)
```
**Solution:**
1. JWT token not being sent
2. Role doesn't match endpoint requirement
3. User session expired
4. Check Sentry dashboard for details

---

## 📈 Step 9: Monitor Production

### Set Up Alerts
In Netlify **Notifications**:
- **Add notification** → Choose Slack/Email
- Get alerted on failed deployments
- Monitor error rates

### Monitor with Sentry
If using Sentry (recommended):
1. Create account at sentry.io
2. Create project for Next.js
3. Add SENTRY_DSN to environment
4. View real-time errors on Sentry dashboard

### Analytics
Check Netlify **Analytics** tab:
- Page views per role
- Geolocation of users
- Popular pages
- Error rates

---

## 🔄 Step 10: Continuous Deployment

### Automatic Updates
Every time you push to GitHub:
```bash
git push origin main
↓
GitHub notifies Netlify
↓
Netlify automatically:
  1. Pulls latest code
  2. Runs: npm run build
  3. Deploys to CDN
  4. Updates live site
```

### Rollback (If Needed)
In Netlify **Deployments**:
1. Find previous deployment
2. Click **...** → **Deploy** this build
3. Site reverts to previous version

---

## 📋 Post-Deployment Checklist

After deployment is live:

- [ ] All 8 role dashboards accessible
- [ ] No 403 errors in console
- [ ] Student can submit work
- [ ] Facilitator can create course
- [ ] Parent can view child progress
- [ ] Mentor can schedule sessions
- [ ] Admin can view all users
- [ ] API endpoints responding correctly
- [ ] Database connections working
- [ ] Sentry collecting errors
- [ ] Analytics enabled
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring setup
- [ ] Team invited to Netlify

---

## 🎯 Deployment Summary

| Step | Status | Time |
|------|--------|------|
| 1. Prepare environment | ✅ | 5 min |
| 2. Connect GitHub | ✅ | 3 min |
| 3. Build settings | ✅ | 2 min |
| 4. Environment variables | ✅ | 5 min |
| 5. Deploy | 🔄 | 3-5 min |
| 6. Verify | 🔄 | 10 min |
| 7. Testing | 🔄 | 15 min |
| **Total** | | **~40 min** |

---

## 🎉 Success!

When you see this on Netlify:
```
✅ Deploy successful
  🟢 Production deployed
  📊 123 files cached
  ⚡ 2.5s build time
```

### Your platform is now LIVE! 🚀

**Visit:** `https://your-domain.netlify.app`
**Features:** All 8 roles fully functional
**Scale:** Automatic CDN distribution worldwide
**Monitoring:** Sentry errors tracked in real-time
**Updates:** Auto-deployed on GitHub push

---

## 📞 Need Help?

### Netlify Support
- **Dashboard:** Account → Help Center
- **Docs:** https://docs.netlify.com
- **Status:** https://www.netlifystatus.com

### Common Netlify Issues
- Database connection: Check DATABASE_URL variable
- Build timeout: Increase memory (Build settings)
- Environment not set: Verify in Site settings → Build & deploy

### Next Steps
1. ✅ Share deployment URL with team
2. ✅ Test on mobile/tablet
3. ✅ Monitor Sentry dashboard
4. ✅ Celebrate going live! 🎉

---

**Deployment Ready!** All code is production-ready and tested.
**Good luck with your launch!** 🚀
