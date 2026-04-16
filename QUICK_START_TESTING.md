# Events System - Quick Start Guide

## 5-Minute Setup

### Prerequisites
```bash
# Already installed?
node --version        # Should be 18+
npm --version         # Should be 8+

# Install k6 (for performance tests)
# Windows (Chocolatey)
choco install k6

# macOS (Homebrew)
brew install k6

# Linux (APT)
sudo apt-get install k6
```

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Verify k6 installation
k6 version

# 3. You're done! All files are ready.
```

---

## Running Tests (Choose Your Path)

### Path 1: Unit Tests Only (5 minutes)
```bash
# Run event API tests
npm run test:api

# Expected output:
# ✓ PASS src/app/api/events/__tests__/events.test.ts (2.5s)
```

### Path 2: View Analytics Dashboard (2 minutes)
```bash
# Start development server
npm run dev

# Open browser to:
# http://localhost:3000/dashboard/admin/analytics

# Note: Must be logged in as admin user
```

### Path 3: Performance Tests (30 minutes)
```bash
# Run all performance tests
npm run test:performance:all

# Or run individually:
npm run test:performance:api      # 30 seconds
npm run test:performance:stress   # 16 minutes
npm run test:performance:load     # 9 minutes
```

### Path 4: Everything (1 hour)
```bash
# Run all tests in order
npm run test                       # All Jest tests
npm run test:api                   # Event API tests
npm run test:performance:all       # All performance tests
```

---

## Understanding Results

### Test Results
```bash
# Green checkmarks (✓) = PASS
# Red X marks (✗) = FAIL

# Example output:
✓ should list events with valid pagination
✓ should return 401 for unauthorized users
✓ should reject registration when capacity exceeded
✗ should handle 100 concurrent requests (FAILED)
```

### Performance Results
```
✓ api_duration....................... avg=142ms     p95=387ms    p99=451ms
✓ http_req_failed................... 0.00% < 10%

Interpretation:
- avg = average time
- p95 = 95% of requests complete within this time
- p99 = 99% of requests complete within this time
- < target shows if threshold passed (green ✓)
```

---

## Common Tasks

### I want to...

#### Run tests before deploying
```bash
npm test && npm run test:api && npm run test:performance:api
```

#### Monitor performance while developing
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:performance:api
```

#### Export test results
```bash
k6 run --out json=results/test.json performance-tests/events-api.k6.js
```

#### Test with custom settings
```bash
# More users
k6 run --vus 50 --duration 60s performance-tests/events-api.k6.js

# Different server
k6 run \
  --env BASE_URL=https://api.example.com \
  --env AUTH_TOKEN=your_token \
  performance-tests/events-api.k6.js
```

#### View coverage report
```bash
npm run test:coverage
# Opens HTML report in coverage/
```

---

## File Locations

```
Your Project
├── src/app/api/events/__tests__/
│   └── events.test.ts              ← Unit tests
├── src/app/dashboard/admin/
│   └── analytics/page.tsx           ← Analytics dashboard
├── src/app/api/admin/events/
│   └── analytics/route.ts           ← Analytics API
├── performance-tests/
│   ├── events-api.k6.js            ← API test
│   ├── events-stress-test.k6.js    ← Stress test
│   └── events-load-test.k6.js      ← Load test
├── PERFORMANCE_TESTING_GUIDE.md     ← Detailed docs
└── EVENTS_SYSTEM_COMPLETION_SUMMARY.md ← This summary
```

---

## Troubleshooting at a Glance

| Problem | Solution | 
|---------|----------|
| `jest: command not found` | Run `npm install` |
| `k6: command not found` | Install k6 (see Prerequisites) |
| Tests fail with auth errors | Ensure dev server is running (`npm run dev`) |
| High error rates in performance tests | Check server logs, reduce user count |
| Analytics page not found | Must be logged in as admin, check route |
| Port 3000 already in use | Kill process: `npx kill-port 3000` |

---

## Visual Guides

### Running Unit Tests
```
┌─────────────────────────────┐
│ npm run test:api            │
└──────────────┬──────────────┘
               │ (Runs Jest)
               ▼
    ┌──────────────────────┐
    │ 30+ Tests Execute    │
    │ ✓ Passes counted     │
    │ ✗ Failures counted   │
    └──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Results Displayed    │
    │ Shows pass/fail rate │
    │ Shows coverage %     │
    └──────────────────────┘
```

### Accessing Analytics
```
┌──────────────────────────┐
│ npm run dev              │
└─────────────┬────────────┘
              │ (Starts Next.js)
              ▼
┌──────────────────────────┐
│ Open Browser             │
│ localhost:3000/dashboard │
│ /admin/analytics         │
└─────────────┬────────────┘
              │ (If logged in)
              ▼
┌──────────────────────────┐
│ Dashboard Loads          │
│ 4 Metric Cards           │
│ 4 Visualizations         │
│ Time filtering           │
│ CSV export button        │
└──────────────────────────┘
```

