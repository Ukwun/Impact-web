# ImpactEdu Database Architecture Investigation Report
**Generated:** April 19, 2026 | **Severity:** CRITICAL 🔴

---

## EXECUTIVE SUMMARY

Your codebase has a **fundamental data storage architecture problem**: New users are being created ONLY in Firestore (Google's NoSQL database), while multiple critical endpoints expect users to exist in PostgreSQL (relational database). This mismatch causes widespread 500 errors and broken features.

**Impact:** ALL Student, Parent, Facilitator, and Admin dashboards are non-functional because they cannot find user data in PostgreSQL.

---

## 1. SIGNUP/AUTH FLOW ANALYSIS

### Current Flow (BROKEN)
```
User Registration
    ↓
Firebase Auth (Creates user with UID)
    ↓
Firestore (Stores user profile in 'users' collection)
    ↓
POSTGRESQL (⚠️ USER NOT CREATED HERE - CRITICAL BUG)
```

### Registration Code Analysis
**File:** [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts#L80-L110)

```typescript
// Line 86-92: Creates Firebase Auth user ✅
const userRecord = await auth.createUser({
  email: email,
  password: password,
  displayName: fullName,
});

// Line 96-107: Creates Firestore profile ✅
const db = getFirestore();
await db.collection('users').doc(userRecord.uid).set({
  uid: userRecord.uid,
  email: email,
  firstName: firstName,
  lastName: lastName,
  role: role,
  // ... other fields
});

// MISSING: No code to create user in PostgreSQL ❌
// Should be: await prisma.user.create({ ... })
```

**Line 126-138:** Returns user object but NEVER saves to PostgreSQL User table.

### What SHOULD Happen
1. Create Firebase Auth user ✅ (currently done)
2. Create Firestore profile ✅ (currently done)
3. **Create PostgreSQL user via Prisma** ❌ (MISSING - adds user to relational DB)

---

## 2. DATA INCONSISTENCY: FIRESTORE vs POSTGRESQL ENDPOINTS

### All Endpoints by Database

#### FIRESTORE ENDPOINTS (User data exists here)
| Endpoint | File | Operation | Status |
|----------|------|-----------|--------|
| POST /api/auth/register | auth/register/route.ts | Create user | ✅ Works |
| GET /api/user/profile | user/profile/route.ts | Read user | ⚠️ Works if user in Firestore |
| GET /api/events | events/route.ts | List events | ✅ Uses Firestore |
| GET /api/events/[id] | events/[id]/route.ts | Get event | ✅ Uses Firestore |
| POST /api/events/[id]/register | events/[id]/register/route.ts | Register for event | ⚠️ Firestore |
| GET /api/assignments/[id] | assignments/[id]/route.ts | Get assignment | ✅ Uses Firestore |
| GET /api/admin/users | admin/users/route.ts | List users (admin) | Uses Firestore |
| POST /api/admin/seed | admin/seed/route.ts | Seed database | Both (Firestore + hardcoded) |

#### POSTGRESQL ENDPOINTS (User data MISSING here = BROKEN)
| Endpoint | File | Query | Expected Data | Actual Data | Status |
|----------|------|-------|---|---|--------|
| GET /api/progress | progress/route.ts | `prisma.enrollment.findMany({userId})` | User + Enrollments | ❌ NO USER | 🔴 BROKEN |
| GET /api/leaderboard | leaderboard/route.ts | `prisma.leaderboardEntry.findMany()` | Users on leaderboard | ❌ EMPTY | 🔴 BROKEN |
| GET /api/leaderboard/my-rank | leaderboard/my-rank/route.ts | `prisma.leaderboardEntry.findUnique()` | User rank | ❌ NOT FOUND | 🔴 BROKEN |
| GET /api/facilitator/classes | facilitator/classes/route.ts | `prisma.course.findMany()` | Courses taught | ⚠️ No user ref | 🔴 BROKEN |
| GET /api/parent-child | parent-child/route.ts | `prisma.enrollment.findMany()` | Parent's children | ❌ NO USER | 🔴 BROKEN |
| GET /api/admin/dashboard | admin/dashboard/route.ts | `prisma.user.findMany()` | All users | ❌ EMPTY TABLE | 🔴 BROKEN |
| GET /api/admin/tiers | admin/tiers/route.ts | `prisma.membershipTier.findMany()` | Membership tiers | ⚠️ Tiers exist but no users | 🟡 PARTIAL |
| GET /api/achievements | achievements/route.ts | Hardcoded array | All achievement defs | ✅ Hardcoded | 🟢 WORKS |
| GET /api/achievements/user | achievements/user/route.ts | `prisma.userAchievement.findMany()` | User achievements | ❌ NO USER | 🔴 BROKEN |
| GET /api/analytics | analytics/route.ts | `prisma.user.count()` | User stats | ❌ ZERO USERS | 🔴 BROKEN |
| GET /api/circle-member | circle-member/route.ts | `prisma.user.findMany({role})` | Circle members | ❌ EMPTY | 🔴 BROKEN |

---

## 3. BROKEN FEATURE ENDPOINTS - ROOT CAUSE ANALYSIS

### 1. `/api/user/profile` - FIRESTORE DEPENDENT
**Status:** ⚠️ Conditional - Works ONLY if user profile synced to Firestore

**File:** [src/app/api/user/profile/route.ts](src/app/api/user/profile/route.ts#L1-60)

```typescript
export async function GET(req: NextRequest) {
  const userId = payload.sub;
  
  // Line 25: Reads from Firestore ONLY
  const userProfile = await getUserProfile(userId);
  
  if (!userProfile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }
  
  return NextResponse.json({ success: true, data: userProfile });
}
```

**Why it works:** Firestore collection has users
**Why it might fail:** If Firestore sync fails, profile not found (line 23-26)

---

### 2. `/api/progress` - POSTGRESQL BROKEN
**Status:** 🔴 CRITICAL - Reading from empty table

**File:** [src/app/api/progress/route.ts](src/app/api/progress/route.ts#L30-45)

```typescript
export async function GET(req: NextRequest) {
  const userId = payload.sub;
  
  // Line 40: Tries to find enrollments for user in PostgreSQL
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },  // ❌ This userId doesn't exist in PostgreSQL User table
    include: {
      course: { ... },
      progress: { ... }
    },
  });
  
  // Returns empty array because user not in PostgreSQL
  return NextResponse.json({ success: true, data: enrollments });
}
```

**Why it fails:**
1. User created ONLY in Firestore
2. User NOT in PostgreSQL `users` table
3. `prisma.enrollment.findMany({userId})` finds nothing
4. Looks like service is working but returns empty data
5. Frontend sees empty progress, appears broken

---

### 3. `/api/leaderboard` - POSTGRESQL BROKEN
**Status:** 🔴 CRITICAL - Reading from empty table

**File:** [src/app/api/leaderboard/route.ts](src/app/api/leaderboard/route.ts#L1-50)

```typescript
export async function GET(request: NextRequest) {
  // Line 20-30: Queries leaderboard entries from PostgreSQL
  const leaderboardEntries = await prisma.leaderboardEntry.findMany({
    where: whereClause,
    include: {
      user: {  // ❌ Trying to join with User table - NO USERS EXIST
        select: { id, firstName, lastName, avatar, state, institution }
      },
    },
    orderBy: { totalScore: "desc" },
    take: limit,
    skip: offset,
  });
  
  return NextResponse.json({ success: true, data: leaderboard });
}
```

**Why it fails:**
1. `prisma.leaderboardEntry.findMany()` tries to join with non-existent users
2. Leaderboard entries exist, but user references point to users that don't exist
3. Returns empty array or 500 error
4. **Error handling:** Line 70-75 catches and returns 500 error

---

### 4. `/api/achievements` - HYBRID APPROACH
**Status:** 🟢 WORKS (but inherently fragile)

**File:** [src/app/api/achievements/route.ts](src/app/api/achievements/route.ts#L1-100)

```typescript
export async function GET(request: NextRequest) {
  // Returns hardcoded achievement definitions
  const allAchievements = [
    { id: "first_course", title: "First Steps", ... },
    { id: "five_courses", title: "Scholar", ... },
    // ... 10+ more hardcoded achievements
  ];
  
  return NextResponse.json({
    success: true,
    data: allAchievements,
    total: allAchievements.length,
  });
}
```

**Why it works:** Returns hardcoded list, doesn't query database
**Why it's fragile:** No connection to actual achievement system; would need manual updates

---

### 5. `/api/facilitator/classes` - POSTGRESQL BROKEN
**Status:** 🔴 CRITICAL - Role check fails

**File:** [src/app/api/facilitator/classes/route.ts](src/app/api/facilitator/classes/route.ts#L1-50)

```typescript
export async function GET(req: NextRequest) {
  const payload = verifyToken(token);
  
  // Line 21: Check if user is FACILITATOR
  if (payload.role?.toUpperCase() !== "FACILITATOR") {
    return NextResponse.json(
      { error: "Unauthorized - FACILITATOR role required" },
      { status: 403 }
    );
  }
  
  const userId = payload.sub;
  
  // Line 27: Tries to find courses for this facilitator
  const courses = await prisma.course.findMany({
    // Assumes courses have instructorId field referencing user
    // But user doesn't exist in PostgreSQL User table!
  });
}
```

**Why it fails:**
1. Role check passes (token has role)
2. Tries to query courses by `instructorId` 
3. `instructorId` points to user not in PostgreSQL User table
4. Foreign key constraint or empty result returns 500

---

### 6. `/api/parent-child` - POSTGRESQL BROKEN
**Status:** 🔴 CRITICAL - Reading from empty table

**File:** [src/app/api/parent-child/route.ts](src/app/api/parent-child/route.ts#L1-55)

```typescript
export async function GET(request: NextRequest) {
  const payload = verifyToken(token);
  
  // Line 25: Check if user is PARENT
  if (payload.role?.toUpperCase() !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized - PARENT role required" }, { status: 403 });
  }
  
  const userId = payload.sub;
  
  // Line 35: Tries to find parent's children (students)
  const studentEnrollments = await prisma.enrollment.findMany({
    where: {
      user: { role: "STUDENT" }  // ❌ No STUDENT records in PostgreSQL User table
    },
    include: { user: {...}, course: true },
    distinct: ["userId"],
  });
  
  // Returns empty array
  return NextResponse.json({ success: true, data: children });
}
```

**Why it fails:**
1. Parent role check passes
2. Queries for student enrollments in PostgreSQL
3. NO STUDENT users exist in PostgreSQL User table
4. Returns empty children list

---

## 4. OTHER ROLES STATUS

### Student Role (`/api/progress`)
- **Database:** PostgreSQL via Prisma
- **User Data Location:** Firestore ONLY
- **Status:** 🔴 BROKEN - Student progress cannot be retrieved
- **Error:** Returns empty enrollments or 500 error

### Facilitator Role (`/api/facilitator/classes`)
- **Database:** PostgreSQL via Prisma
- **User Data Location:** Firestore ONLY
- **Status:** 🔴 BROKEN - Facilitator cannot see their courses
- **Error:** Foreign key mismatch or 500 error

### Parent Role (`/api/parent-child`)
- **Database:** PostgreSQL via Prisma
- **User Data Location:** Firestore ONLY
- **Status:** 🔴 BROKEN - Parent cannot see children's progress
- **Error:** Returns empty children list

### Admin Role (`/api/admin/dashboard`, `/api/admin/tiers`)
- **Database:** PostgreSQL via Prisma
- **User Data Location:** Firestore ONLY
- **Status:** 🔴 BROKEN - Admin dashboard shows 0 users
- **Error:** Empty result sets, no user data to display

---

## 5. COMPREHENSIVE ENDPOINT STATUS TABLE

| Endpoint | DB | User Data Location | Status | Error | Fix Priority |
|----------|----|--------------------|--------|-------|--------------|
| **POST /api/auth/register** | Both | Firestore ✅ + PostgreSQL ❌ | 🔴 BROKEN | No PostgreSQL record | 🔴 P1 |
| **GET /api/user/profile** | Firestore | Firestore ✅ | ⚠️ Works | May fail if sync incomplete | 🟡 P3 |
| **GET /api/progress** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | Empty enrollments | 🔴 P1 |
| **GET /api/leaderboard** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | FK constraint or 500 | 🔴 P1 |
| **GET /api/leaderboard/my-rank** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | User not found | 🔴 P1 |
| **GET /api/facilitator/classes** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | FK mismatch | 🔴 P1 |
| **GET /api/parent-child** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | Empty children | 🔴 P1 |
| **GET /api/admin/dashboard** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | Zero users shown | 🔴 P1 |
| **GET /api/admin/tiers** | PostgreSQL | Firestore (not synced) | 🟡 PARTIAL | Tiers exist, no user refs | 🟡 P2 |
| **GET /api/achievements** | Static | Hardcoded | 🟢 WORKS | None | 🟢 P4 |
| **GET /api/achievements/user** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | No user achievements | 🔴 P1 |
| **GET /api/events** | Firestore | Firestore ✅ | 🟢 WORKS | None | 🟢 P4 |
| **POST /api/events/[id]/register** | Firestore | Firestore ✅ | 🟢 WORKS | None | 🟢 P4 |
| **GET /api/courses/[id]** | PostgreSQL | Firestore (not synced) | 🟡 WORKS (mostly) | Course data OK, user refs broken | 🟡 P2 |
| **GET /api/analytics** | PostgreSQL | Firestore (not synced) | 🔴 BROKEN | Zero users/courses | 🔴 P1 |

---

## 6. ROOT CAUSE ANALYSIS

### The Core Problem
Your application uses TWO completely separate databases:

```
┌─────────────────────────────────────────┐
│  Firebase Auth (Authentication)         │
│  └─> Creates user UID                   │
└─────────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Firestore (NoSQL Document Store)    │
    │ └─> Stores user profile in          │
    │     collection 'users'              │
    │     Used by: Events, Assignments    │
    └─────────────────────────────────────┘
              ❌ (MISSING)
    ┌─────────────────────────────────────┐
    │ PostgreSQL (Relational Database)    │
    │ └─> User table EMPTY                │
    │     Expected by: Progress,          │
    │     Leaderboard, Facilitator,       │
    │     Parent, Admin, Analytics        │
    └─────────────────────────────────────┘
```

### Why This Happened
The codebase appears to have been:
1. **Originally Firestore-based** - Events, assignments use Firestore utilities
2. **Later migrated to PostgreSQL** - Courses, enrollments added with Prisma
3. **Never completed migration** - Registration endpoint wasn't updated to sync users to PostgreSQL

---

## 7. SOLUTION OPTIONS

### OPTION 1: PostgreSQL-First (RECOMMENDED) ✅
**Effort:** Medium | **Time:** 4-6 hours | **Complexity:** Medium

**Steps:**
1. Update `/api/auth/register` to create user in PostgreSQL via Prisma
2. Update `/api/user/profile` to read from PostgreSQL instead of Firestore
3. Keep Firestore for events/assignments (separate feature area)
4. Update firestore-utils to handle dual-DB reads

**Pros:**
- Single source of truth for users (PostgreSQL)
- Fixes all broken endpoints immediately
- Minimal API changes
- Scales better (relational queries more efficient)

**Cons:**
- Firestore users collection becomes redundant
- Requires data migration for existing Firestore users

**Implementation:**
```typescript
// In /api/auth/register, add this after Firebase creation:
await prisma.user.create({
  data: {
    id: userRecord.uid,  // Use Firebase UID as primary key
    email: email,
    firstName: firstName,
    lastName: lastName,
    passwordHash: "",    // Not used (handled by Firebase Auth)
    role: role as UserRole,
    state: state,
    institution: body.institution || "",
    verified: false,
  }
});
```

### OPTION 2: Firestore-First (NOT RECOMMENDED) ❌
**Effort:** Very High | **Time:** 16-24 hours | **Complexity:** High

**Steps:**
1. Migrate all Prisma queries to Firestore queries
2. Rewrite endpoints: progress, leaderboard, facilitator, parent, admin
3. Create Firestore subcollections for enrollments, achievements, etc.
4. Remove PostgreSQL dependency

**Pros:**
- Single database (Firestore)
- Fully NoSQL architecture

**Cons:**
- Most Prisma endpoints require rewriting
- Firestore queries less efficient for relational operations
- More complex subcollection joins
- Higher database costs at scale

### OPTION 3: Async Sync (NOT RECOMMENDED) ❌
**Effort:** High | **Time:** 12-16 hours | **Complexity:** High

**Steps:**
1. Keep both databases
2. Create background job to sync Forestore users → PostgreSQL
3. Add queue for user creation events
4. Handle race conditions and conflicts

**Pros:**
- Supports both architectures temporarily
- Gradual migration path

**Cons:**
- Adds complexity and maintenance
- Sync failures cause data inconsistency
- Higher infrastructure cost
- Harder to debug issues

---

## 8. IMMEDIATE RECOMMENDATIONS

### Critical (Must Fix)
1. **Fix User Registration** - Update `/api/auth/register` to create users in PostgreSQL
2. **Fix User Profile Route** - Update to read from PostgreSQL
3. **Verify Foreign Keys** - Ensure courses, enrollments reference correct user IDs

### High Priority
1. Test all broken endpoints after fix
2. Migrate existing Firestore users to PostgreSQL
3. Update documentation

### Medium Priority
1. Standardize database usage across all endpoints
2. Remove redundant Firestore user collection
3. Performance optimization

---

## 9. IMPLEMENTATION PRIORITY CHECKLIST

```
PHASE 1: Fix User Storage (4-6 hours)
  ☐ Update /api/auth/register to create PostgreSQL user
  ☐ Update /api/user/profile to read from PostgreSQL
  ☐ Test with new registration
  
PHASE 2: Fix Role-Based Endpoints (2-3 hours)
  ☐ Verify /api/progress works
  ☐ Verify /api/facilitator/classes works
  ☐ Verify /api/parent-child works
  ☐ Verify /api/admin/dashboard works
  
PHASE 3: Data Migration (2-3 hours)
  ☐ Migrate existing Firestore users to PostgreSQL
  ☐ Create backup of Firestore data
  ☐ Verify all users migrated correctly
  
PHASE 4: Cleanup (1-2 hours)
  ☐ Remove redundant Firestore user collection usage
  ☐ Update firestore-utils documentation
  ☐ Remove unused Firestore code paths
```

---

## CONCLUSION

Your application has a **critical architectural flaw**: Users are created ONLY in Firestore but required in PostgreSQL by most endpoints. This causes 8+ endpoints to fail or return empty data across all user roles (Student, Parent, Facilitator, Admin).

**The fix is straightforward:** Update registration to create users in PostgreSQL, and update user profile endpoint to read from PostgreSQL.

**Estimated fix time:** 4-6 hours for full implementation and testing.

**Recommendation:** Adopt PostgreSQL-First approach (Option 1) for immediate stability and long-term maintainability.
