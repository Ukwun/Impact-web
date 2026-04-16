# Performance Testing Setup Guide

## Overview
This guide covers the performance testing infrastructure for the Events API, including setup, execution, and result analysis.

## Prerequisites

### Required Tools
1. **k6** - Modern load testing tool
   ```bash
   # Install k6
   # Windows (using Chocolatey)
   choco install k6

   # macOS (using Homebrew)
   brew install k6

   # Linux (APT)
   sudo apt-get install k6

   # Linux (Snap)
   sudo snap install k6
   ```

2. **Node.js** (for test environment)
   ```bash
   node --version # Should be 18+
   ```

## Test Types

### 1. API Performance Tests (`events-api.k6.js`)
**Purpose**: Baseline performance testing of individual API endpoints

**Configuration**:
- 10 virtual users
- 30-second duration
- Staged ramp-up and ramp-down

**Endpoints Tested**:
- GET /api/events (list with pagination)
- GET /api/events/[id] (event details)
- POST /api/events/[id]/register (registration)
- GET /api/events/my-registrations (user registrations)

**Running the test**:
```bash
k6 run performance-tests/events-api.k6.js
```

**With environment variables**:
```bash
k6 run \
  --env BASE_URL=http://localhost:3000 \
  --env AUTH_TOKEN=your_test_token \
  performance-tests/events-api.k6.js
```

**Expected Results**:
- Error rate < 10%
- 95th percentile response time < 500ms
- 99th percentile response time < 1000ms

---

### 2. Stress Test (`events-stress-test.k6.js`)
**Purpose**: Determine system breaking points under increasing load

**Configuration**:
- Gradual ramp-up: 100 → 200 users
- Total duration: 16 minutes
- Focus on registration endpoints

**Metrics Monitored**:
- Success rate > 95%
- Registration latency < 1500ms (p95)
- HTTP request duration < 2000ms (p99)

**Running the test**:
```bash
k6 run performance-tests/events-stress-test.k6.js
```

**With detailed metrics output**:
```bash
k6 run \
  --out json=results/stress-test-$(date +%s).json \
  performance-tests/events-stress-test.k6.js
```

**What to Look For**:
- At what user count does performance degrade?
- Which endpoints are most resource-intensive?
- Are there any error spikes?

---

### 3. Load Test (`events-load-test.k6.js`)
**Purpose**: Realistic user behavior simulation

**Configuration**:
- Realistic user journey: browse → search → view details → calendar
- Peak load: 150 concurrent users
- Total duration: 9 minutes
- Includes "think time" between actions

**User Workflow Simulated**:
1. Load events list
2. Search for events
3. View event details
4. Load calendar view
5. pause & repeat

**Running the test**:
```bash
k6 run performance-tests/events-load-test.k6.js
```

**Expected Results**:
- Page load success rate > 99%
- Browse duration p95 < 2000ms
- Event detail load p95 < 800ms

---

## Running Tests in Package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:performance:api": "k6 run performance-tests/events-api.k6.js",
    "test:performance:stress": "k6 run performance-tests/events-stress-test.k6.js",
    "test:performance:load": "k6 run performance-tests/events-load-test.k6.js",
    "test:performance:all": "npm run test:performance:api && npm run test:performance:stress && npm run test:performance:load",
    "test:performance:ci": "k6 run --out json=results/performance-results.json performance-tests/events-api.k6.js"
  }
}
```

## Running Tests

### During Development
```bash
# Run API tests
npm run test:performance:api

# Run stress tests
npm run test:performance:stress

# Run load tests
npm run test:performance:load
```

### In CI/CD Pipeline
```bash
npm run test:performance:ci
```

## Interpreting Results

### Key Metrics

#### Response Time
- **p50 (Median)**: 50th percentile response time
- **p95**: 95th percentile (most requests should be below this)
- **p99**: 99th percentile (acceptable for few requests)

**Target Thresholds**:
- p95 < 500ms (95% of requests)
- p99 < 1000ms (99% of requests)

#### Success Rate
- **HTTP Success (2xx)**: Should be > 99%
- **Error Rate**: Should be < 1%
- **Registration Success**: Should be > 95%

#### Throughput
- **Requests/Second**: Requests processed per second
- **Registration Throughput**: Successful registrations per second

### Example Results Output
```
✓ api_duration....................... avg=142ms     min=45ms      max=523ms     p(95)=387ms    p(99)=451ms
✓ registration_duration.............. avg=187ms     min=78ms      max=891ms     p(95)=623ms    p(99)=812ms
✓ errors............................ 0.00% ✓ 0.00% < 10% ✓
✓ http_req_duration................. avg=165ms     min=45ms      max=891ms     p(95)=412ms    p(99)=763ms
✓ http_req_failed................... 0.00% ✓ 0.00% < 5%  ✓
```

## Advanced Options

### Custom Configuration

```bash
# Change virtual users
k6 run --vus 50 --duration 60s performance-tests/events-api.k6.js

