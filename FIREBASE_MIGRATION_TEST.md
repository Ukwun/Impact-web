# Firebase Migration - Full CRUD Testing Guide
**April 19, 2026**

## ✅ Migration Complete - 95% of Routes Now Use Firestore

### Summary
- ✅ Quiz routes (3 endpoints)
- ✅ Assignment routes (2 endpoints)
- ✅ Event routes (8 endpoints)
- ✅ Admin user routes (3 endpoints)
- ✅ Admin dashboard route (enhanced)
- ✅ Activity tracking integrated throughout
- ✅ Build succeeds with only non-critical warnings (Sentry config)

---

## Test Authentication Setup

Before running tests, you need a valid admin JWT token. Get one via:

```bash
# Option 1: Login as admin user
curl -X POST https://impactapp-web.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@impactedu.com",
    "password": "your_admin_password"
  }'

# Copy the returned token and use in Authorization header:
# Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Quiz Routes - CRUD Testing

### 1. GET /api/quizzes/[id] - Get Quiz
```bash
curl -X GET "https://impactapp-web.netlify.app/api/quizzes/quiz-id-123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "id": "quiz-id-123",
#   "title": "Financial Literacy 101",
#   "description": "...",
#   "questions": [...],
#   "totalPoints": 100,
#   "passingScore": 60,
#   "showResults": true
# }
```

### 2. POST /api/quizzes/[id]/submit - Submit Quiz
```bash
curl -X POST "https://impactapp-web.netlify.app/api/quizzes/quiz-id-123/submit" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "question-1": "option-a",
      "question-2": "option-c"
    },
    "timeSpent": 1200
  }'

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "attemptId": "attempt-id-456",
#     "score": 85,
#     "percentageScore": 85,
#     "isPassed": true,
#     "totalQuestions": 2,
#     "correctAnswers": 2
#   }
# }

# What happens in background:
# ✅ Creates quiz_attempts document in Firestore
# ✅ Logs activity event: "quiz_attempt"
# ✅ Calculates score from questions
# ✅ Returns detailed results
```

---

## Assignment Routes - CRUD Testing

### 1. GET /api/assignments/[id] - Get Assignment
```bash
curl -X GET "https://impactapp-web.netlify.app/api/assignments/assign-id-789" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "id": "assign-id-789",
#   "title": "Business Plan Project",
#   "description": "...",
#   "dueDate": "2026-05-01T00:00:00Z",
#   "totalPoints": 100
# }
```

### 2. POST /api/assignments/[id]/submit - Submit Assignment
```bash
curl -X POST "https://impactapp-web.netlify.app/api/assignments/assign-id-789/submit" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionText": "My business plan...",
    "attachmentUrl": "https://example.com/file.pdf"
  }'

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "submissionId": "sub-111",
#     "score": 90,
#     "isLate": false,
#     "feedback": "Great work!"
#   }
# }

# What happens in background:
# ✅ Creates assignment_submissions document
# ✅ Logs activity event: "assignment_submit"
# ✅ Checks if submission is late
# ✅ Returns submission ID and score
```

---

## Event Routes - CRUD Testing

### 1. GET /api/events - List Events
```bash
curl -X GET "https://impactapp-web.netlify.app/api/events?eventType=WORKSHOP&includePast=false" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "event-123",
#       "title": "Entrepreneurship Workshop",
#       "eventDate": "2026-05-15T10:00:00Z",
#       "currentAttendees": 25,
#       "capacity": 100
#     }
#   ]
# }
```

### 2. POST /api/events - Create Event (Admin)
```bash
curl -X POST "https://impactapp-web.netlify.app/api/events" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Marketing Masterclass",
    "description": "Learn digital marketing strategies",
    "eventDate": "2026-06-01T00:00:00Z",
    "startTime": "10:00 AM",
    "endTime": "2:00 PM",
    "venue": "Main Hall",
    "location": "Lagos",
    "capacity": 100,
    "eventType": "WORKSHOP"
  }'

# Expected Response:
# {
#   "success": true,
#   "data": { "id": "event-new-123", ... }
# }

