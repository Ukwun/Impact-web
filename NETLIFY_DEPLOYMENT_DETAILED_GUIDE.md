# 🚀 NETLIFY DEPLOYMENT GUIDE - STEP-BY-STEP WALKTHROUGH
**Date:** April 18, 2026  
**Status:** Ready to Deploy  
**Estimated Time:** 1-2 hours from start to live  

---

## PRE-DEPLOYMENT CHECKLIST (30 minutes)

### 1. Local Build Verification
```bash
# From c:\DEV3\ImpactEdu\impactapp-web directory
npm install --legacy-peer-deps
npm run build
npm run type-check
npm test
```

**Expected Results:**
- ✅ Build succeeds with no errors (output: `.next/` directory created)
- ✅ Type checking passes (no TypeScript errors)
- ✅ Tests pass (at least core tests)

### 2. GitHub Repository Ready
```bash
# Verify all code is committed and pushed
git status  # Should show "nothing to commit, working tree clean"
git log --oneline -3  # Verify recent commits
git push origin master  # Verify connection
```

### 3. Environment Variables Collected

**Database (PostgreSQL on Render):**
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Authentication:**
```
JWT_SECRET=your-secure-random-string-min-32-characters
```

**File Storage (AWS S3):**
```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=impactapp-files-production
AWS_S3_REGION=us-east-1
```

**Email Service (Resend):**
```
RESEND_API_KEY=re_1234567890abcdefghijk
```

**Payments (Flutterwave):**
```
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-abc123...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-def456...
```

**Error Tracking (Sentry):**
```
SENTRY_DSN=https://abc123@sentry.io/123456
SENTRY_ENVIRONMENT=production
```

**Application URLs:**
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

---

## NETLIFY SETUP (6 STEPS)

### Step 1: Create Netlify Account & Connect Repository
```
1. Go to https://netlify.com
2. Sign up (or log in if you have account)
3. Click: "Add new site" → "Import an existing project"
4. Choose GitHub provider
5. Select repository: Ukwun/Impact-web
6. Click: "Connect"
```

**Expected Result:** Netlify asks for build settings

### Step 2: Configure Build Settings
```
Netlify Build Settings:
├─ Build command: npm run build
├─ Publish directory: .next
├─ Node version: 18.x
├─ Package manager: npm
└─ Runtime: Node 18

Click: "Deploy site"
```

**Expected Result:** Netlify starts building (~3-5 minutes)

### Step 3: Monitor Initial Build
```
Netlify Dashboard → Deploys → Latest Deploy

Watch the build log:
├─ Dependencies install (npm ci)
├─ Build Next.js (npm run build)
├─ Generate functions (automatically)
└─ Deploy to CDN

Expected output:
✓ Build complete
✓ Site deployed to netlify-subdomain.netlify.app
```

**Expected Result:** Build completes successfully

### Step 4: Add Environment Variables
```
Netlify Dashboard → Site Settings → Build & Deploy → Environment

Add all variables:

PRODUCTION BUILD VARIABLES:
┌─────────────────────────────────────────┐
│ DATABASE_URL                            │
│ postgresql://...                        │
│ (must be accessible from Netlify IP)    │
├─────────────────────────────────────────┤
│ JWT_SECRET                              │
│ (generate: openssl rand -base64 32)     │
├─────────────────────────────────────────┤
│ AWS_ACCESS_KEY_ID                       │
│ AWS_SECRET_ACCESS_KEY                   │
│ AWS_S3_BUCKET                           │
│ AWS_S3_REGION                           │
├─────────────────────────────────────────┤
│ RESEND_API_KEY                          │
├─────────────────────────────────────────┤
│ FLUTTERWAVE_PUBLIC_KEY                  │
│ FLUTTERWAVE_SECRET_KEY                  │
├─────────────────────────────────────────┤
│ SENTRY_DSN                              │
│ SENTRY_ENVIRONMENT=production           │
├─────────────────────────────────────────┤
│ NEXT_PUBLIC_APP_URL=https://domain.com  │
│ NEXT_PUBLIC_API_URL=https://domain.com  │
│ NEXT_PUBLIC_SOCKET_URL=https://domain.com
└─────────────────────────────────────────┘

Click: "Search, add, and edit variables"
Click: "Save"
```

**Expected Result:** All 15+ environment variables saved

