# GitHub + Netlify Deployment Setup Checklist

## ✅ Implementation Complete

All configuration files have been updated for automatic deployment and cross-device cache sync.

---

## 🚀 One-Time Setup (You Need to Do This)

### Step 1: Connect GitHub to Netlify
- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Select GitHub as provider
- [ ] Authorize Netlify to access your repo
- [ ] Select `ImpactEdu` repository
- [ ] Accept default build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`
  - Node version: `18.17.0`
- [ ] Click "Deploy site"
- [ ] Wait for initial deploy (~2-3 minutes)

### Step 2: Set Environment Variables (if needed)
- [ ] Go to Netlify Site Settings → Build & Deploy → Environment
- [ ] Add any required environment variables:
  - `DATABASE_URL`
  - `API_KEY`
  - etc.

### Step 3: Test Automatic Deployment
- [ ] Make a small test change locally
- [ ] Commit: `git add . && git commit -m "test"`
- [ ] Push: `git push origin main`
- [ ] Watch Netlify deploy automatically
  - Monitor at: https://app.netlify.com/sites/[your-site]/deploys
- [ ] Verify changes appear on live site

### Step 4: Test Cross-Device Cache Sync
- [ ] Open site on phone AND laptop
- [ ] Make a change locally
- [ ] Push to GitHub
- [ ] Hard refresh on both devices (`Ctrl+Shift+R` or `Cmd+Shift+R`)
- [ ] Verify both devices show latest changes

---

## 📁 Configuration Files Updated

### Core Deployment Config

**`netlify.toml`** ✅ Updated
- ✅ Enhanced cache headers for index.html, sw.js, version.json
- ✅ Added Pragma: no-cache headers for cache busting
- ✅ Configured Node 18.17.0
- ✅ Added GitHub integration documentation
- ✅ Cache version control headers

**`.github/workflows/deploy.yml`** ✅ Created
- ✅ GitHub Actions workflow for CI/CD
- ✅ Runs type-check and linter on push
- ✅ Builds and tests automatically
- ✅ Optional: Manual deploy to Netlify on tags

**`public/_redirects`** ✅ Updated
- ✅ SPA fallback routing
- ✅ Cache control documentation

**`public/sw.js`** ✅ Enhanced
- ✅ Dynamic cache version support (bump on each deploy)
- ✅ Message handlers for version checking
- ✅ Cache clearing on demand
- ✅ Better cache invalidation strategy

**`public/version.json`** ✅ Created
- ✅ Version information file
- ✅ Allows clients to check for updates
- ✅ Always marked as no-cache

---

## 🔄 On Each Deployment

### Recommended Workflow

```bash
# 1. Make your changes
vim src/components/MyComponent.tsx

# 2. Test locally
npm run type-check
npm run build

# 3. Commit with clear message
git add .
git commit -m "feat: Add new feature"

# 4. Push to GitHub
git push origin main

# 5. Netlify deploys automatically!
# Monitor: https://app.netlify.com/sites/[your-site]/deploys
```

### Optional: Bump Cache Version (for major releases)

After significant deployments, refresh cache version:

```bash
# Edit these files with new timestamp (YYYYMMDD-HHmm format):
# 1. public/sw.js - Update CACHE_VERSION constant
# 2. public/version.json - Update version field
# Commit and push - all client caches will refresh
```

---

## 🆘 Troubleshooting

### Deployment Not Triggering?
- [ ] Check GitHub repo is connected in Netlify
- [ ] Verify you pushed to `main` branch
- [ ] Check for branch protection rules blocking deploy
- [ ] Verify Netlify webhook is active

### Changes Not Appearing?
- [ ] Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- [ ] Clear Service Worker: DevTools → Application → Service Workers → Unregister
- [ ] Wait 2-3 minutes for CDN to propagate
- [ ] Check Netlify deploy log for build errors

### Build Failing?
- [ ] Run locally: `npm run build`
- [ ] Check for TypeScript errors: `npm run type-check`
- [ ] Review Netlify build log for error messages
- [ ] Verify all environment variables are set

### Cache Issues Between Devices?
- [ ] Both devices should auto-update within 5 minutes
- [ ] Manually bump CACHE_VERSION if urgent refresh needed
- [ ] Hard refresh on both devices simultaneously
- [ ] Check if both connected to reliable internet

---

## 📊 Deployment URLs

- **Live Site:** https://impactclub.netlify.app
- **Netlify Dashboard:** https://app.netlify.com/sites/impactclub
- **Deployment Log:** https://app.netlify.com/sites/impactclub/deploys
- **GitHub Repo:** https://github.com/your-org/ImpactEdu

---

## ⏱️ Expected Timeline After Push

```
T+0s   → Code pushed to GitHub
T+5s   → Netlify receives notification
T+30s  → Build complete
T+40s  → Deploy live
T+45s  → CDN cache purged
T+2m   → Most users see changes (CDN propagation)
T+5m   → All users worldwide see changes
```

---

## 🔐 Security Notes

- Never commit `.env.local` to GitHub
- Use Netlify UI to set all environment variables
- Enable branch protection on main
- Require pull request reviews before merging
- Regularly update Node.js version

---

## ✨ Benefits After Setup

✅ **Automatic deployments** - No manual Netlify deploys needed  
✅ **CI/CD pipeline** - Tests run before deploy via GitHub Actions  
✅ **Cross-device sync** - All devices see updates within 5 minutes  
✅ **Cache busting** - No stale content showing to users  
✅ **Easy rollback** - One click to revert to previous version  
✅ **PR previews** - Test changes before merging via deploy previews  
✅ **Peace of mind** - Service Worker optimized for performance  

---

## 📝 Last Step

After completing the one-time setup above, bookmark these URLs:
- Netlify Deploy Dashboard
- GitHub Repository Settings
- Your Live Site URL

You're done! 🎉 Deployments are now automatic!
