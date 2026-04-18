# 🚀 CRITICAL BLOCKERS - MASTER IMPLEMENTATION PLAN
**Impact Edu Launch Sprint - April 18-25, 2026**

---

## EXECUTIVE SUMMARY

**Goal:** Fix 3 critical blockers to make platform production-ready  
**Current Status:** Code 85% done, missing environment setup & testing  
**Time Available:** 7-10 days until launch  
**Team:** 1 developer recommended (can extend to 2 devs for 3-4 days)  

### Blockers Scope

| # | Blocker | Status | Time | Impact |
|---|---------|--------|------|--------|
| 1 | File Upload (AWS S3) | 85% | 4-5h | High - Assignment submissions |
| 2 | Email Service (Resend) | 90% | 2-3h | Critical - Password resets |
| 3 | Dashboard Wiring | 70% | 6-8h | High - Admin functions |
| | | **TOTAL** | **12-16h** | **1-2 days work** |

**All code is implemented. Only needs:**
- Environment variable configuration
- External service testing (AWS, Resend)
- UI component wiring (React)

---

## DETAILED TIMELINE

### DAY 1: BLOCKER 2 - EMAIL SERVICE (2-3 hours)
**Why First:** Easiest, lowest risk, unblocks user authentication

#### 8:00-8:30 AM: Resend Setup (30 min)
```bash
[ ] Go to https://resend.com
[ ] Create account
[ ] Verify email
[ ] Get API key (re_xxxxxxxxxxxx format)
[ ] Save securely
```

#### 8:30-8:45 AM: Environment Configuration (15 min)
```bash
[ ] Open .env.local file
[ ] Add two variables:
    EMAIL_PROVIDER=resend
    RESEND_API_KEY=re_YOUR_KEY_HERE
[ ] Verify: echo $RESEND_API_KEY
```

#### 8:45-9:15 AM: Local Testing (30 min)
```bash
[ ] npm run dev
[ ] Go to http://localhost:3000/forgot-password
[ ] Enter test email: test@gmail.com
[ ] Check inbox for "Reset Password" email
[ ] Verify email contains working reset link
[ ] Test full flow: reset email → new password → login
[ ] Document any issues
```

#### 9:15-9:30 AM: Verification Checklist
```bash
[ ] Email received within 2 seconds
[ ] Email formatted correctly
[ ] Links working (not 404 errors)
[ ] Multiple email providers tested
[ ] Error messages user-friendly
[ ] Rate limiting works (test 4+ resets)
```

✅ **Expected Result:** Users can reset passwords via email

---

### DAY 1-2: BLOCKER 1 - FILE UPLOAD (4-5 hours)

#### 9:30 AM - 10:30 AM: AWS S3 Setup (1 hour)

**Create S3 Bucket:**
```bash
[ ] Go to https://console.aws.amazon.com/s3/
[ ] Click "Create bucket"
[ ] Name: impact-app-uploads-prod
[ ] Region: us-east-1
[ ] Block public access: ✓ (checked)
[ ] Create
[ ] Copy bucket name
```

**Create IAM User:**
```bash
[ ] Go to https://console.aws.amazon.com/iam/
[ ] Users → Create user → impact-app-uploader
[ ] Create access key
[ ] Save Access Key ID & Secret Key
[ ] Attach S3 policy (see BLOCKER_1_FILE_UPLOAD_FIX.md)
```

