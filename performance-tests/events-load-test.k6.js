import http from 'k6/http';
import { check, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Metrics
const loadTestMetrics = {
  browseDuration: new Trend('browse_duration'),
  listEventsDuration: new Trend('list_events_duration'),
  eventDetailDuration: new Trend('event_detail_duration'),
  searchPageDuration: new Trend('search_page_duration'),
  calendarPageDuration: new Trend('calendar_page_duration'),
  pageLoadErrors: new Counter('page_load_errors'),
  successRate: new Rate('page_load_success'),
};

// Load test configuration - realistic user patterns
export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Gradual ramp-up
    { duration: '3m', target: 100 }, // Steady state
    { duration: '2m', target: 150 }, // Peak load
    { duration: '2m', target: 100 }, // Back to normal
    { duration: '1m', target: 0 }, // Ramp-down
  ],
  thresholds: {
    'browse_duration': ['p(95)<2000', 'p(99)<3000'],
    'list_events_duration': ['p(95)<500', 'p(99)<1000'],
    'event_detail_duration': ['p(95)<800', 'p(99)<1500'],
    'page_load_success': ['rate>0.99'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate realistic user journey
  group('User Browsing Events', () => {
    // Step 1: Load events page
    const startBrowse = new Date();
    const eventsListRes = http.get(`${BASE_URL}/api/events?limit=50`);
    loadTestMetrics.listEventsDuration.add(new Date() - startBrowse);

    const listSuccess = check(eventsListRes, {
      'events list loaded': (r) => r.status === 200,
      'events list response time < 500ms': (r) => r.timings.duration < 500,
      'events list has data': (r) => r.json('data') !== undefined,
    });

    loadTestMetrics.successRate.add(listSuccess);
    if (!listSuccess) loadTestMetrics.pageLoadErrors.add(1);

    // Step 2: Search for events (simulate search term)
    const searchTerms = ['python', 'workshop', 'webinar', 'summit', 'networking'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const searchRes = http.get(
      `${BASE_URL}/api/events?limit=50&search=${searchTerm}`
    );
    const searchSuccess = check(searchRes, {
      'search completed': (r) => r.status === 200,
    });

    loadTestMetrics.successRate.add(searchSuccess);

    // Step 3: View event details
    const startDetail = new Date();
    const detailRes = http.get(`${BASE_URL}/api/events/evt_sample_${Math.floor(Math.random() * 10) + 1}`);
    loadTestMetrics.eventDetailDuration.add(new Date() - startDetail);

    const detailSuccess = check(detailRes, {
      'event detail loaded': (r) =>
        r.status === 200 || r.status === 404,
      'event detail response time < 800ms': (r) =>
        r.timings.duration < 800,
    });

    loadTestMetrics.successRate.add(detailSuccess);
    if (!detailSuccess) loadTestMetrics.pageLoadErrors.add(1);

    // Step 4: Load calendar view
    const startCalendar = new Date();
    const calendarRes = http.get(`${BASE_URL}/api/events?limit=100&includePast=false`);
    loadTestMetrics.calendarPageDuration.add(new Date() - startCalendar);

    const calendarSuccess = check(calendarRes, {
      'calendar data loaded': (r) => r.status === 200,
    });

    loadTestMetrics.successRate.add(calendarSuccess);

    const totalBrowseTime = new Date() - startBrowse;
    loadTestMetrics.browseDuration.add(totalBrowseTime);
  });

  // Simulate think time between actions
  const thinkTime = Math.random() * 5 + 2; // 2-7 seconds
  http.sleep(thinkTime);
}