# What happens in background:
# ✅ Creates events document in Firestore
# ✅ Sets registeredCount = 0
# ✅ Logs activity event: "event_created"
```

### 3. GET /api/events/[id] - Get Event Details
```bash
curl -X GET "https://impactapp-web.netlify.app/api/events/event-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. PUT /api/events/[id] - Update Event (Admin)
```bash
curl -X PUT "https://impactapp-web.netlify.app/api/events/event-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Workshop Title",
    "capacity": 150
  }'

# Logs activity event: "event_updated"
```

### 5. DELETE /api/events/[id] - Delete Event (Admin)
```bash
curl -X DELETE "https://impactapp-web.netlify.app/api/events/event-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Logs activity event: "event_deleted"
```

### 6. POST /api/events/[id]/register - Register for Event
```bash
curl -X POST "https://impactapp-web.netlify.app/api/events/event-123/register" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "success": true,
#   "data": { "registrationId": "reg-456" }
# }

# What happens in background:
# ✅ Creates event_registrations document
# ✅ Increments event.registeredCount by 1
# ✅ Logs activity event: "event_registered"
```

### 7. DELETE /api/events/[id]/register - Cancel Registration
```bash
curl -X DELETE "https://impactapp-web.netlify.app/api/events/event-123/register" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Logs activity event: "event_registration_cancelled"
# Decrements event.registeredCount by 1
```

### 8. GET /api/events/my-registrations - Get User's Events
```bash
curl -X GET "https://impactapp-web.netlify.app/api/events/my-registrations" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns all events the user is registered for
```

---

## Admin User Routes - CRUD Testing

### 1. GET /api/admin/users - List All Users (Admin)
```bash
curl -X GET "https://impactapp-web.netlify.app/api/admin/users?page=1&limit=20&role=STUDENT" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "users": [
#       {
#         "id": "user-123",
#         "email": "student@example.com",
#         "name": "John Doe",
#         "role": "STUDENT",
#         "enrollmentCount": 5
#       }
#     ],
#     "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
#   }
# }
```

### 2. POST /api/admin/users - Create User (Admin)
```bash
curl -X POST "https://impactapp-web.netlify.app/api/admin/users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "password": "SecurePassword123!",
    "role": "FACILITATOR"
  }'

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "id": "user-new-456",
#     "email": "newuser@example.com",
#     "role": "FACILITATOR"
#   }
# }

# What happens in background:
# ✅ Creates user in Firebase Auth
# ✅ Creates user profile in Firestore
# ✅ Logs activity event: "user_created_admin"
```

### 3. GET /api/admin/users/[id] - Get User Details (Admin)
```bash
curl -X GET "https://impactapp-web.netlify.app/api/admin/users/user-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Returns: user profile + enrollmentCount + activityCount
```

### 4. PUT /api/admin/users/[id] - Update User (Admin)
```bash
curl -X PUT "https://impactapp-web.netlify.app/api/admin/users/user-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "MENTOR",
    "isActive": true
  }'

# Logs activity event: "user_updated_admin"
```

### 5. DELETE /api/admin/users/[id] - Deactivate User (Admin)
```bash
curl -X DELETE "https://impactapp-web.netlify.app/api/admin/users/user-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Soft-deletes: sets isActive = false
# Logs activity event: "user_deactivated_admin"
```

---

## Admin Dashboard Route

### GET /api/admin/dashboard - Admin Metrics
```bash
curl -X GET "https://impactapp-web.netlify.app/api/admin/dashboard" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "totalUsers": 1543,
#     "activeCourses": 12,
#     "completionRate": 42,
#     "avgScore": 76
#   }
# }
```

---

## Activity Tracking Verification

Every major action is logged to the `activity_logs` Firestore collection:

### To view activity logs:
```bash
# In Firebase Console:
# Firestore → Collections → activity_logs

# Fields logged:
{
  "userId": "user-123",
  "type": "quiz_attempt" | "assignment_submit" | "event_registered" | "event_deleted" | "user_created_admin",
  "description": "Completed quiz: Financial Literacy 101",
  "metadata": { "score": 85, "passed": true, ... },
  "timestamp": "2026-04-19T14:30:00Z"
}
```

---

## Testing Checklist

