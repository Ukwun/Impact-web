# Dashboard Testing & Validation Guide

## Phase 1: User Testing & Feedback

### Setup
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000`
3. Open DevTools: Press `F12`
4. Go to Network tab to monitor requests
5. Go to Application tab > Storage > Local Storage to check tokens

---

## Test Scenarios

### Test 1: Facilitator Analytics Dashboard
**URL**: `/dashboard/facilitator/analytics`

#### Loading State Test
- [ ] Page loads with spinner
- [ ] Spinner disappears after ~2-3 seconds
- [ ] Data appears smoothly

#### Data Display Test
- [ ] KPI summary cards show: Total Courses, Total Students, Avg Completion, Avg Engagement
- [ ] Course performance table displays:
  - Course title
  - Student count
  - Progress bar (visual and percentage)
  - Completion rate
  - Engagement score

#### Period Filter Test
- [ ] Click "Week" button → data updates (or uses cache)
- [ ] Click "Month" button → data updates
- [ ] Click "Quarter" button → data updates
- [ ] Click "Year" button → data updates
- [ ] Active button is highlighted

#### Caching Test
- [ ] First load: Check Network tab, see `/api/facilitator/analytics` request
- [ ] Wait time: Note the response time (should be <1s)
- [ ] Change period and change back: 
  - [ ] Should NOT make new API call if within cache TTL (10 min)
  - [ ] Should show data instantly
  - [ ] Network tab should show request is **cached** (gray/disk icon)

#### Error Handling Test
- [ ] Offline mode: Open DevTools → Network → Throttle to "Offline"
- [ ] Refresh page
- [ ] Should show error message: "Error Loading Analytics"
- [ ] "Try Again" button should be visible
- [ ] Click "Try Again" → should attempt to reconnect

#### Performance Metrics
- [ ] **Initial Load Time**: _____ ms
- [ ] **API Response Time**: _____ ms
- [ ] **TTI (Time to Interactive)**: _____ ms
- [ ] **Cache Hit Time (2nd load)**: _____ ms

---

### Test 2: Facilitator Content Page
**URL**: `/dashboard/facilitator/content`

#### Tab Navigation Test
- [ ] Click "Courses" tab → shows courses list
- [ ] Click "Modules" tab → shows modules list
- [ ] Click "Lessons" tab → shows lessons list
- [ ] Active tab is highlighted
- [ ] Data switches without full page reload

#### Content Display Test
- [ ] Each item shows:
  - Content icon (book, file, or video icon)
  - Title
  - Description
  - Item count or metadata
  - Published/Draft status badge
  - Last modified date
- [ ] Cards have hover effects

#### Action Buttons Test
- [ ] "Create Course" button is visible
- [ ] Click "Create Course" → navigates to course creation
- [ ] "Refresh" button is visible
- [ ] Click "Refresh" → data reloads

#### Edit/Delete Test (Simulated)
- [ ] "Edit" buttons visible on each item
- [ ] "Delete" buttons visible on each item
- [ ] Click "Delete" → confirmation dialog appears
- [ ] Confirm delete → item removed from list

#### Caching Test
- [ ] Switch tabs and switch back:
  - [ ] First switch: API call made (Network tab shows request)
  - [ ] Switch back after <5 min: Should use cache (no new API call)

---

### Test 3: Admin Reports Dashboard
**URL**: `/dashboard/admin/reports`

#### System Health Cards Test
- [ ] Three cards display:
  - [ ] System Uptime (%)
  - [ ] Error Rate (%)
  - [ ] Avg Response Time (ms)
- [ ] Each card has icon and color coding
- [ ] Values visible and readable

#### Report Filtering Test
- [ ] Filter buttons: "All", "Platform", "Engagement", "Financial"
- [ ] Click each filter
- [ ] Reports update to show filtered data
- [ ] Active filter is highlighted

#### Report Cards Test
- [ ] Each report shows:
  - [ ] Title
  - [ ] Description
  - [ ] Metrics (label, value, trend change with ↑ icon)
  - [ ] Generated date
  - [ ] Download button
- [ ] Metrics properly formatted (percentages, currency, etc.)
- [ ] Trend indicators (green/red) visible

#### Download Functionality Test
- [ ] Click "Download Report" button
- [ ] Button shows loading state
- [ ] File download dialog appears (or file downloads)

#### Caching Test
- [ ] Initial load with filter "all": API call made
- [ ] Switch filters: New API calls made
- [ ] Return to "all" after <15 min: Should use cache

---

### Test 4: Admin Alerts Dashboard
**URL**: `/dashboard/admin/alerts`

#### Alert Summary Cards Test
- [ ] Three cards show counts:
  - [ ] Critical Issues (red icon)
  - [ ] Warnings (yellow icon)
  - [ ] Information (blue icon)
- [ ] Counts match actual alerts displayed

#### Alert Severity Filtering Test
- [ ] Filter buttons: "All Alerts", "Critical", "Warnings", "Info"
- [ ] Click each filter → alerts update
- [ ] Active filter is highlighted
- [ ] Correct alerts display per severity

#### Alert Display Test
- [ ] Each alert shows:
  - [ ] Severity icon (triangle, circle, or info)
  - [ ] Title and message
  - [ ] Category badge
  - [ ] Resolved badge (if applicable)
  - [ ] Timestamp (formatted as readable date/time)
- [ ] Color coding per severity:
  - [ ] Critical: Red border/background
  - [ ] Warning: Yellow border/background
  - [ ] Info: Blue border/background

#### Alert Dismissal Test
- [ ] Each alert has X (close) button
- [ ] Click X button → alert is removed
- [ ] Network tab shows DELETE request to `/api/admin/alerts/[id]`
- [ ] Response confirms alert dismissed

#### Empty State Test
- [ ] Dismiss all alerts
- [ ] Page shows: "All Clear!" message with checkmark
- [ ] Message text: "No alerts to display"

#### Caching Test
- [ ] Initial load: See API request
- [ ] Filter change: New API call
- [ ] Dismiss alert: Should refetch (DELETE + GET)
- [ ] Return to same filter after <2 min: May use cache

---

### Test 5: University Programs Page
**URL**: `/dashboard/university/programs`

#### Progress Summary Test
- [ ] Three cards show:
  - [ ] Programs Enrolled (number and completed count)
  - [ ] Overall Progress (percentage + progress bar)
  - [ ] Available Programs (number)

#### Program Filter Test
- [ ] Filter buttons: "All", "Enrolled", "Available"
- [ ] Click each filter
- [ ] Programs update/filter correctly
- [ ] Active filter is highlighted

#### Program Card Test
Each program card should display:
- [ ] Program title
- [ ] Description
- [ ] Difficulty badge (Beginner/Intermediate/Advanced) with color coding
- [ ] Duration (in weeks) with clock icon
- [ ] Enrollment status ("Join" or "Continue" button)
- [ ] Progress bar (for enrolled programs)
- [ ] Student count
- [ ] Star rating
- [ ] Module count

#### Enrollment Status Test
- [ ] Enrolled programs show progress bar
- [ ] Progress percentage visible
- [ ] Unenrolled programs show "Join Program" button
- [ ] Enrolled programs show "Continue Learning" button
- [ ] Click "Continue" → navigates to course page

#### Difficulty Highlighting Test
- [ ] Beginner: Green badge
- [ ] Intermediate: Blue badge
- [ ] Advanced: Red badge

#### Navigation Test
- [ ] Click program card → shows details (or navigates to course)
- [ ] Click "Learn More" → opens program details
- [ ] Back button works properly

---

### Test 6: Learning Resources Page
**URL**: `/dashboard/resources`

#### Quick Access Cards Test
- [ ] Four quick links visible:
  - [ ] Getting Started
  - [ ] Community Guidelines
  - [ ] Support & Contact
  - [ ] Emergency Help
- [ ] Cards have hover effects
- [ ] Click card → navigates to resource

#### Resource Categories Test
Each category section should display:
- [ ] **Guides**: BookOpen icon, list of resources
- [ ] **Tutorials**: Video icon, list of resources
- [ ] **Documents**: FileText icon, list of resources
- [ ] **Tools**: Lightbulb icon, list of resources

#### Resource Cards Test
Each resource shows:
- [ ] Icon (matching category)
- [ ] Title
- [ ] Description
- [ ] Category badge
- [ ] View/Download count
- [ ] Action buttons:
  - [ ] "Open" button (if applicable)
  - [ ] "Download" button (if applicable)

#### Resource Actions Test
- [ ] Click "Open" button → opens in new tab
- [ ] Click "Download" button → file downloads
- [ ] Button states change on hover

#### Support Section Test
- [ ] Support contact cards visible at bottom
- [ ] Email/phone contact info accessible
- [ ] Live chat widget accessible (if implemented)

#### Caching Test
- [ ] First load: API request visible
- [ ] Reload after <30 min: Should use cache (no new API call)
- [ ] Resources are static → longest cache TTL (30 min)

---

## Phase 2: Performance & Caching Validation

### Cache Hit Rate Test
1. Open DevTools Network tab
2. Visit `/dashboard/facilitator/analytics`
3. Note the request status (200 from network)
4. Wait 30 seconds within same page
5. Change period filter back to original
6. **Expected**: No API request, instant load
7. **Actual**: _____ (API request made / instant load)

### Request Deduplication Test
1. Open DevTools Console
2. Open Inspector and check Network tab
3. Navigate to `/dashboard/admin/reports`
4. Immediately (within 1 second) navigate away and back
5. Check Network tab
6. **Expected**: Only 1 API request (requests deduplicated)
7. **Actual**: _____ (1 request / 2 requests)

### Offline Resilience Test
1. Open DevTools → Network
2. Set throttle to "Offline"
3. Navigate to `/dashboard/university/programs`
4. **Expected**: 
   - [ ] Error message displays
   - [ ] "Try Again" button available
   - [ ] Page not completely broken
5. Switch back to online
6. Click "Try Again"
7. **Expected**: Data loads successfully

### Page Load Performance
Use DevTools Performance tab:

| Page | FCP | LCP | CLS | TTI |
|------|-----|-----|-----|-----|
| Facilitator Analytics | ___ ms | ___ ms | ___ | ___ ms |
| Facilitator Content | ___ ms | ___ ms | ___ | ___ ms |
| Admin Reports | ___ ms | ___ ms | ___ | ___ ms |
| Admin Alerts | ___ ms | ___ ms | ___ | ___ ms |
| University Programs | ___ ms | ___ ms | ___ | ___ ms |
| Learning Resources | ___ ms | ___ ms | ___ | ___ ms |

**Legend**:
- FCP = First Contentful Paint
- LCP = Largest Contentful Paint
- CLS = Cumulative Layout Shift
- TTI = Time to Interactive

---

## Phase 3: Mobile Responsiveness Test

Test on different screen sizes:

### Facilitator Analytics
- [ ] Mobile (375px): Cards stack single column, table scrolls horizontally
- [ ] Tablet (768px): 2-column grid, readable table
- [ ] Desktop (1024px+): 4-column grid, full table visible

### Admin Reports
- [ ] Mobile: 1 health card per row, scrollable
- [ ] Tablet: 2 health cards
- [ ] Desktop: 3 health cards

### University Programs
- [ ] Mobile: 1 program card per row, touch-friendly buttons
- [ ] Tablet: 2 program cards per row
- [ ] Desktop: 3 program cards per row

### Learning Resources
- [ ] Mobile: Single column resource cards
- [ ] Tablet: 2 columns
- [ ] Desktop: 4 quick access cards at top

---

## Summary Checklist

### ✅ All Tests Complete
- [ ] All 6 dashboard pages load without errors
- [ ] Loading states visible and disappear appropriately
- [ ] Error states display and allow retry
- [ ] Caching is working (no duplicate requests)
- [ ] Performance is acceptable (<3s initial load, <500ms cached)
- [ ] Offline handling graceful
- [ ] Mobile responsiveness verified
- [ ] All buttons and navigation functional
- [ ] Data displays correctly formatted
- [ ] Icons and color coding visible

### 📊 Collected Metrics
- Average initial load time: _____ ms
- Average cached load time: _____ ms
- Largest network request: _____ bytes
- Total page size: _____ bytes
- Cache hit rate: _____%

---

## Issues Found & Resolution

| Issue | Page | Severity | Status | Notes |
|-------|------|----------|--------|-------|
| | | | | |
| | | | | |
| | | | | |

---

**Testing Date**: _______
**Tester Name**: _______
**Browser**: _______
**Device**: _______

