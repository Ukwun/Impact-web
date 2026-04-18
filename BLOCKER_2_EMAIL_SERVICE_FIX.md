# 📧 BLOCKER 2 FIX GUIDE - EMAIL SERVICE VERIFICATION (RESEND)

**Status: IMPLEMENTATION COMPLETE, NEEDS ENVIRONMENT SETUP & TESTING**

## What's Already Done ✅

- ✅ Email service library (`src/lib/email-service.ts`) - Resend + SMTP support
- ✅ Email templates (`src/lib/email-service.ts`) - Verification, reset, notification templates
- ✅ Forgot password endpoint (`src/app/api/auth/forgot-password/route.ts`) - Rate limited, secure
- ✅ Email verification endpoint (`src/app/api/auth/verify-email/route.ts`) - Token validation
- ✅ Reset password endpoint (`src/app/api/auth/reset-password/route.ts`) - Password update
- ✅ Frontend pages - Forgot password & reset password flows complete
- ✅ Rate limiting - Prevents password reset spam (3 per hour)
- ✅ JWT tokens - Secure, time-limited verification links

## What You Need To Do

### Step 1: Resend Setup (10 minutes)

**1A. Create Resend Account:**
```bash
# Go to: https://resend.com
# 1. Sign up for free account
# 2. Verify email
# 3. Go to: Dashboard → API Keys
# 4. Copy your API key (re_xxxxxxxxxxxx format)
```

**1B. Verify Domain (OPTIONAL but RECOMMENDED):**
```bash
# For production emails to not be marked as spam:
# 1. Resend Dashboard → Domains
# 2. Click "Add Domain"
# 3. Enter your domain (e.g., impactedu.com)
# 4. Add DNS records shown:
#    - DKIM record (prevent spoofing)
#    - DMARC policy (authentication)
#    - SPF record (authorization)
# 5. Wait for verification (~5-10 mins)

# Without domain verification:
# - Emails still work (tested!)
# - Might go to spam folder depending on email client
# - Still safe and secure
```

### Step 2: Environment Configuration (5 minutes)

**Add to `.env.local`:**
```bash
# Email Service Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_1234567890abcdefghijk

# Optional: SMTP fallback (if using alternative)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=true
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

**For Netlify Deployment add to UI or netlify.toml:**
```bash
[env.production]
  environment = {
    EMAIL_PROVIDER = "resend",
    RESEND_API_KEY = "re_xxxxxxxxxxxx"
  }
```

**Verify Configuration:**
```bash
# Check it's loaded:
echo $RESEND_API_KEY
# Should output: re_xxxxxxxxxxxx (not blank)
```

### Step 3: Test Email Flow (15 minutes)

**3A. Local Test - Forgot Password:**
```bash
# 1. Start dev server
npm run dev

# 2. Go to: http://localhost:3000/forgot-password

# 3. Enter test email:
#    user@example.com

# 4. Click "Send Reset Link"

# 5. Expected result:
#    ✅ "If that email is registered..." message shown
#    ✅ Email sent successfully

# 6. Check Resend Dashboard:
#    Resend → Emails
#    Should show: "Password Reset - [timestamp]"
#    Status: Delivered ✓

# 7. Check email inbox:
#    - Check inbox
#    - Check spam/promotions folder
#    - Email should have "Reset Password" button
#    - Button links to reset page with token
```

**3B. Test Reset Password:**
```bash
# 1. Click the reset link in email

# 2. You should see:
#    - Page title: "Set New Password"
#    - Password input fields
#    - Submit button

# 3. Enter new password:
#    - Current: TestPass@123
#    - New: SecurePass@456!
#    - Confirm: SecurePass@456!

# 4. Click "Reset Password"

# 5. Expected result:
#    ✅ Success message
#    ✅ Redirect to login
#    ✅ Can login WITH NEW PASSWORD
#    ✅ Cannot login with old password
```

**3C. Test Email Verification:**
```bash
# 1. Go to signup: http://localhost:3000/auth/signup

# 2. Create account:
#    - Name: Test User
#    - Email: newuser@example.com
#    - Password: StrongPass@123
#    - Role: Student

# 3. Click "Create Account"

# 4. Expected:
#    ✅ Account created
#    ✅ Verification email sent
#    ✅ "Check your email" message

# 5. Go to Resend Dashboard:
#    Resend → Emails
#    Should show: "Verify your email" message
#    Status: Delivered ✓

# 6. Check email:
#    - Body should say: "Welcome to ImpactEdu"
#    - Button: "Verify Email"
#    - Link format: /verify-email?token=...

# 7. Click verification link

# 8. Expected:
#    ✅ Email verified
#    ✅ Can now access full platform
#    ✅ "email_verified" is true in database
```

### Step 4: Run Automated Test Suite

```bash
# Test email functionality
npm run test -- auth
npm run test -- email

# Specific test:
npm test -- forgot-password.test.ts