- [ ] **Quiz Submission**
  - [ ] Submit quiz answers
  - [ ] Get correct score calculation
  - [ ] Activity logged

- [ ] **Assignment Submission**
  - [ ] Submit assignment
  - [ ] Late check works
  - [ ] Activity logged

- [ ] **Event Management**
  - [ ] List events
  - [ ] Create event (admin)
  - [ ] Register for event
  - [ ] Cancel registration
  - [ ] Registration count increments/decrements

- [ ] **User Management**
  - [ ] List users with pagination
  - [ ] Create user (Firebase Auth + Firestore)
  - [ ] Update user role
  - [ ] Deactivate user

- [ ] **Dashboard**
  - [ ] Get admin metrics
  - [ ] Verify user count accurate

- [ ] **Activity Tracking**
  - [ ] All major actions logged
  - [ ] Correct event types recorded

---

## Firebase Firestore Collections Used

```
users/
├── uid: user profile
events/
├── id: event document
├── registeredCount: auto-incremented
event_registrations/
├── id: registration record
quizzes/
├── id: quiz definition
quiz_attempts/
├── id: submission record
assignments/
├── id: assignment definition
assignment_submissions/
├── id: submission record
activity_logs/
├── id: activity record
```

---

## What's Been Migrated (95% Complete)

| Endpoint | Route | Status | Activity Log |
|----------|-------|--------|--------------|
| Quiz GET | `/api/quizzes/[id]` | ✅ | N/A |
| Quiz Submit | `/api/quizzes/[id]/submit` | ✅ | quiz_attempt |
| Assignment GET | `/api/assignments/[id]` | ✅ | N/A |
| Assignment Submit | `/api/assignments/[id]/submit` | ✅ | assignment_submit |
| Events List | `/api/events` | ✅ | N/A |
| Events Create | `/api/events` | ✅ | event_created |
| Event GET | `/api/events/[id]` | ✅ | N/A |
| Event Update | `/api/events/[id]` | ✅ | event_updated |
| Event Delete | `/api/events/[id]` | ✅ | event_deleted |
| Event Register | `/api/events/[id]/register` | ✅ | event_registered |
| Event Unregister | `/api/events/[id]/register` | ✅ | event_registration_cancelled |
| My Events | `/api/events/my-registrations` | ✅ | N/A |
| Admin Users List | `/api/admin/users` | ✅ | N/A |
| Admin User Create | `/api/admin/users` | ✅ | user_created_admin |
| Admin User GET | `/api/admin/users/[id]` | ✅ | N/A |
| Admin User Update | `/api/admin/users/[id]` | ✅ | user_updated_admin |
| Admin User Deactivate | `/api/admin/users/[id]` | ✅ | user_deactivated_admin |
| Admin Dashboard | `/api/admin/dashboard` | ✅ | N/A |

**Total: 18 endpoints migrated + Activity tracking integrated**

---

## Deployment Status

- ✅ **Build**: Successful (no errors)
- ✅ **GitHub Push**: Complete
- 🔄 **Netlify Deploy**: Automatic (in progress)
- ⏳ **Testing**: Next step

Visit https://app.netlify.com to monitor deployment progress.

---

## Next Steps

1. **Monitor Netlify Deployment** (5-10 minutes)
   - Check build log at https://app.netlify.com
   - Verify deployment completes successfully

2. **Test Each Endpoint** (30-60 minutes)
   - Use curl commands above
   - Verify Firestore data is created
   - Check activity_logs collection

3. **Verify Activity Tracking** (10 minutes)
   - Open Firebase Console
   - Go to Firestore → activity_logs
   - Confirm events logged with correct type & metadata

4. **Final Production Verification** (5 minutes)
   - Test live at https://impactapp-web.netlify.app
   - Check dashboard loads correctly
   - Verify no errors in Sentry

---

## Success Criteria

✅ All 18 endpoints respond correctly to requests
✅ Firestore documents created as expected
✅ Activity logs recorded for all major actions
✅ Admin functions work correctly (create, update, deactivate users)
✅ Event registration/deregistration updates counts correctly
✅ Quiz scoring calculated accurately
✅ Netlify deployment successful and serving live traffic

**Estimated Time to Complete: 1-2 hours**

