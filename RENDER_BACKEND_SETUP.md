# Render Backend Setup for Impact-Web

## Step 1: Create New Render Service

1. Go to https://dashboard.render.com
2. Click **"+ New"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: **`Ukwun/Impact-web`**
5. Click **"Connect"**

## Step 2: Configure Service

### Basic Settings
- **Name**: `impactapp-backend` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Select closest to your users (e.g., `us-east-1`)
- **Branch**: `master`

### Build & Start Commands
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Plan
- Select appropriate plan (Free tier works for testing, $7+/month for production)

## Step 3: Set Environment Variables

Click **"Environment"** and add these variables:

```
DATABASE_URL=postgresql://[your-connection-string]
REDIS_URL=redis://[your-redis-url]  (optional, for Socket.IO clustering)
NEXTAUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://impactapp-backend.onrender.com
```

### Required Variables Explained:
- **DATABASE_URL**: PostgreSQL or similar database connection string
- **REDIS_URL**: Optional, for real-time Socket.IO across multiple instances
- **JWT_SECRET**: Used for authentication tokens
- **NEXT_PUBLIC_API_URL**: Frontend will use this to call your backend

## Step 4: Configure Database (if needed)

If you don't have a database yet:

1. Create PostgreSQL database on Render:
   - Go to Render Dashboard
   - Click **"+ New"** → **"PostgreSQL"**
   - Create instance
   - Copy connection string to `DATABASE_URL`

2. Run migrations on first deploy:
   - Render will run `npm run build` which includes Prisma generation
   - Manually run migrations if needed via Render Shell

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will start building automatically
3. **Wait for deployment to complete** (5-10 minutes)
4. Once deployed, you'll see:
   - ✅ Service is live on `https://impactapp-backend-xxx.onrender.com`
   - Copy this URL

## Step 6: Update Frontend

1. Go to Netlify Dashboard
2. Site Settings → Environment
3. Update or add:
   ```
   NEXT_PUBLIC_API_URL=https://impactapp-backend-xxx.onrender.com
   ```
4. Trigger manual redeploy

## Step 7: Test Connection

Test your new backend is working:

```bash
# Test from browser or curl:
curl https://impactapp-backend-xxx.onrender.com/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```

Should return user data or proper error (not 502, 503).

---

## Troubleshooting

### Service Won't Build
- Check build logs in Render dashboard
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Prisma schema issues

### Service Deployed but Errors
- Check logs: Render Dashboard → Logs
- Common issues:
  - Database connection failed
  - Missing JWT_SECRET

### Cold Starts (slow first request)
- Normal on free tier
- Upgrade plan for faster performance

---

## What Gets Deployed

Your Impact-web repo includes:
- ✅ Next.js frontend (served at `/`)
- ✅ API routes (`/api/*`)
- ✅ Socket.IO for real-time features
- ✅ Database models (Prisma)
- ✅ Authentication system

All run together from a single Render service!

---

## Next: Update Frontend URL

Once backend is live:

1. **Frontend URL**: `https://impactweb.netlify.app`
2. **Backend URL**: `https://impactapp-backend-xxx.onrender.com`

Frontend already handles API routing via `getApiUrl()` function, so all API calls will automatically use the Render backend.