### Step 5: Configure Domain
```
Option A: Use Netlify Subdomain (Free)
├─ Netlify Dashboard → Site Settings → Domain Management
├─ Domain: your-site.netlify.app
└─ Use automatically

Option B: Connect Custom Domain
├─ Netlify Dashboard → Site Settings → Domain Management
├─ Click: "Add domain"
├─ Enter: yourdomain.com
├─ Choose DNS provider:
│   ├─ Netlify DNS (recommended)
│   └─ External DNS (if using Route 53, CloudFlare, etc.)
├─ Update registrar nameservers (if using Netlify DNS)
└─ Wait for propagation (~5 minutes)
```

**Expected Result:** Domain resolves with HTTPS certificate

### Step 6: Enable Prerender (Optional but Recommended)
```
Netlify Dashboard → Site Settings → Build & Deploy → Pre-rendering

Enable On-demand ISR (Incremental Static Regeneration)
├─ Reduces database load
├─ Improves page load time
└─ Caches frequently-accessed pages
```

**Expected Result:** Homepage loads in <300ms

---

## POST-DEPLOYMENT TESTING (30 minutes)

### 1. Health Check
```
Visit: https://yourdomain.com/api/health

Expected Response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-04-18T..."
}
```

### 2. Landing Page
```
Visit: https://yourdomain.com

Check:
├─ ✅ Hero section loads
├─ ✅ Navigation bar visible
├─ ✅ Features section loads
├─ ✅ Testimonials display
├─ ✅ CTA buttons clickable
├─ ✅ No browser console errors (F12 → Console)
└─ ✅ Images load quickly
```

### 3. Authentication Flow
```
1. Click "Sign Up"
2. Fill form:
   ├─ Email: test@gmail.com
   ├─ Password: SecurePass@123
   └─ Role: Student
3. Click "Create Account"

Expected: Email verification sent
Check inbox (may be spam folder)
Click verification link
Should redirect to onboarding

4. Complete onboarding
5. Dashboard should load

Expected: Student dashboard visible with "Learn" tab
```

### 4. Course Enrollment
```
1. Click "Learn" tab
2. Browse courses
3. Click "Enroll" on any course

Expected: Enrollment confirmation
Course appears in "My Learning Path"
Progress bar shows 0%
```

### 5. Quiz Interaction
```
1. Click into enrolled course
2. Complete first lesson
3. Take quiz

Expected: 
├─ Questions display correctly
├─ Answer submission works
├─ Score calculated
└─ Results show
```

### 6. File Upload
```
1. Find assignment
2. Upload file (PDF/DOCX)

Expected:
├─ File uploads to AWS S3
├─ Success message
└─ File persists after page refresh
```

### 7. Email Verification
```
1. Check Resend email logs: https://resend.com/emails
2. Verify email was sent

Expected:
├─ Verification email received
├─ Link is valid (not 404)
└─ Clicking link marks email as verified
```

### 8. Mobile Responsiveness
```
On mobile device (or DevTools):
├─ Navigation collapses to hamburger menu
├─ Forms stack vertically
├─ Buttons are touch-friendly (44px+)
├─ No horizontal scroll
└─ All features work
```

### 9. Developer Tools Check
```
Browser DevTools → Console (F12)

Expected: No red errors or warnings
May see INFO logs, that's fine

Check: Network tab
Expected: Most requests <500ms
Expected: Images optimized (< 200KB)
```

### 10. Lighthouse Performance Check
```
Browser DevTools → Lighthouse

Run audit for:
├─ Performance
├─ Accessibility
├─ Best Practices
└─ SEO

Expected minimum scores:
├─ Performance: 70+
├─ Accessibility: 85+
├─ Best Practices: 85+
└─ SEO: 90+
```

---

## MONITORING & ALERTS SETUP (15 minutes)

### 1. Netlify Monitoring
```
Netlify Dashboard → Analytics

Enable:
├─ Bandwidth monitoring
├─ Function logs
├─ Deployment notifications
└─ Error alerts
```

### 2. Sentry Error Tracking
```
https://sentry.io → Your Organization

Expected:
├─ Issues dashboard populated
├─ Error grouping enabled
├─ Notifications configured
└─ Slack integration (optional)
```

### 3. Database Monitoring
```
Render Dashboard → Your Database

Monitor:
├─ Connection count
├─ Query performance
├─ Storage usage
└─ Backup status
```

### 4. Email Delivery Tracking
```
Resend Dashboard → https://resend.com/emails

Monitor:
├─ Delivery rate
├─ Bounce/complaint rate
├─ Email performance
└─ API usage
```

