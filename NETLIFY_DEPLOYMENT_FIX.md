# 🚀 Netlify Deployment Checklist - Render Backend

## ✅ What Was Fixed

Your Netlify frontend is now configured to use the Render backend. Here's what changed:

### Code Changes
- ✅ **Created `src/lib/apiConfig.ts`** - Handles API URL configuration
- ✅ **Created `src/lib/fetchInterceptor.ts`** - Global fetch interceptor (automatically converts all `/api/*` calls)
- ✅ **Updated `src/context/AuthStore.ts`** - Uses new API configuration
- ✅ **Updated `src/components/ClientLayout.tsx`** - Loads fetch interceptor automatically
- ✅ **Updated `.env.example`** - Documents proper env variable setup

### How It Works
Every fetch call to `/api/...` now automatically:
1. Checks for `NEXT_PUBLIC_API_URL` environment variable
2. If set, converts `/api/foo` → `https://impactapp-backend.onrender.com/api/foo`
3. If not set, uses relative URL (for local development)

---

## 📋 Deployment Steps (Do This Now!)

### Step 1: Set Netlify Environment Variable ⚙️

1. **Open Netlify Dashboard:** https://app.netlify.com
2. **Select your site:** `impactweb`
3. **Go to:** Settings → Build & Deploy → Environment
4. **Click:** "Add environment variable"

**Add this variable:**
```
Key:   NEXT_PUBLIC_API_URL
Value: https://impactapp-backend.onrender.com
```

**SAVE** - Do NOT use trailing slash!

### Step 2: Redeploy on Netlify 🚀

1. **Go to:** Deployments tab
2. **Click:** "Trigger deploy" → "Deploy site"
3. Wait for build to complete (~1-2 minutes)

You'll see status change:
- 🟡 Building... 
- 🟢 Published (Done!)

### Step 3: Test Login 🧪

1. **Open:** https://impactweb.netlify.app/auth/login
2. **Try logging in** with test credentials
3. **Open DevTools** (F12) → Console
4. **Watch for:**
   - ✅ `[API Interceptor] Redirecting fetch: /api/auth/login → https://impactapp-backend.onrender.com/api/auth/login`
   - ✅ `POST https://impactapp-backend.onrender.com/api/auth/login 200` (in Network tab)

---

## 🔧 Verify Render Backend is Ready

Before testing login, make sure your Render backend:

1. **Is Running:**
   ```
   curl https://impactapp-backend.onrender.com/health
   ```
   Should return: `200 OK`

2. **Has CORS Configured** for `https://impactweb.netlify.app`:
   - Look in your backend `server.js` or `index.js`
   - Should have something like:
   ```javascript
   cors({
     origin: ['https://impactweb.netlify.app', 'http://localhost:3000'],
     credentials: true
   })
   ```
   - If not configured, update your backend and redeploy

---

## 🐛 If Still Getting Login Error

### Check 1: Is API URL set?
DevTools Console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```
Should show: `https://impactapp-backend.onrender.com`

### Check 2: Is fetch being intercepted?
DevTools Console (during login):
```
[API Interceptor] Redirecting fetch: /api/auth/login → https://impactapp-backend.onrender.com/api/auth/login
```

### Check 3: Network Request
DevTools → Network → Wait for login attempt → Look for:
- `POST` to `https://impactapp-backend.onrender.com/api/auth/login`
- Status should be `200` or `201`
- If `400`/`401`: Check credentials
- If `503`: Render backend is sleeping (free tier)
- If CORS error: Backend CORS not configured

### Check 4: Clear Cache
Hard refresh browser:
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

---

## 📝 Environment Variables Summary

| Variable | Value | Where |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://impactapp-backend.onrender.com` | Netlify Dashboard |

That's the **only** environment variable you need to set on Netlify for the API to work!

---

## ✨ What's Automatic Now

**You don't need to change any code!** The fetch interceptor means:
- All `/api/admin/*` calls → Render backend ✅
- All `/api/auth/*` calls → Render backend ✅
- All `/api/users/*` calls → Render backend ✅
- All other `/api/*` calls → Render backend ✅

---

## 🎯 Next Steps

1. ✅ Set `NEXT_PUBLIC_API_URL` on Netlify Dashboard
2. ✅ Redeploy site on Netlify
3. ✅ Test login at https://impactweb.netlify.app/auth/login
4. ✅ Check browser console for fetch interceptor messages
5. ✅ If error, check Network tab for specific error response

---

**Status:** Ready to deploy! Follow steps above. Should be working in ~5 minutes. 🚀
