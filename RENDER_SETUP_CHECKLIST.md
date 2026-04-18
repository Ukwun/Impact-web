# Render Backend Setup Checklist

## Phase 1: Create Backend Service ⚙️

- [ ] Go to https://dashboard.render.com
- [ ] Click "+ New" → "Web Service"
- [ ] Connect GitHub to Render (authorize if needed)
- [ ] Select repository: `Ukwun/Impact-web`
- [ ] Click "Connect"

## Phase 2: Configure Service 🔧

- [ ] Set Name: `impactapp-backend`
- [ ] Set Build Command: `npm run build`
- [ ] Set Start Command: `npm start`

## Phase 3: Add Environment Variables 🔐

- [ ] Click "Environment" tab
- [ ] Add `NODE_ENV=production`
- [ ] Add `JWT_SECRET=<random-string-32-chars-min>`
- [ ] Add `NEXTAUTH_SECRET=<random-string-32-chars-min>`
- [ ] Add `NEXT_PUBLIC_API_URL=https://impactapp-backend.onrender.com`

## Phase 4: Set Up Database 🗄️

### One of these:

**Option A: Create PostgreSQL on Render** 
- [ ] In Render, click "+ New" → "PostgreSQL"
- [ ] Create instance named `impactapp-db`
- [ ] Copy "Internal Database URL"
- [ ] Add to backend environment: `DATABASE_URL=<paste-url>`

**Option B: Use Existing Database**
- [ ] Paste PostgreSQL connection string in: `DATABASE_URL=<your-connection>`

- [ ] Verify connection string is correct

## Phase 5: Deploy Backend Service ✈️

- [ ] Select pricing plan at bottom (Free OK for testing)
- [ ] Click "Create Web Service"
- [ ] **Wait 5-10 minutes for deployment**
- [ ] Check that status shows "Live" (green checkmark) ✅
- [ ] Copy the URL from service page: `https://impactapp-backend-XXXXX.onrender.com`

## Phase 6: Update Frontend Configuration 🎨

- [ ] Go to https://app.netlify.com
- [ ] Select site: `impactweb`
- [ ] Go to **Site Settings** → **Build & Deploy** → **Environment**
- [ ] Add/Update: `NEXT_PUBLIC_API_URL=https://impactapp-backend-XXXXX.onrender.com`
- [ ] Go to **Deploys** → Click "Trigger deploy"
- [ ] Wait for Netlify to redeploy (2-3 minutes)

## Phase 7: Test Everything 🧪

- [ ] Backend is running (check logs show no errors)
- [ ] Frontend is redeployed (check logs show new deploy)
- [ ] Go to: `https://impactweb.netlify.app/auth/register`
- [ ] Create a test account with:
  - Email: `test@example.com`
  - Password: Something secure
- [ ] Should redirect to dashboard ✅

## Phase 8: Verify Working ✨

- [ ] Registration works (user created in backend)
- [ ] Login works (gets real JWT token)
- [ ] Can access dashboard
- [ ] No console errors in browser DevTools

---

## ⚠️ Troubleshooting

**If backend deployment fails:**
- [ ] Check Render service logs for errors
- [ ] Verify DATABASE_URL is set correctly
- [ ] Verify JWT_SECRET and NEXTAUTH_SECRET are set

**If frontend still can't reach backend:**
- [ ] Check browser console for API errors
- [ ] Verify NEXT_PUBLIC_API_URL on Netlify matches actual backend URL
- [ ] Trigger Netlify redeploy after updating env vars
- [ ] Wait 5 minutes for Netlify cache to clear

**If registration still fails:**
- [ ] Check backend logs: `https://dashboard.render.com` → Logs
- [ ] Check frontend console: Browser DevTools → Console tab
- [ ] Verify database connection is working

---

## 📊 Status Tracking

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ___ | https://impactweb.netlify.app |
| Backend | ___ | https://impactapp-backend-XXXXX.onrender.com |
| Database | ___ | _____ |

Update status as you complete each step!
