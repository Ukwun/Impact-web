# ImpactApp Deployment & Cache Management Guide

## Overview

This guide explains how to set up automatic deployment from GitHub to Netlify and how the cache invalidation system works to ensure all devices (phone, laptop, etc.) always see the latest changes.

---

## ⚡ Quick Start

### 1. Connect GitHub Repository to Netlify (One-time setup)

**Steps:**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your ImpactEdu repository
6. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18.17.0 (pre-filled)
7. Click "Deploy site"

**Done!** From now on, every push to your GitHub repository will automatically trigger a Netlify deployment.

---

## 🔄 How Automatic Deployment Works

### GitHub Push → Netlify Deploy Flow

```
1. You push code to GitHub (main branch)
   ↓
2. GitHub notifies Netlify via webhook
   ↓
3. Netlify receives the notification
   ↓
4. Netlify clones your repository
   ↓
5. Netlify runs: npm ci (install dependencies)
   ↓
6. Netlify runs: npm run build (build Next.js app)
   ↓
7. Netlify deploys .next directory
   ↓
8. Netlify invalidates CDN cache (important!)
   ↓
9. All devices automatically fetch fresh content
```

### Why This Setup Works for Cross-Device Cache Issues

**Before this setup:**
- Manual deployments were error-prone
- Devices had stale cached content
- Cache inconsistency between phone and laptop

**Now with automatic deployment:**
- Every push immediately goes live
- Netlify automatically clears CDN cache on each deploy
- Next.js asset versioning (content hashes) prevents conflicts
- Service Worker checks for version updates
- `index.html` and `version.json` never cached (always fresh)

---

## 🔒 Cache Strategy Explained

### Three-Layer Cache System

**Layer 1: Browser Cache (Client)**
- **Entry point** (`index.html`): `no-cache, must-revalidate` → Always revalidated
- **Assets** (`*.js`, `*.css`): `max-age=31536000, immutable` → Cached for 1 year
- **API calls**: `no-cache, no-store` → Never cached
- **Service Worker**: `no-cache, must-revalidate` → Always fresh

**Layer 2: Service Worker Cache (Client)**
- Caches API responses for offline support
- **NETWORK-FIRST** for pages and API (fetch latest, fallback to cache)
- **CACHE-FIRST** for assets (use cache, fallback to fetch)
- Cache version bumped on each deploy → Forces re-download of all cached assets

**Layer 3: Netlify CDN Cache (Server)**
- Netlify automatically purges CDN cache on each deploy
- `_redirects` file ensures SPA routing works correctly
- Security headers prevent middle-man attacks

### Cache Invalidation Timeline

When you push code, here's what happens to cached content:

```
T+0s   : You push to GitHub
T+5s   : Netlify receives webhook
T+30s  : Netlify finishes build
T+35s  : Netlify deploys new version
T+40s  : CDN cache automatically purged

Client Behavior:
T+0m   : User on phone sees "checking updates..."
T+1m   : Browser requests index.html (no-cache header forces revalidation)
T+2m   : Browser gets latest index.html from CDN (cache purged)
T+3m   : Browser downloads latest JavaScript bundles (content hash changed)
T+4m   : All changes visible on phone

Meanwhile on laptop:
- Same process happens independently
- Both devices end up with identical version within 5 minutes
```

---

## 🚀 Deployment Process

### Making a Deployment

**Method 1: Direct Push (Automatic)**
```bash
# Make your changes
git add .
git commit -m "Add feature XYZ"
git push origin main

# Deployment starts automatically!
# Check status: https://app.netlify.com/sites/impactclub/deployments
```

**Method 2: Preview Deploy (Pull Request)**
- Open a pull request on GitHub
- Netlify automatically creates a preview deploy
- Test changes at: `https://deploy-preview-XXX--impactclub.netlify.app`
- Merge PR to deploy to production

### Monitoring Deployments