### Running Performance Tests
```
npm run test:performance:api (30 seconds)
       ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
  API Performance Test
  - 10 virtual users
  - 4 endpoints tested
  - Response times measured
       ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
  Results: avg/p95/p99 times

npm run test:performance:stress (16 minutes)
       ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
  Stress Test
  - 100→200 users gradually
  - Registration focused
  - Breaking point found
       ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
  Results: max users, error rate

npm run test:performance:load (9 minutes)
       ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
  Load Test
  - Realistic user behavior
  - 150 concurrent users
  - Complete user journey
       ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
  Results: success rate, journey times
```

---

## Success Indicators

### Unit Tests ✓
```bash
npm run test:api

Expected:
PASS  src/app/api/events/__tests__/events.test.ts
Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
Snapshots:   2 passed
Time:        2.45s
```

### Analytics Dashboard ✓
```
Dashboard shows:
✓ Total Events: [number]
✓ Total Registrations: [number]
✓ Attendance Rate: [%]
✓ Capacity Utilization: [%]
✓ 4 Charts visible
✓ Time range selector works
✓ CSV export button available
```

### Performance Tests ✓
```bash
npm run test:performance:api

Expected:
✓ api_duration....................... avg=142ms p95=387ms p99=451ms
✓ http_req_failed................... 0.00% < 10% ✓
✓ Checks............................ 100% (100/100)
```

---

## Next Actions

### After Tests Pass
1. **Review Results**
   - Check which tests passed/failed
   - Note any warnings
   - Document baseline metrics

2. **Deploy Updates**
   ```bash
   npm run build
   npm run start
   ```

3. **Monitor in Production**
   - Check analytics dashboard regularly
   - Schedule weekly performance tests
   - Alert on threshold violations

4. **Schedule Reviews**
   - Weekly: Run unit tests
   - Monthly: Full performance test suite
   - Quarterly: Performance optimization

---

## Important Notes

⚠️ **Performance Tests Take Time**
- API test: ~30 seconds
- Stress test: ~16 minutes  
- Load test: ~9 minutes
- All together: ~25 minutes

⚠️ **k6 Must Be Installed**
- Tests won't run without k6
- Follow Prerequisites above
- Verify with `k6 version`

⚠️ **Server Must Be Running**
- For analytics: `npm run dev`
- For tests: Can run against any URL
- Update BASE_URL if needed

⚠️ **Performance Varies**
- Results depend on hardware
- Compare trends, not absolute numbers
- Run multiple times for consistency

---

## Quick Command Reference

```bash
# Testing
npm test                          # All Jest tests
npm run test:api                  # Event API tests
npm run test:watch                # Watch mode
npm run test:coverage             # Coverage report

# Performance
npm run test:performance:api      # API test (30s)
npm run test:performance:stress   # Stress test (16m)
npm run test:performance:load     # Load test (9m)
npm run test:performance:all      # All performance

# Development
npm run dev                        # Start dev server
npm run build                      # Production build
npm run start                      # Run production

# Database
npm run db:push                    # Push schema
npm run db:seed                    # Seed data
npm run db:reset                   # Reset database
```

---

## When Things Go Wrong

**Cannot find tests?**
```bash
# Make sure you're in correct directory
pwd
# Should show: .../impactapp-web

# Verify test file exists
ls src/app/api/events/__tests__/
```

**Tests timeout?**
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

**Performance tests hang?**
```bash
# Check server is running
curl http://localhost:3000/api/events

# Run with verbose output
k6 run -v performance-tests/events-api.k6.js
```

**Analytics shows no data?**
```bash
# Check backend is working
curl http://localhost:3000/api/admin/events/analytics

# Check logged in as admin
# Check browser console for errors
```

---

## Need Help?

### Check These Files
1. `PERFORMANCE_TESTING_GUIDE.md` - Detailed k6 guide
2. `EVENTS_SYSTEM_COMPLETION_SUMMARY.md` - Complete overview
3. `src/app/api/events/__tests__/events.test.ts` - Test code
4. `src/app/dashboard/admin/analytics/page.tsx` - Analytics code

### Common Questions

**Q: How often should I run tests?**
A: Unit tests before commits, performance tests before releases

**Q: What do I do with test failures?**
A: Check logs, identify cause, fix code, rerun tests

**Q: Should I commit test results?**
A: No, commit code only. Results are ephemeral.

**Q: Can I run tests in parallel?**
A: Unit tests yes, performance tests should run serially

**Q: How are baselines set?**
A: Run test once, record results, use as minimum going forward

---

## Success! 🎉

You now have:
- ✅ Comprehensive unit tests
- ✅ Real-time analytics dashboard
- ✅ Performance testing infrastructure
- ✅ Complete documentation
- ✅ Ready to deploy

**Estimated setup time**: 5 minutes
**Estimated first test run**: 30 minutes  
**Estimated first deployment**: 1 day

---

**For detailed information**, see:
- Full performance guide: `PERFORMANCE_TESTING_GUIDE.md`
- Complete summary: `EVENTS_SYSTEM_COMPLETION_SUMMARY.md`

**Questions?** Check the troubleshooting section above or the detailed guides.

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Ready to Use ✅
