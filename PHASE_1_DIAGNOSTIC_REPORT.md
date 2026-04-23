# Phase 1 Setup: Diagnostic Report & Next Steps

## Current Status ⚠️

**Database Connection:** UNREACHABLE  
**Database Service:** Render PostgreSQL (Cloud)  
**Connection String:** `dpg-d7hkc66gvqtc738o11ig-a.oregon-postgres.render.com:5432`  
**Error:** Can't reach database server

---

## Diagnosis: 3 Possible Causes

### 1. Render Service is Down or Expired ⚠️ (Most Likely)
**Check:** 
- Login to https://render.com
- Check if your PostgreSQL instance still exists
- Check if it shows "Suspended" or "Inactive"
- Free tier databases are often suspended after 30 days of inactivity

**Solution A: Reactivate Render Database**
1. Go to https://render.com/dashboard
2. Find your database: "impactweb_db"
3. If suspended, click "Restart" 
4. Wait 30-60 seconds for it to come online
5. Try connecting again

**Solution B: Create New Render Database (Recommended if suspended)**
```bash
# 1. Go to https://render.com
# 2. Create new PostgreSQL database
# 3. Copy the connection string
# 4. Update .env and .env.local with new DATABASE_URL
# 5. Run: npx prisma db push --skip-generate
```

### 2. Network/Network Firewall Issue
**Check:**
- Try opening in browser: `google.com` - can you access internet?
- Check if you're behind a corporate firewall
- Check Windows Firewall settings

**Solution:**
- Restart your internet connection
- Disable VPN if using one temporarily
- Check firewall is not blocking PostgreSQL port 5432

### 3. Invalid Database Credentials
**Check:**
- Verify DATABASE_URL in .env is correct
- Check for typos in password (especially special characters)
- Verify username and database name

**Current Credentials:**
```
Host: dpg-d7hkc66gvqtc738o11ig-a.oregon-postgres.render.com
Port: 5432
Username: impactweb_db_user
Password: BSuROsJMrhsUa4PlOAao7VKWIShiiyOc (verify this looks right)
Database: impactweb_db
```

---

## Quick Tests to Run

### Test 1: Network Connectivity
```powershell
# Can you reach the database host?
Test-NetConnection -ComputerName "dpg-d7hkc66gvqtc738o11ig-a.oregon-postgres.render.com" -Port 5432
```

Expected output: `TcpTestSucceeded : True`

### Test 2: Verify .env is loaded
```bash
npx prisma --version
# Should show: @prisma/client@5.20.0
```

### Test 3: Check connection string syntax
```bash
# This will show if there are any syntax errors in DATABASE_URL
npm run build
# Errors will mention DATABASE_URL if invalid
```

---

##  Immediate Action Plan

### Option 1: Quick Fix (If Render is Just Suspended)
**Time:** 5-10 minutes
```bash
# 1. Visit https://render.com
# 2. Click Resources
# 3. Find "impactweb_db"
# 4. Click "Restart"
# 5. Wait 60 seconds
# 6. Run:
npx prisma db push --skip-generate
```

### Option 2: Create Fresh Database (If Render Service Dead)
**Time:** 15-20 minutes
```bash
# 1. Go to https://render.com/dashboard
# 2. Click "New +" → PostgreSQL
# 3. Fill in form:
# - Name: impactapp-db
# - Database: impactapp_dev
# - Username: impactapp_user
# 4. Copy the Internal Database URL (starts with postgres://)
# 5. Update .env:
#    DATABASE_URL=<paste_new_url>
# 6. Then run:
npx prisma db push --skip-generate
```

### Option 3: Use Local PostgreSQL (If Cloud is Too Problematic)
**Time:** 30 minutes
Prerequisites: PostgreSQL installed (you have it!)
```bash
# 1. In PowerShell:
Start-Service postgresql-x64-15
createdb impactapp_dev
# 2. Update .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/impactapp_dev"
# 3. Run:
npx prisma db push --skip-generate
npx prisma db seed
```

---

## What You'll See When It Works ✅

When the database connection succeeds, you'll see:

```
📤 Syncing Prisma schema with database...
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "impactweb_db"

✓ Database synced, added 44 migration(s)

The following migration(s) have been applied:
  migrations/
    └─ 20260423000000_init/
      └─ migration.sql

✓ Generated Prisma Client (v5.20.0) in 1.23s
```

---

## Next Steps After Connection Works

### Step 1: Verify Schema Created
```bash
npx prisma studio
# Opens http://localhost:5555
# You can see all 44 tables
```

### Step 2: Seed Test Data
```bash
npx prisma db seed
# Populates test users, schools, courses
```

### Step 3: Start Development
```bash
npm run dev
# Application ready at http://localhost:3000
```

---

## Summary

| Step | Status | Action |
|------|--------|--------|
| 1. Check Render Service | ⚠️ BLOCKED | Visit https://render.com, restart if suspended |
| 2. Database Schema Sync | ⚠️ BLOCKED | Waiting for database connection |
| 3. Generate Prisma Client | ⚠️ BLOCKED | Will auto-run after db push |
| 4. Seed Test Data | ⚠️ BLOCKED | `npx prisma db seed` |
| 5. Open Prisma Studio | ⚠️ BLOCKED | `npx prisma studio` |
| 6. Start Dev Server | ⚠️ BLOCKED | `npm run dev` |

---

## Still Stuck?

### Try These Debug Commands:
```bash
# Show current env
$env:DATABASE_URL
# Should show full connection string

# Verify Prisma can read schema
npx prisma validate

# Check Node.js is working
node --version

# Check npm packages installed
npm list prisma @prisma/client
```

### Common Issues & Fixes:

| Error | Fix |
|-------|-----|
| "Can't reach database" | Check Render service, restart if needed |
| "Connection refused" | Verify credentials, check firewall |
| "EPERM operation not permitted" | Delete node_modules/.prisma, npm install |
| "DATABASE_URL not found" | Add DATABASE_URL to .env (not just .env.local) |
| "Unexpected token" in schema | Check for special characters in password |

---

## Recommended Path Forward

**MOST LIKELY ISSUE:** Render free-tier database was suspended

**BEST SOLUTION:** 
1. Check https://render.com (take 2 minutes)
2. If suspended, restart it
3. If expired, create new database
4. Update DATABASE_URL in .env
5. Run `npx prisma db push --skip-generate`

---

**Your Setup is 95% Ready!** Just need the database connection online.

When the database is accessible, Phase 1 will complete in 2-3 minutes.

Good luck! 🚀