**Add Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": ["arn:aws:s3:::impact-app-uploads-*/*"]
  }]
}
```

#### 10:30-10:45 AM: Environment Configuration (15 min)
```bash
[ ] Add to .env.local:
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=AKIAIOXXXXX
    AWS_SECRET_ACCESS_KEY=wJalrXUX...
    AWS_S3_BUCKET=impact-app-uploads-prod
```

#### 10:45 AM - 12:00 PM: Testing & Verification (1.25 hours)

**Local Test:**
```bash
[ ] npm run dev
[ ] Navigate to Student Dashboard → Course → Assignment
[ ] Click "Submit Assignment"
[ ] Upload test file (PDF, <10MB)
[ ] Verify upload shows progress bar
[ ] Verify success message
[ ] Check AWS S3 console - file should appear
[ ] Test download via presigned URL
```

**Test Cases:**
```bash
[ ] Valid file upload (PDF, 5MB) - ✅ Should work
[ ] Large file (15MB) - ❌ Should reject
[ ] Invalid type (EXE) - ❌ Should reject  
[ ] Multiple files - ✅ Should allow
[ ] Network interruption - Handle gracefully
```

**Error Handling:**
```bash
[ ] Test unauthorized user (not enrolled)
[ ] Verify 404 on invalid assignment
[ ] Test without AWS credentials
[ ] Test with bad bucket name
```

✅ **Expected Result:** Files upload to S3, stored securely, accessible only to enrolled users

---

### DAY 2: BLOCKER 3 - DASHBOARD WIRING (6-8 hours)

#### 1:00-2:00 PM: Create Course Form Modal (1 hour)

**Create Component:**
```bash
[ ] Create file: src/components/CourseFormModal.tsx
[ ] Include:
    - Form inputs (title, description, difficulty)
    - Form validation
    - Submit handler
    - Loading state
    - Error display
```

**Code Template (see BLOCKER_3_DASHBOARD_WIRING_FIX.md)**

#### 2:00-3:00 PM: Wire Facilitator Dashboard (1 hour)

**Update Page:**
```bash
[ ] File: src/app/dashboard/facilitator/page.tsx
[ ] Changes:
    - Add state for modal
    - Add handleCreateCourse function
    - Replace hardcoded courses with API fetch
    - Wire "Create Course" button to modal
    - Add useEffect to load courses on mount
```

**Test:**
```bash
[ ] Login as facilitator
[ ] Click "+ Create Course" button
[ ] Modal appears
[ ] Fill form and submit
[ ] Course appears in list immediately
[ ] Refresh - course still there
```

#### 3:00-4:00 PM: Create Event Management Page (1 hour)

**Create Admin Events Page:**
```bash
[ ] Create file: src/app/dashboard/admin/events/page.tsx
[ ] Include:
    - Fetch events from /api/admin/events
    - Display events table/list
    - Create Event button
    - Edit button (wire to PUT)
    - Delete button (wire to DELETE)
```

**Create Event Form Modal:**
```bash
[ ] Create file: src/components/EventFormModal.tsx
[ ] Similar to CourseFormModal but for events
```

#### 4:00-5:00 PM: Testing & Refinement (1 hour)

**Test Create Course:**
```bash
[ ] Login as facilitator
[ ] Create new course
[ ] Verify API calls work
[ ] Verify course saves to database
[ ] Verify appears in UI immediately
[ ] Test validation (empty title should fail)
```

**Test Create Event:**
```bash
[ ] Login as admin
[ ] Go to /dashboard/admin/events
[ ] Click Create Event
[ ] Fill form and submit
[ ] Verify event appears in list
[ ] Edit event - verify PUT works
[ ] Delete event - verify DELETE works
```

**Test Error Scenarios:**
```bash
[ ] Non-facilitator tries to create course → 403
[ ] Invalid course data → validation error
[ ] Network error → user-friendly message
[ ] Duplicate course name → OK (allowed)
```

✅ **Expected Result:** Dashboard buttons fully functional, real data persisted

---

### DAY 3: BUILD & FINAL TESTING (4-6 hours)

#### 9:00-10:00 AM: Full Build & Type Check (1 hour)
```bash
[ ] npm run build
[ ] npm run type-check
[ ] Fix any TypeScript errors
[ ] Check build output (no errors)
```

#### 10:00 AM-12:00 PM: Integration Testing (2 hours)

**Full User Workflows:**
```bash
[ ] Signup → Email verification → Login
[ ] Course enrollment → Assignment upload → Submission grading
[ ] Password reset email flow
[ ] Create course (facilitator) → Enroll students → Grade
[ ] Create event (admin) → Students register → Attendance
```

**Cross-Browser Testing:**
```bash
[ ] Chrome (desktop)
[ ] Firefox (desktop)
[ ] Safari (if available)
[ ] Mobile browser (iPhone/Android)
```

**Performance Check:**
```bash
[ ] Page load time: <2 seconds
[ ] API response time: <500ms
[ ] File upload: <5 seconds for 5MB file
[ ] No console errors
```

#### 12:00-1:00 PM: Documentation & Monitoring Setup (1 hour)
```bash
[ ] Verify Sentry error tracking is configured
[ ] Set up Netlify monitoring alerts
[ ] Document any edge cases found
[ ] Create post-launch checklist
```

✅ **Expected Result:** Platform ready for production deployment

---

### DAY 4: DEPLOYMENT (30 min - 2 hours)

#### Environment Variables for Netlify
```bash
Add to Netlify:
[ ] DATABASE_URL
[ ] JWT_SECRET
[ ] AWS_ACCESS_KEY_ID
[ ] AWS_SECRET_ACCESS_KEY
[ ] AWS_S3_BUCKET
[ ] AWS_S3_REGION
[ ] EMAIL_PROVIDER=resend
[ ] RESEND_API_KEY
[ ] NEXT_PUBLIC_API_URL=https://yourdomain.com
```

#### Deployment Steps
```bash
[ ] Push code to GitHub
[ ] Trigger Netlify build
[ ] Monitor build log for errors
[ ] Run smoke tests (login, upload, email)
[ ] Set custom domain
[ ] Configure SSL (auto)
[ ] Enable monitoring
```

---

## DAILY CHECKLIST

### DAY 1
- [ ] Resend account created & API key obtained
- [ ] Email testing successful (password reset works)
- [ ] AWS S3 bucket created & credentials obtained
- [ ] File upload local testing successful

### DAY 2  
- [ ] CourseFormModal component created
- [ ] Facilitator dashboard loads real courses
- [ ] "Create Course" button wired & tested
- [ ] Event management page created
- [ ] Admin can CRUD events

### DAY 3
- [ ] Full build successful (npm run build)
- [ ] No TypeScript errors
- [ ] All workflows tested
- [ ] Cross-browser testing done
- [ ] Performance acceptable

### DAY 4
- [ ] Environment variables configured
- [ ] Deployed to Netlify
- [ ] Production testing complete
- [ ] Monitoring set up

---

## TESTING CHECKLIST

### Blocker 1: File Upload
- [ ] Can upload PDF under 10MB
- [ ] Rejects file over 10MB
- [ ] Rejects invalid file types (EXE, ZIP, etc.)
- [ ] Shows progress bar
- [ ] Shows success message
- [ ] File appears in AWS S3
- [ ] Can download via presigned URL
- [ ] Non-enrolled user cannot upload
- [ ] Error messages clear

### Blocker 2: Email
- [ ] Forgot password email sent
- [ ] Email contains valid reset link
- [ ] Reset link works (not 404)
- [ ] New password set successfully
- [ ] Can login with new password
- [ ] Cannot login with old password
- [ ] Rate limiting works (3 attempts per hour)
- [ ] Signup verification email sent and works

### Blocker 3: Dashboard
- [ ] Facilitator can create course
- [ ] Course appears in dashboard immediately
- [ ] Admin can create event
- [ ] Admin can edit event
- [ ] Admin can delete event
- [ ] All forms validate input
- [ ] All CRUD operations persisted to database
- [ ] Error messages clear and helpful

---

## TROUBLESHOOTING GUIDE

### "Email API key invalid"
```bash
1. Copy EXACT key from Resend dashboard
2. Make sure no extra spaces
3. Restart dev server (npm run dev)
4. Verify: echo $RESEND_API_KEY
```

### "AWS credentials not working"
```bash
1. Check IAM policy is attached
2. Verify bucket name is exact
3. Check region is correct (us-east-1)
4. Restart dev server
5. Check CloudWatch logs in AWS
```

### "Build fails with TypeScript error"
```bash
1. Run: npm run type-check
2. Fix errors in src/
3. Run: npm run build again
4. Check for unused imports/variables
```

### "File upload fails silently"
```bash
1. Check browser console (F12)
2. Check Network tab for API response
3. Verify AWS credentials in .env
4. Check file size (must be <10MB)
5. Verify file type is allowed
```

---

## SUCCESS CRITERIA

**Launch is ready when:**
✅ All 3 blockers pass testing  
✅ Build succeeds: `npm run build`  
✅ No TypeScript errors: `npm run type-check`  
✅ All key workflows tested & working  
✅ Environment variables configured  
✅ Monitoring alerts set up  
✅ Team has rollback plan  

---

## RESOURCE LINKS

**Services:**
- Resend Docs: https://resend.com/docs
- AWS S3 Console: https://console.aws.amazon.com/s3/
- Netlify UI: https://app.netlify.com

**Code Files:**
- Blocker 1 Guide: [BLOCKER_1_FILE_UPLOAD_FIX.md](./BLOCKER_1_FILE_UPLOAD_FIX.md)
- Blocker 2 Guide: [BLOCKER_2_EMAIL_SERVICE_FIX.md](./BLOCKER_2_EMAIL_SERVICE_FIX.md)
- Blocker 3 Guide: [BLOCKER_3_DASHBOARD_WIRING_FIX.md](./BLOCKER_3_DASHBOARD_WIRING_FIX.md)
- Test Suite: `npm run test`
- Blocker Assessment: `node test-blockers-fix.js`

---

## CONTACT & ESCALATION

If you get stuck:

1. **File upload issue?** → Check AWS console → Check S3 bucket → Check IAM policy
2. **Email issue?** → Check Resend dashboard → Verify API key → Check logs
3. **Dashboard issue?** → Check browser console → Check Network tab → Check API response
4. **Build issue?** → Run `npm run type-check` → Fix errors → Rebuild

**Escalation:**
- Critical blocker: Priority #1, must fix before moving forward
- Known workaround available: Can work around, but should fix
- Minor issue: Can fix post-launch

---

**Prepared: April 18, 2026**  
**Target Launch: April 25, 2026**  
**Confidence Level:** HIGH (all code exists, just needs setup + testing)

🚀 **Let's ship this!**
