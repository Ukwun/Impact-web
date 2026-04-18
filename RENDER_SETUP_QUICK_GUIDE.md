# Create New Render Backend Service - Step by Step

## ✅ STEP 1: Create Service on Render

Go to: https://dashboard.render.com

1. Click **"+ New"** button
2. Select **"Web Service"**
3. **Connect GitHub**
   - Click "Connect account" if not already connected
   - Authorize Render to access your GitHub
4. **Select Repository**: `Ukwun/Impact-web`
5. Click **"Connect"**

---

## ✅ STEP 2: Configure Service Settings

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `impactapp-backend` |
| **Environment** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Region** | Pick closest to you |

---

## ✅ STEP 3: Add Environment Variables

Click the **"Environment"** tab and add these:

```
NODE_ENV=production
JWT_SECRET=generate-a-random-string-here-minimum-32-chars
NEXTAUTH_SECRET=another-random-string-minimum-32-chars
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_API_URL=https://impactapp-backend.onrender.com
```

### How to Generate Random Secrets:
Run in PowerShell:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString())) | Select-Object -First 1
```

---

## ✅ STEP 4: Set Up PostgreSQL Database

You need a PostgreSQL database. **Option A** (Recommended for Render):

1. In Render Dashboard, click **"+ New"**
2. Select **"PostgreSQL"**
3. Create instance with these settings:
   - Name: `impactapp-db`
   - Plan: Free or Starter
4. Once created, copy the **"Internal Database URL"**
5. In your backend service's Environment, set:
   ```
   DATABASE_URL=<paste-the-internal-database-url>
   ```

**Option B** (If you have external database):
- Just paste your existing PostgreSQL connection string in `DATABASE_URL`

---

## ✅ STEP 5: Configure Plan & Deploy

1. Select **plan** at bottom (free tier OK for testing)
2. Click **"Create Web Service"**
3. **Wait for deployment** (5-10 minutes)
4. Watch the logs for any errors

---

## ✅ STEP 6: Get Your New Backend URL

Once deployed:
- Render will show: `https://impactapp-backend-XXXXX.onrender.com`
- Copy this URL - you'll need it for the frontend

---

## ✅ STEP 7: Update Frontend on Netlify

1. Go to: https://app.netlify.com
2. Select your site: `impactweb`
3. Go to **Site Settings** → **Build & Deploy** → **Environment**
4. Add or update variable:
   ```
   NEXT_PUBLIC_API_URL=https://impactapp-backend-XXXXX.onrender.com
   ```
   (Replace XXXXX with your actual service ID)

5. Click **"Save"**
6. Trigger **manual deploy** by going to **Deploys** → **Trigger Deploy**

---

## ✅ STEP 8: Test It!

Once both are deployed:

1. Go to: `https://impactweb.netlify.app/auth/register`
2. Try creating a new account
3. **Should work now!** ✅

Check browser console for any errors.

---

## 🆘 If It Still Doesn't Work

**Check backend is running:**
```bash
curl https://impactapp-backend-XXXXX.onrender.com/api/health
```

Should return `200 OK` (or some response, not 502/503 error)

**Check logs on Render:**
- Render Dashboard → Your service → Logs
- Look for errors in console output

**Common Issues:**
- ❌ DATABASE_URL not set → Database connection error
- ❌ JWT_SECRET not set → Token generation fails
- ❌ Old URL still in Netlify → Requests hit old backend
- ❌ Netlify not redeployed → Still using cached config

---

## 📝 Summary of Changes

**Old Setup:**
- Backend: `https://impactapp-backend.onrender.com` (wrong repo)
- Frontend: `https://impactweb.netlify.app`

**New Setup:**
- Backend: `https://impactapp-backend-XXXXX.onrender.com` (YOUR new service)
- Frontend: `https://impactweb.netlify.app` (no change)
- Both use Impact-web repo ✅
