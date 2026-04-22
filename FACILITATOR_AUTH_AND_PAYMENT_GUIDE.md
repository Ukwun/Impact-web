# Facilitator Authorization & Payment Model Guide

## 🔴 Issue 1: Facilitator "Unauthorized" Error on Course Creation

### Problem
Facilitators getting "Error; unauthorized" when trying to create a course.

### Root Causes Found & Fixed

#### ✅ Fix 1: Facilitator API Endpoint Issues (FIXED)
**File:** `src/app/api/facilitator/courses/route.ts`

**Problems Found:**
```typescript
// ❌ BEFORE (Wrong)
import { prisma } from '@/lib/db';           // Wrong import path
const payload = await verifyToken(token);     // verifyToken isn't async!
const userId = payload.userId;                // Should be payload.sub
```

**Fixed:**
```typescript
// ✅ AFTER (Correct)
import { prisma } from '@/lib/prisma';        // Correct import
const payload = verifyToken(token);           // Synchronous call
const userId = payload.sub;                   // Correct JWT property
```

---

## ⚠️ Remaining Authorization Issues to Check

### 1. **Token Validation Chain**

When facilitator creates course, this happens:

```
Facilitator clicks "Create Course"
    ↓
CourseFormModal reads token from localStorage
    ↓
POST /api/courses (with Authorization: Bearer <token>)
    ↓
getAuthUser() extracts token
    ↓
verifyToken(token) decodes JWT
    ↓
Checks if payload.role === "FACILITATOR" or "ADMIN"
    ↓
If valid: Create course
If invalid: Return 401 "Unauthorized"
```

###2. **Common Token Issues**

Your facilitator might be getting "Unauthorized" because:

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Token expired** | Login was >30 days ago | Re-login to get fresh token |
| **Token malformed** | Wrong JWT structure | Check localStorage has valid token |
| **Token wrong key** | Signed with old JWT_SECRET | Must use current env JWT_SECRET |
| **Role not set** | payload.role is undefined/null | Check user.role in database |
| **Case sensitivity** | Role stored as "facilitator" (lowercase) | Roles must be UPPERCASE in DB |
| **Token not sent** | Authorization header missing | Check localStorage.authToken exists |

###3. **Debugging Steps**

**Step 1: Check if token is valid**

Open browser DevTools (F12) → Console → Run:
```javascript
// Check if token exists
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Decode without verification (see what's in it)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Decoded payload:', payload);
// Should show: { sub: "user-id", email: "...", role: "FACILITATOR", ... }
```

**Step 2: Check user role in database**

Admin should run:
```bash
# Connect to PostgreSQL
psql -U pguser -d impactapp -h localhost

# Check facilitator's role
SELECT id, email, role FROM "User" WHERE email = 'facilitator@school.com';

# Should show: role = 'FACILITATOR' (must be uppercase)
```

**Step 3: Enable API Logging**

Update `src/app/api/courses/route.ts` POST handler:
```typescript
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  
  // Add logging
  console.log('📍 Course Creation Attempt');
  console.log('  User:', user ? `${user.sub} (${user.role})` : 'NOT FOUND');
  console.log('  Auth header:', req.headers.get('authorization') ? 'Present' : 'MISSING');
  
  if (!user) {
    console.log('  ❌ FAILED: No user (invalid/missing token)');
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isAuthorized(user.role)) {
    console.log(`  ❌ FAILED: User role "${user.role}" not authorized`);
    return NextResponse.json(
      { success: false, error: "Only facilitators and admins can create courses" },
      { status: 403 }
    );
  }

  console.log('  ✅ SUCCESS: User authorized, creating course...');
  // ... rest of course creation
}
```

**Step 4: Reproduce the Error**

1. Open DevTools Network tab (F12 → Network)
2. Click "Create Course"
3. Look for POST /api/courses request
4. Check Response tab - what's the exact error?
5. Check browser console - did you see the debug logs?

---

## 💰 Issue 2: Payment & Monetization Model

### Question: When do users start paying?

Based on your codebase architecture, here's the intended model:

###Current Implementation

**✅ What's Already Built:**

1. **Course Types:**
   - Free courses: `isPublished: true`, `isPaid: false` (available to all)
   - Paid courses: `isPublished: true`, `isPaid: true` (require enrollment)

2. **Enrollment Flow:**
   - Student views paid course → "Pay Now" button
   - Clicks → Redirected to /payments page
   - Selects payment method (Flutterwave, Stripe, Bank Transfer)
   - Completes payment
   - Enrollment auto-created
   - Access granted

3. **Current Pricing:**
   - Hardcoded in database per course
   - Example: Psychology 101 = $49.99 USD / £39.99 GBP

### Recommended Real-Life Experience Model

Since you mentioned this is "realistic" with real experiences:

