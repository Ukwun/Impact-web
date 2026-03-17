# ImpactEdu Production Deployment Guide

**Last Updated:** March 17, 2026  
**Status:** ✅ All 3 Critical Blockers Fixed - Ready for Testing & Deployment

---

## 🎯 What Was Fixed

### **BLOCKER #1: Demo User Persistence** ✅
**Status:** RESOLVED  
**What Changed:**
- Updated `package.json` postinstall script to run database seed
- Demo users now persist in PostgreSQL database (not just memory)
- Demo accounts survive across server restarts

**Demo Credentials:**
```
Email: student@demo.com    | Password: Demo@123 | Role: STUDENT
Email: facilitator@demo.com | Password: Demo@123 | Role: FACILITATOR  
Email: mentor@demo.com      | Password: Demo@123 | Role: MENTOR
```

**How to Test:**
```bash
# 1. Start dev server
npm run dev

# 2. In browser: http://localhost:3000/login
# 3. Login with student@demo.com / Demo@123
# 4. Stop server (Ctrl+C)
# 5. Start server again
# 6. User should still be able to login ✅
```

---

### **BLOCKER #2: Rate Limiting Persistence** ✅
**Status:** RESOLVED  
**What Changed:**
- Added `REDIS_URL` to environment configuration
- Rate limiting now uses Redis for persistence
- Failed login attempts trigger 15-minute lockout that survives server restart
- Graceful fallback to in-memory if Redis unavailable

**Environment Setup:**
```bash
# .env.local (already configured)
REDIS_URL=redis://localhost:6379
```

**For Production:**
```
REDIS_URL=redis://<username>:<password>@<redis-host>:6379
```

**How to Test:**
```bash
# Without Redis (development mode)
npm run dev
# Try 6 failed logins - should get "Too many attempts" error on 6th try
# Stop server and restart
# Rate limit should be gone (in-memory fallback)

# With Redis (best for production)
# 1. Start Redis server: redis-server
# 2. npm run dev
# 3. Try 6 failed logins - get locked out
# 4. Stop server (not Redis)
# 5. npm run dev again
# 6. Rate limit persists ✅ (Redis holds the data)
```

---

### **BLOCKER #3: WebSocket Integration** ✅
**Status:** RESOLVED  
**What Changed:**
- Created `WebSocketInitializer` component to initialize Socket.IO on app load
- Added client-side event listeners for all real-time features:
  * Notifications (grades, enrollments, achievements)
  * Mentor-mentee messaging
  * User presence indicators
  * Leaderboard updates
  * Class updates
- Integrated into `ClientLayout` for automatic initialization

**Environment Setup:**
```bash
# .env.local (already configured)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

**For Production:**
```
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

**How to Test WebSocket:**
```bash
# Terminal 1: Start Socket.IO server
npm run dev:socket

# Terminal 2: Start Next.js dev server
npm run dev

# Browser 1: http://localhost:3000/login
# Login as student@demo.com

# Browser 2: http://localhost:3000/login
# Login as facilitator@demo.com

# In Facilitator browser: Give student an assignment grade
# Watch Browser 1: You should see real-time notification ✅
```

---

## 🚀 How to Deploy to Netlify

### **Step 1: Push to GitHub** (Already Done ✅)
```bash
git status  # Should show "working tree clean"
```

### **Step 2: Connect to Netlify**

**Option A: Automatic (Recommended)**
```bash
# If already connected to Netlify, Netlify will automatically:
# 1. Detect your commit
# 2. Run build: npm run build
# 3. Deploy to production

# Monitor deployment at: https://app.netlify.com/sites/[your-site-name]/deploys
```

**Option B: Manual Deployment**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Authenticate
netlify login

# 3. Deploy
netlify deploy