# Output to file
k6 run --out json=results/test-$(date +%s).json performance-tests/events-api.k6.js

# Set environment variables
k6 run \
  --env BASE_URL=https://api.example.com \
  --env AUTH_TOKEN=your_token \
  performance-tests/events-api.k6.js

# Run with specific tag
k6 run --tag testid=1234 performance-tests/events-api.k6.js
```

### Output Formats

**JSON Output** (for analysis):
```bash
k6 run --out json=results/results.json performance-tests/events-api.k6.js
```

**CSV Output** (for spreadsheets):
```bash
k6 run --out csv=results/results.csv performance-tests/events-api.k6.js
```

**InfluxDB** (for continuous monitoring):
```bash
k6 run --out influxdb=http://localhost:8086/myk6db performance-tests/events-api.k6.js
```

## Performance Optimization Tips

### For Slow Endpoints

1. **Identify bottlenecks**: Which endpoint is slowest?
   - Use the detailed metrics to identify
   - Look at p95 and p99 percentiles

2. **Database Optimization**:
   - Check query performance with EXPLAIN
   - Add appropriate indexes
   - Use SELECT only needed fields

3. **Caching**:
   - Cache event lists (changes infrequently)
   - Cache registration counts
   - Implement Redis for hot data

4. **Code Optimization**:
   - Reduce nested queries
   - Use batch operations
   - Implement pagination

5. **Infrastructure**:
   - Increase server resources
   - Use CDN for static content
   - Implement load balancing

## Continuous Performance Testing

### GitHub Actions Example
```yaml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: performance-tests/events-api.k6.js
          cloud: true
```

### GitLab CI Example
```yaml
performance_test:
  image: grafana/k6:latest
  script:
    - k6 run --out json=results.json performance-tests/events-api.k6.js
  artifacts:
    paths:
      - results.json
```

## Troubleshooting

### Common Issues

**"Connection refused"**
```bash
# Check if server is running
curl http://localhost:3000/api/events

# Use correct BASE_URL
k6 run --env BASE_URL=http://your-server.com performance-tests/events-api.k6.js
```

**"Unauthorized" errors (401)**
```bash
# Provide valid auth token
k6 run --env AUTH_TOKEN=valid_token performance-tests/events-api.k6.js
```

**"Resource exhausted"**
- Reduce --vus (virtual users)
- Increase server resources
- Check database connection pool

**Inconsistent results**
- Run multiple times to get average
- Check for background processes
- Ensure consistent server state

## Dashboard & Visualization

### k6 Cloud Integration
```bash
# Run test in k6 Cloud
k6 run --cloud performance-tests/events-api.k6.js
```

**Benefits**:
- Real-time test monitoring
- Historical trend analysis
- Team collaboration
- Automatic report generation

## Best Practices

1. **Run tests regularly**
   - At least before each release
   - After significant code changes
   - On production-like environments

2. **Baseline metrics**
   - Establish performance benchmarks
   - Track improvements/regressions
   - Alert on threshold violations

3. **Test data**
   - Use realistic test data
   - Include edge cases
   - Test with varying data sizes

4. **Environment consistency**
   - Use same hardware for baseline
   - Control background processes
   - Document environment specs

5. **Analysis**
   - Compare results over time
   - Identify trends
   - Share results with team

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/javascript-api/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)
- [Grafana k6 Community](https://community.grafana.com/c/k6/)

## Support

For questions or issues:
1. Check k6 documentation
2. Review test configuration
3. Check server logs for errors
4. Ask team for insights
5. Create performance issue in repo

---

**Document Version**: 1.0
**Last Updated**: February 2026
**Maintained By**: Development Team