### 5. Payment Monitoring
```
Flutterwave Dashboard → Transactions

Monitor:
├─ Active transactions
├─ Successful payments
├─ Failed transactions
├─ Webhook deliveries
```

---

## TROUBLESHOOTING GUIDE

### Issue: Build Fails with "Module Not Found"
**Solution:**
```bash
# Reinstall dependencies
npm install --legacy-peer-deps
npm run build

# Check Netlify Node version
# Site Settings → Build & Deploy → Node version should be 18.x
```

### Issue: Database Connection Fails
**Solution:**
```
1. Verify DATABASE_URL is correct
2. Check if Render database is running
3. Verify Netlify IP can access database
4. Add Netlify IP to Render whitelist

Netlify IP whitelist:
├─ Render dashboard → Database → Connections
├─ Allow connections from: 0.0.0.0/0
│   (or specific Netlify IPs if available)
└─ Click "Save Changes"
```

### Issue: Emails Not Sending
**Solution:**
```
1. Verify RESEND_API_KEY is correct
2. Check Resend email limits
3. Review spam folder
4. Check Resend dashboard for delivery errors

Expected: reset-password-abc123@resend.dev
If different, verify sender domain is configured
```

### Issue: File Upload Returns 403
**Solution:**
```
1. Verify AWS_ACCESS_KEY_ID and SECRET are correct
2. Check AWS S3 bucket exists and is accessible
3. Verify bucket policy allows PutObject:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### Issue: CORS Errors in Browser Console
**Solution:**
```
1. Add to your Netlify functions (if needed)
2. Or add CORS headers in Next.js middleware

middleware.ts:
```typescript
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
```

### Issue: Images Not Loading on Production
**Solution:**
```
1. Verify image paths in components
2. Check Next.js Image component configuration
3. Verify public/ folder contents deployed

next.config.js:
```typescript
module.exports = {
  images: {
    domains: ['yourdomain.com', 's3.amazonaws.com'],
  },
};
```

### Issue: WebSocket Connection Fails
**Solution:**
```
1. WebSocket not yet integrated (post-launch feature)
2. Currently using HTTP polling is fine
3. For real-time features, configure Socket.IO:

netlify.toml:
[functions]
  node_bundler = "esbuild"
```

---

## POST-LAUNCH CHECKLIST

### Day 1 (Launch Day)
- [ ] All health checks passing
- [ ] User signups working
- [ ] Email verification working
- [ ] Payment processing working
- [ ] No critical errors in Sentry
- [ ] Database backups running
- [ ] Monitoring alerts configured
- [ ] Team notified of launch

### Day 2-7 (First Week)
- [ ] Monitor error logs daily
- [ ] Check database performance
- [ ] Monitor email delivery
- [ ] Gather user feedback
- [ ] Fix any critical bugs immediately
- [ ] Document any new issues
- [ ] Update API documentation

### Week 2+ (After Launch)
- [ ] Analyze user data
- [ ] Optimize slow endpoints
- [ ] Implement user feedback features
- [ ] Plan post-launch features (mobile app, real-time, etc.)
- [ ] Scale infrastructure if needed

---

## SUCCESS INDICATORS

✅ **Technical Success:**
- Zero critical errors for 48 hours post-launch
- Average API response time < 500ms
- Page load time < 2 seconds
- 99.5%+ uptime
- All features working as expected

✅ **User Success:**
- First 100 users sign up
- 50%+ complete onboarding
- 80%+ enroll in at least one course
- No major complaints in feedback
- Mobile users report good experience

---

## ROLLBACK PLAN

If anything goes critically wrong:

```bash
# Netlify will automatically keep previous deploy
# Go to: Netlify Dashboard → Deploys

# To rollback:
1. Find previous successful deploy
2. Click "Publish deploy"
3. Netlify will revert to previous version instantly
4. Time to rollback: < 1 minute
```

**No data loss:** Database is separate from code deployment

---

## SUPPORT CONTACTS

**During Launch:**
- Netlify Support: https://support.netlify.com
- Render Support: https://support.render.com
- Resend Support: https://resend.com/support
- Flutterwave Support: https://flutterwave.com/support
- AWS Support: https://console.aws.amazon.com/support

---

## FINAL NOTES

- **This is a production system.** Monitor it.
- **Have a backup plan.** Know how to rollback.
- **Listen to users.** They'll tell you what's broken.
- **Celebrate!** This is a real launch of a real product.

**You've got this! 🚀**

---

*Deploy time: ~60-90 minutes from start to live*  
*Post-deployment validation: ~30 minutes*  
*Total time to launch: 2 hours*