# Select:
# - Build directory: .next
# - Publish directory: .next
```

### **Step 3: Configure Netlify Environment Variables**

Go to: `Settings → Build & Deploy → Environment Variables`

Add these variables:
```
DATABASE_URL=postgresql://...                    # Your Render PostgreSQL URL
JWT_SECRET=<generate-32-char-secure-string>     # Generate new secure key
REDIS_URL=redis://<host>:<port>                 # Your Redis instance
AWS_ACCESS_KEY_ID=***                           # AWS S3 credentials
AWS_SECRET_ACCESS_KEY=***                       # AWS S3 credentials
AWS_S3_BUCKET=impactedu-uploads                 # S3 bucket name
AWS_REGION=us-east-1                            # S3 region
RESEND_API_KEY=re_***                           # Resend email API key
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com   # Your production domain
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com # Your production domain
NODE_ENV=production                             # Not development
```

### **Step 4: Test Production Build**

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Should see no errors
# Test login: student@example.com / Test@1234
```

### **Step 5: Monitor Deployment**

**First Hour:**
- Watch error rate in Sentry (if configured)
- Monitor page load times
- Check database query performance
- Verify API responses

**First Day:**
- Monitor concurrent users
- Check error logs
- Monitor database connection pool
- Verify rate limiting in Redis

---

## 📋 Pre-Deployment Checklist

### **Code & Build**
- [ ] All TypeScript compiles without errors: `npm run type-check`
- [ ] No ESLint warnings: `npx eslint src --max-warnings 0`
- [ ] Production build succeeds: `npm run build`
- [ ] No console errors in dev: `npm run dev`

### **Database**
- [ ] PostgreSQL connection works
- [ ] Database migrations applied: `npm run db:push`
- [ ] Demo users exist in database
- [ ] Can login with demo credentials

### **Redis**
- [ ] Redis connection works (optional but recommended)
- [ ] Rate limiting persists across restart
- [ ] No errors in logs

### **WebSocket**
- [ ] Socket.IO server starts: `npm run dev:socket`
- [ ] Client connects successfully
- [ ] Events can be emitted
- [ ] Real-time updates work (test mentor chat)

### **Security**
- [ ] All secrets in .env (not hardcoded)
- [ ] JWT_SECRET is 32+ characters
- [ ] HTTPS enforced
- [ ] CORS headers correct
- [ ] Rate limiting active

### **Performance**
- [ ] Page load: <2 seconds
- [ ] API response: <500ms
- [ ] Database queries: <100ms
- [ ] No N+1 query problems

---

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# With coverage
npm test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Load testing (requires k6)
k6 run load-test.js
```

---

## 🔐 Security Verification

Before launching, verify:

```bash
# 1. Check for hardcoded secrets
grep -r "password\|secret\|key\|token" src --include="*.ts" --include="*.tsx" | grep -v "environment\|.env"

# 2. Verify all passwords hashed
grep -r "plaintext\|plainPassword" src --include="*.ts" --include="*.tsx"

# 3. Check HTTPS enforcement
grep -r "http://" src --include="*.ts" --include="*.tsx" | grep -v "localhost\|127.0.0.1"

# 4. Verify CSRF tokens used
grep -r "csrf\|CSRF" src --include="*.ts" --include="*.tsx" | head -5
```

---

## 🆘 Troubleshooting

### Demo Users Not Logging In
```bash
# 1. Check if database has demo users
npm run db:seed

# 2. Verify database connection works
npm run db:push

# 3. Check error logs for authentication failures
```

### Rate Limiting Not Working
```bash
# 1. Check Redis connection
redis-cli ping  # Should respond with "PONG"

# 2. Verify REDIS_URL in .env
echo $REDIS_URL

# 3. Check rate limiter logs in dev console
npm run dev  # Look for "Rate limit exceeded" messages
```

### WebSocket Not Connecting
```bash
# 1. Start Socket.IO server
npm run dev:socket

# 2. Check browser console for connection errors
# 3. Verify NEXT_PUBLIC_SOCKET_URL matches server address
# 4. Check firewall/network for WebSocket port
```

### Build Fails on Netlify
```bash
# 1. Test build locally
npm run build

# 2. Check build logs for specific errors
# 3. Common issues:
#    - Missing environment variables
#    - TypeScript errors
#    - Missing dependencies: npm install

# 4. Clear Netlify cache and redeploy
```

---

## 📞 Support

**Document Latest Status:**
- All 3 critical blockers: ✅ RESOLVED
- Ready for: User Acceptance Testing (UAT)
- Next step: Load testing & security audit
- Timeline to production: 1-2 weeks

**Issues Found?**
- Document the issue
- Include error logs
- Include reproduction steps
- Include affected users/browsers
