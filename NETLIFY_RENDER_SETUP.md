# 🚀 Netlify + Render Backend Setup Guide

## Current Setup

- **Frontend:** Netlify (`https://impactweb.netlify.app`)
- **Backend API:** Render (`https://impactapp-backend.onrender.com`)
- **Firebase:** Auth & Firestore services

---

## ✅ Step 1: Configure Environment Variables on Netlify

Your frontend must know about the Render backend URL. Here's how to set it up:

### Go to Netlify Dashboard

1. **Open** https://app.netlify.com
2. **Select** your site: `impactweb`
3. **Click** "Site Settings" (top bar)
4. **Go to** "Build & Deploy"
5. **Click** "Environment"

### Add Environment Variable

Click **"Add environment variable"** and add:

```
Key: NEXT_PUBLIC_API_URL
Value: https://impactapp-backend.onrender.com
```

**Don'tforgot the trailing slash!**

### Redeploy

After setting the variable:
1. Go to "Deployments" tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for build to complete (usually 1-2 minutes)

---

## ✅ Step 2: Check CORS Configuration on Render Backend

Your Render backend must allow requests from `https://impactweb.netlify.app`.

### Check your Render backend's CORS settings

In your backend code (usually `server.js` or similar), look for CORS configuration:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://impactweb.netlify.app',  // Add this
    'http://localhost:3000',           // Keep for dev
    'http://localhost:3001'            // Keep if needed
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

**If you don't have CORS configured or don't see your frontend URL:**
1. Update your Render backend to include the Netlify URL
2. Redeploy the Render backend
3. Test again from Netlify

---

## ✅ Step 3: Test the Login Flow

### Open Browser DevTools (F12)

1. Go to `https://impactweb.netlify.app/auth/login`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try logging in with test credentials

### Expected Behavior

✅ **Should see:**
```
POST https://impactapp-backend.onrender.com/api/auth/login 200 OK
```

❌ **If you see errors:**
- `Failed to fetch` or `CORS error` - Backend CORS not configured
- `400 Bad Request` - Validation error (check credentials format)
- `401 Unauthorized` - Invalid credentials

---

## 🔧 Troubleshooting

### Issue 1: "Failed to fetch" or CORS errors

**Problem:** Browser is blocked from calling the backend

**Solution:**
1. Check Render backend CORS configuration
2. Ensure `https://impactweb.netlify.app` is in the allowed origins
3. Redeploy the backend after changing CORS
4. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)

### Issue 2: "Login successful! Redirecting..." but stays on login page

**Problem:** Login succeeds but redirect fails

**Likely causes:**
- Wrong API URL configured (check Netlify env vars)
- Token not being set in localStorage
- Redirect URL is incorrect

**Debug steps:**
1. Open DevTools → Console
2. Type: `localStorage.getItem('auth_token')` - should show a token
3. Type: `localStorage.getItem('auth_user')` - should show user object
4. If empty, the login request succeeded but token wasn't saved

### Issue 3: Can't reach backend at all

**Problem:** API requests timeout or fail immediately

**Solutions:**
1. **Check Netlify env vars:** Make sure `NEXT_PUBLIC_API_URL` is set correctly
2. **Check Render is running:** Visit `https://impactapp-backend.onrender.com/health` - should return 200
3. **Check internet connection:** Backend might be sleeping (Render free tier sleeps)
4. **Check firewall:** Try from different network

### Issue 4: "Invalid input" or "Validation failed" (400 error)

**Problem:** Request format doesn't match backend expectations

**Solution:**
1. Your login endpoint might expect different field names
2. Check `/api/auth/login` route in your backend for validation schema
3. Ensure email/password are being sent correctly

---

## 📋 Quick Verification Checklist

Before assuming it's broken:

- [ ] **Environment variable set on Netlify Dashboard** - `NEXT_PUBLIC_API_URL=https://impactapp-backend.onrender.com`
- [ ] **Netlify site redeployed** after setting env var
- [ ] **Render backend is running** - test with `curl https://impactapp-backend.onrender.com/health`
- [ ] **CORS configured on backend** - includes `https://impactweb.netlify.app`
- [ ] **Render backend redeployed** after CORS changes
- [ ] **Browser cache cleared** - Hard refresh (Cmd+Shift+R)
- [ ] **DevTools Console shows POST to Render URL** - not localhost

---

## 🔐 Security Notes

- `NEXT_PUBLIC_API_URL` is visible in browser (okay, it's your public backend URL)
- Never expose API secrets or database credentials in `NEXT_PUBLIC_*` variables
- Keep sensitive credentials in server-side only env vars

---

## 📞 If Still Stuck

1. **Check Network Tab:** DevTools → Network → Try login → Look for `/api/auth/login` request
2. **Check Response:** Click the request → Response tab → See actual error message
3. **Check Status Code:**
   - 200-201: Success (check token in Response)
   - 400: Bad request (check request format)
   - 401: Unauthorized (credentials wrong)
   - 403: Forbidden (permission denied)
   - 404: Not found (wrong endpoint)
   - 5xx: Server error (backend issue)

4. **Render Backend Status:** Check https://status.render.com/ for incidents

---

**Last Updated:** Today  
**Setup Time:** ~5 minutes including redeployment