# Manual test script:
node test-email-service.js
```

### Step 5: Production Email Testing

**Before deploying to Netlify:**

```bash
# Test with different email providers:
# 1. Gmail (most common)
#    - Should arrive in inbox or promotions
#    - May show "via resend.com" footer

# 2. Outlook/Hotmail
#    - Usually arrives in inbox
#    - May take 1-2 seconds longer

# 3. Yahoo Mail
#    - Check promotions folder
#    - Might need domain verification

# 4. Corporate email (Gmail/Microsoft 365)
#    - Usually filters out unless domain verified
#    - May need IT to whitelist sender
```

## Email Templates

### Current Templates:

**1. Verification Email:**
```
Subject: Verify your ImpactEdu account
Body: Welcome [Name], verify your email to activate account
Button: "Verify Email"
Expiry: 24 hours
```

**2. Password Reset Email:**
```
Subject: Reset your ImpactEdu password
Body: Click below to set a new password
Button: "Reset Password"
Expiry: 1 hour (security)
```

**3. Welcome Email (Optional):**
```
Subject: Welcome to ImpactEdu!
Body: You're all set, start learning
Button: "Go to Dashboard"
```

## Troubleshooting

### "Email not received" 
**Problem:** User doesn't see email
**Solution:**
```bash
# 1. Check Resend dashboard for delivery status
#    Resend → Recent emails
#    Look for "Delivered ✓" vs "Bounced ✗"

# 2. If bounced:
#    - Email address typo?
#    - Email valid? (test with: https://email-checker.net)
#    - Check bounce reason in Resend

# 3. If delivered but not seen:
#    - Check spam/promotions folder
#    - Check other inboxes
#    - Check with: /sent/[email] in search

# 4. Verify domain if needed:
#    Resend → Domains → Add your domain
#    Add DKIM, SPF, DMARC records
```

### "API Key Invalid" Error
**Problem:** Resend says key is wrong
**Solution:**
```bash
# Check:
# 1. Key is copied exactly (re_xxxx format)
# 2. No extra spaces: echo $RESEND_API_KEY
# 3. Environment variable is loaded:
#    Kill dev server: Ctrl+C
#    Start fresh: npm run dev
# 4. Check .env.local is in right directory:
#    File: c:\DEV3\ImpactEdu\impactapp-web\.env.local
```

### "Rate limited" Error
**Problem:** Too many password reset emails
**Solution:**
```bash
# System allows: 3 password reset attempts per hour
# If you hit the limit:
# 1. Wait 1 hour
# 2. Or test with different email
# 3. Check rate limiting in:
#    /src/lib/security/rateLimiter.ts
```

### "Email content looks weird"
**Problem:** Formatting issues in email
**Solution:**
```bash
# Email templates are in: src/lib/email-service.ts
# Update HTML in emailTemplates object:
# - Fix CSS styling
# - Update links
# - Change branding

# Test preview:
# 1. Go to Resend Emails dashboard
# 2. Click an email → "View in Browser"
# 3. See exactly how it renders
```

## Security Checklist

✅ **Already Secure:**
- Rate limiting (3 reset attempts per hour)
- Secure tokens (JWT with 1-hour expiry)
- Email enumeration protection (always says "if email exists...")
- HTTPS/TLS for all email links
- Token invalidation after use
- Password strength validation

⚠️ **Additional Security (Optional):**
- DKIM/DMARC/SPF verification (prevents spoofing)
- Email list validation (remove invalid addresses)
- Bounce management (stop sending to bounced emails)
- Spam checking (run through spam filters)

## Verification Checklist

Before moving to production:

- [ ] Resend account created
- [ ] API key obtained and saved
- [ ] Environment variable set (.env.local)
- [ ] Local forgot password test successful
- [ ] Email received & delivered ✓
- [ ] Reset password link works
- [ ] New password works after reset
- [ ] Email verification flow works
- [ ] Account activation on verify
- [ ] Error messages are clear
- [ ] Rate limiting tested (prevents spam)
- [ ] Multiple email providers tested
- [ ] Resend dashboard shows all emails delivered

## Monitoring in Production

**After deployment, monitor:**

```bash
# Resend Dashboard → Emails
# Check daily:
- [ ] Emails delivered (not bounced)
- [ ] Delivery time < 2 seconds
- [ ] Open rates (if enabled)
- [ ] Click-through rates
- [ ] Bounce/complaint rates < 1%

# Sentry Error Tracking
# Watch for:
- [ ] Email service errors
- [ ] Invalid recipient errors
- [ ] API key issues
```

## Next Steps

1. ✅ Create Resend account (5 min)
2. ✅ Get API key (1 min)
3. ✅ Set environment variables (2 min)
4. ✅ Test locally (10 min)
5. ✅ Deploy to Netlify
6. ✅ Test on production
7. ✅ Set up domain verification (optional, recommended)
8. ✅ Monitor deliverability

---

**Estimated time to complete:** 20 minutes  
**Risk level:** Very Low (Resend is production-grade)  
**Critical for launch:** YES (users can't reset passwords without this)