```
┌─ FREE CONTENT (Funnel) ──────────────────────┐
│  • Landing pages                             │
│  • Sample lessons                            │
│  • Event registrations (free events)         │
│  • Community access                          │
│  → Goal: Build trust, demonstrate value      │
└──────────────────────────────────────────────┘
                       ↓
           USER DECIDES TO LEARN
                       ↓
┌─ ENGAGEMENT TIER (Freemium) ─────────────────┐
│  • Free tier: 3 lessons max per course       │
│  • Free tier: 1 assessment per course        │
│  • Free tier: Community discussions only     │
│  → Upsell trigger: "Unlock full access"      │
└──────────────────────────────────────────────┘
                       ↓
        USER READY FOR FULL EXPERIENCE
                       ↓
┌─ PAID COURSES (Premium) ────────────────────┐
│  TIER 1: Single Course ($29-99)              │
│    • Full course access                      │
│    • All lessons + assessments               │
│    • Grading from facilitator                │
│    • Certificate upon completion             │
│                                              │
│  TIER 2: Program Bundle ($99-299)            │
│    • 3-5 related courses                     │
│    • Group project experience                │
│    • Direct mentor access                    │
│    • Professional portfolio                  │
│                                              │
│  TIER 3: Subscription ($9-29/month)          │
│    • All courses access                      │
│    • Live masterclasses                      │
│    • Priority support                        │
│    • Certification paths                     │
│                                              │
│  TIER 4: Enterprise (Custom)                 │
│    • School/Organization licensing           │
│    • Multiple user seats                     │
│    • Custom content creation                 │
│    • Integration support                     │
│                                              │
│  REAL EXPERIENCE ADD-ONS:                    │
│    • Field visits ($15-50)                   │
│    • Expert consultations ($20-100/hr)       │
│    • Internship placements ($0-299)          │
│    • Certification exams ($50-200)           │
└──────────────────────────────────────────────┘
```

### Implementation Checklist

- [ ] **Define which courses are paid** (Update in DB)
- [ ] **Set pricing per course** (Create pricing table)
- [ ] **Add payment status to enrollment** (Add enum: FREE/PAID/TRIAL)
- [ ] **Restrict paid content** (Check payment status before access)
- [ ] **Create subscription model** (Optional - for recurring revenue)
- [ ] **Add promo codes/discounts** (Marketing feature)
- [ ] **Enable partial refunds** (Refund policy)
- [ ] **Add receipts/invoices** (Business requirement)

### Code Changes Needed

**1. Update Enrollment model to track payment:**

```prisma
model Enrollment {
  id String @id @default(cuid())
  userId String
  courseId String
  
  // New fields
  paymentStatus String @default("PENDING")  // PENDING, COMPLETED, REFUNDED
  paymentId String?     // Links to Payment record
  paidAmount Float?     // How much paid
  paidAt DateTime?      // When paid
  
  status String @default("active")  // active, completed, dropped
  
  createdAt DateTime @default(now())
  
  @@unique([userId, courseId])  // Can't enroll twice
}

model Payment {
  id String @id @default(cuid())
  userId String
  courseId String
  
  amount Float              // Amount in cents
  currency String           // USD, GBP, NGN
  paymentMethod String      // stripe, flutterwave, bank
  paymentIntentId String?   // Stripe session ID
  
  status String @default("PENDING")  // PENDING, COMPLETED, FAILED, REFUNDED
  refundedAt DateTime?
  refundAmount Float?
  
  createdAt DateTime @default(now())
  completedAt DateTime?
}

model Course {
  // ... existing fields ...
  isPaid Boolean @default(false)           // Is this a paid course?
  price Float?                             // In dollars
  priceGBP Float?                          // UK pricing
  priceNGN Float?                          // Nigeria pricing (optional)
}
```

**2. Protect paid course access (in API):**

```typescript
export async function GET(req: NextRequest, { params: { courseId } }: { params: { courseId: string } }) {
  const user = getAuthUser(req);
  if (!user) return new NextResponse(null, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        where: { userId: user.sub },
      }
    }
  });

  if (!course) return new NextResponse(null, { status: 404 });

  // Check if paid course
  if (course.isPaid) {
    const enrollment = course.enrollments[0];
    
    // Must be enrolled AND payment completed
    if (!enrollment || enrollment.paymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: "This course requires payment. Please enroll and complete payment." },
        { status: 403 }
      );
    }
  }

  // Return course content
  return NextResponse.json({ course });
}
```

### Revenue Projection Example

**Conservative Scenario (Year 1):**
```
Month 1-3:  100 students × $49 = $4,900
Month 4-6:  250 students × $49 = $12,250
Month 7-9:  500 students × $49 = $24,500
Month 10-12: 800 students × $49 = $39,200

Year 1 Revenue: ~$80,850
Less payment fees (2.9%): ~$2,348
Less hosting costs: ~$1,200
**NET: ~$77,302**

(This assumes organic growth and conservative pricing)
```

---

## 📋 Action Items

### Immediate (Fix Authorization)
- [ ] Verify facilitator token using browser DevTools
- [ ] Check user.role in database is uppercase "FACILITATOR"
- [ ] Check localStorage.authToken exists & isn't expired
- [ ] Run API with debug logging enabled
- [ ] Compare error between `/api/courses` vs `/api/facilitator/courses`

### Short Term (Implement Payments)
- [ ] Define pricing strategy
- [ ] Update Enrollment/Payment schema
- [ ] Add isPaid flag to Course model
- [ ] Implement access control checks
- [ ] Test payment flow end-to-end

### Medium Term (Optimize)
- [ ] Add subscription support (recurring billing)
- [ ] Implement promo codes
- [ ] Add payment receipts/invoices
- [ ] Create admin pricing dashboard
- [ ] Add analytics (revenue, conversion rates)

---

## 🔗 Related APIs

| Endpoint | Purpose | Requires |
|----------|---------|----------|
| `POST /api/courses` | Create course | FACILITATOR role |
| `POST /api/courses/[id]/enroll` | Enroll student | Valid JWT |
| `POST /api/payments/stripe/checkout` | Start payment | Course ID + price |
| `POST /api/payments/stripe/webhook` | Complete enrollment | Stripe callback |
| `GET /api/payments/[id]/status` | Check payment | Payment ID |

---

## 💡 Next Steps

1. **Debug the facilitator issue** using the steps above
2. **Collect payment requirements** - how much to charge?
3. **Plan monetization tiers** - what's your value prop?
4. **Test payment flow** - create test payment to verify
5. **Go live** - configure Stripe/Flutterwave test keys → live keys

Need help with any of these steps?