1. Go to [Netlify Deploy Log](https://app.netlify.com/sites/impactclub/deploys)
2. You'll see real-time build progress
3. Green checkmark ✅ = Deploy successful
4. Red X ❌ = Build failed (check logs for errors)

### Rolling Back a Deploy

If a deploy causes issues:

1. Click on the previous deployment in Netlify dashboard
2. Click "Publish deploy"
3. Previous version goes live immediately

---

## 📱 Cross-Device Cache Sync

### How Devices Stay in Sync Now

**Scenario: You deploy a bug fix**

```
Phone user already has app open:
├─ Browser has cached index.html (expires immediately due to no-cache)
├─ Service Worker checks /version.json (always fresh, no-cache header)
├─ Sees new version available
├─ Shows "Update available" notification
└─ User refreshes or clicks update
   └─ Gets latest version immediately

Laptop user opens browser:
├─ Browser requests index.html (no-cache forces revalidation)
├─ Gets fresh index.html from CDN (cache purged by Netlify)
├─ Browser downloads latest .js bundles (different content hashes)
└─ Sees latest version on first load
```

### Manual Cache Clear (If Needed)

If a device shows stale content, users can:

1. **Hard Refresh** (clears browser cache):
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear Service Worker Cache**:
   - Open DevTools (F12)
   - Application tab → Service Workers
   - Click "Unregister"
   - Refresh page

3. **Clear All Site Data**:
   - Settings → Site Settings → Clear Data
   - Or via DevTools: Application tab → Storage → Clear
   - Refresh page

---

## 🔧 Updating Service Worker Cache Version

**Important:** Bump the cache version on each major deployment to force all devices to refresh.

### Steps to Update Cache Version

1. Open `public/sw.js`
2. Find this line (around line 3):
   ```javascript
   const CACHE_VERSION = '20240319-1430'; // UPDATE THIS ON EACH DEPLOY
   ```
3. Change the version string to current date-time (YYYYMMDD-HHmm format)
4. Also update `public/version.json`:
   ```json
   {
     "version": "20240319-1430",
     "buildTime": "2024-03-19T14:30:00Z"
   }
   ```
5. Commit and push
6. Watch Netlify deploy automatically

---

## 🔗 Important Files

| File | Purpose | When to Update |
|------|---------|-----------------|
| `netlify.toml` | Deployment config & cache headers | When changing build requirements |
| `public/_redirects` | SPA routing rules | When adding new routes |
| `public/sw.js` | Service Worker (offline support + caching) | On each deploy (bump CACHE_VERSION) |
| `public/version.json` | Version info for cache checking | On each deploy (keep in sync with sw.js) |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD | For advanced testing needs |
| `next.config.js` | Next.js build configuration | When changing build behavior |

---

## 🆘 Troubleshooting

### Issue: Changes not showing up on phone/laptop

**Solution:**
1. Hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. Or clear Service Worker:
   - Open DevTools (F12)
   - Application → Service Workers → Unregister
   - Go to Settings → Clear browsing data → Clear all
   - Refresh page

3. Check if deployment succeeded:
   - Go to [Netlify Deploys](https://app.netlify.com/sites/impactclub/deploys)
   - Look for green checkmark on latest deploy

### Issue: Build failing on Netlify

**Steps to debug:**
1. Click on the failed deployment in Netlify
2. Scroll to "Build log" section
3. Look for red error messages
4. Common fixes:
   - Run `npm ci` locally to ensure clean install
   - Run `npm run build` locally to test
   - Check `tsconfig.json` for type errors
   - Verify all environment variables are set in Netlify UI

### Issue: API calls returning errors after deploy

**Check:**
1. Environment variables are set in Netlify UI
   - Go to Site Settings → Build & Deploy → Environment
2. API endpoints are still valid
3. Database migrations have run (if applicable)

### Issue: Deployment takes too long

**Possible causes:**
1. Large node_modules (check if deps can be optimized)
2. Database queries during build (move to runtime)
3. Large image processing (use Image Optimization)

**Solution:** Check Netlify build log for slow steps

---

## 📊 Monitoring & Analytics

### Check Deployment Health

1. **Netlify Dashboard:**
   - https://app.netlify.com/sites/impactclub
   - See deployment history and status

2. **Site Status:**
   - Green "Publish deploy" button = Ready to go live
   - Red "Build failed" = Fix required

3. **Analytics:**
   - Netlify provides traffic analytics
   - Track deployment frequency and success rate

---

## 🔐 Security

### API Key Management

- **NEVER commit** `.env.local` or `.env.production.local` to GitHub
- Always use Netlify UI for environment variables:
  - Site Settings → Build & Deploy → Environment variables
  - Add sensitive values there (API keys, database URLs, etc.)

### Branch Protection

- Protect `main` branch from accidental pushes
- GitHub Settings → Branch protection rules
- Require pull request reviews before merging

---

## 📝 Next Steps

1. ✅ **TODAY:** Connect GitHub repo to Netlify (use Quick Start above)
2. ✅ **TODAY:** Test by pushing a small change to GitHub
3. ✅ **Today:** Verify automatic deployment works
4. ✅ **TODAY:** Test cross-device cache sync (open on phone + laptop)
5. 📅 **SOON:** Set up environment variables in Netlify
6. 📅 **SOON:** Configure branch protection on GitHub
7. 📅 **SOON:** Monitor first few deployments for any issues

---

## 📞 Support

For issues or questions:
1. Check Netlify build logs for error details
2. Verify GitHub connectivity in Netlify UI
3. Clear cache and hard refresh if seeing stale content
4. Check environment variables are set
5. Run `npm run build` locally to test build locally first

---

## 🎯 Summary

- **Automatic deployment:** Push to GitHub → Netlify deploys automatically
- **Cache busting:** Netlify purges CDN cache on each deploy
- **Cross-device sync:** version.json + Service Worker + no-cache headers keep all devices in sync
- **Cache strategy:** Entry points always fresh, assets cached for performance
- **Service Worker:** Network-first for pages/API, cache-first for assets

**Result:** All your devices see updates within seconds of deployment! 🚀
