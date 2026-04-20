# SCHOOL_ADMIN Dashboard Implementation

## Overview

The SCHOOL_ADMIN dashboard enables school administrators to manage their institution's learning ecosystem. This role focuses on three core responsibilities:

1. **Facilitator Approvals** - Review and approve pending teacher applications
2. **User Management** - Activate, deactivate, and manage school accounts
3. **Report Generation** - Create data exports for enrollment, progress, and grades analysis

## Architecture

### Role-Based Access Control

All SCHOOL_ADMIN APIs enforce role verification:

```typescript
// Every endpoint validates:
const payload = await verifyToken(token);
if (!payload || payload.role !== "SCHOOL_ADMIN") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

School data is filtered by the admin's schoolId to ensure isolation:

```typescript
const users = await prisma.user.findMany({
  where: {
    schoolId: payload.schoolId,  // Only their school
    role: "STUDENT"              // Filter by role
  }
});
```

## Dashboard Data Flow

### 1. Dashboard Metrics Loading

**Endpoint:** `GET /api/school-admin/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 245,
    "totalCourses": 12,
    "totalEnrollments": 892,
    "pendingApprovals": 5,
    "activeFacilitators": 18
  }
}
```

**Use Case:** Display KPI cards showing school overview

**Data Sources:**
- Total Users: Count all active users in school
- Total Courses: Count active courses
- Total Enrollments: Count enrollment records
- Pending Approvals: Count users with role = "FACILITATOR_PENDING"
- Active Facilitators: Count users with role = "FACILITATOR" and status = "ACTIVE"

### 2. Facilitator Approvals

#### Get Pending Facilitators

**Endpoint:** `GET /api/school-admin/facilitators/pending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "Jane Smith",
      "email": "jane@school.edu",
      "qualifications": ["Bachelor of Science", "Teaching Certificate"],
      "dateApplied": "2026-04-01T10:00:00Z",
      "status": "PENDING"
    }
  ]
}
```

**Database Query:**
```typescript
await prisma.user.findMany({
  where: {
    schoolId: adminSchoolId,
    role: "FACILITATOR_PENDING"
  },
  select: {
    id: true,
    name: true,
    email: true,
    // qualifications: from profile data
    createdAt: true
  }
});
```

#### Approve Facilitator

**Endpoint:** `POST /api/school-admin/facilitators/[id]/approve`

**Action:**
1. Update user role from "FACILITATOR_PENDING" → "FACILITATOR"
2. Set status to "ACTIVE"
3. Create notification for facilitator
4. Send welcome email

**Database Changes:**
```typescript
await prisma.user.update({
  where: { id: facilitatorId },
  data: {
    role: "FACILITATOR",
    status: "ACTIVE",
    approvedAt: new Date(),
    approvedBy: adminId
  }
});
```

**Side Effects:**
```typescript
// Create audit log
await prisma.auditLog.create({
  data: {
    schoolId: adminSchoolId,
    action: "FACILITATOR_APPROVED",
    userId: facilitatorId,
    performedBy: adminId,
    timestamp: new Date()
  }
});

// Send email
await sendEmail({
  to: facilitator.email,
  subject: "Your Application Has Been Approved",
  template: "facilitator-approved",
  data: { name: facilitator.name }
});
```

#### Reject Facilitator

**Endpoint:** `POST /api/school-admin/facilitators/[id]/reject`

**Action:**
1. Update user role to "FACILITATOR_REJECTED"
2. Set status to "INACTIVE"
3. Create rejection notification with feedback
4. Send rejection email

**Database Changes:**
```typescript
await prisma.user.update({
  where: { id: facilitatorId },
  data: {
    role: "FACILITATOR_REJECTED",
    status: "INACTIVE",
    rejectionReason: feedback,
    rejectedAt: new Date(),
    rejectedBy: adminId
  }
});
```

### 3. User Management

#### Get All School Users

**Endpoint:** `GET /api/school-admin/users?role=STUDENT&status=ACTIVE&page=1`

**Query Parameters:**
- `role`: Filter by role (PARENT, STUDENT, FACILITATOR, all)
- `status`: Filter by status (ACTIVE, INACTIVE)
- `page`: Pagination (20 per page)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_456",
      "name": "John Doe",
      "email": "john@school.edu",
      "role": "STUDENT",
      "status": "ACTIVE",
      "createdAt": "2026-03-15T08:00:00Z",
      "enrollmentCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 245
  }
}
```

**Database Query:**
```typescript
const users = await prisma.user.findMany({
  where: {
    schoolId: adminSchoolId,
    ...(role && role !== "all" && { role }),
    ...(status && { status })
  },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    _count: { select: { enrollments: true } }
  },
  skip: (page - 1) * 20,
  take: 20
});
```

#### Update User Status

**Endpoint:** `PATCH /api/school-admin/users`

**Body:**
```json
{
  "userId": "user_456",
  "status": "INACTIVE"
}
```

**Action:**
1. Verify user belongs to admin's school
2. Update user status
3. If deactivating, log suspension reason
4. Send notification email

**Business Logic:**
- Cannot directly deactivate FACILITATOR_PENDING users
- Deactivation cancels any pending enrollments
- Reactivation requires admin confirmation

### 4. Report Generation

#### Get Reports

**Endpoint:** `GET /api/school-admin/reports?type=enrollment&format=csv`

**Report Types:**

##### Enrollment Report

**Data Columns:**
- Course ID
- Course Name
- Total Enrolled
- Percent Complete
- Last Updated

**Query:**
```typescript
const enrollmentData = await prisma.course.findMany({
  where: { schoolId: adminSchoolId },
  select: {
    id: true,
    name: true,
    _count: { select: { enrollments: true } },
    enrollments: {
      select: {
        completionPercentage: true
      }
    }
  }
});
```

##### Progress Report

**Data Columns:**
- Student Name
- Current Course
- Course Progress %
- Completed Courses
- Overall Progress %

**Query:**
```typescript
const progress = await prisma.user.findMany({
  where: {
    schoolId: adminSchoolId,
    role: "STUDENT"
  },
  select: {
    name: true,
    enrollments: {
      select: {
        course: { select: { name: true } },
        completionPercentage: true,
        status: true
      },
      orderBy: { enrolledAt: "desc" },
      take: 1
    }
  }
});
```

##### Grades Report

**Data Columns:**
- Student Name
- Subject/Course
- Average Grade
- Number of Grades
- Last Graded Date

**Query:**
```typescript
const grades = await prisma.submission.groupBy({
  by: ["studentId"],
  where: {
    gradeReceived: { not: null },
    // Filter by school via course enrollment
  },
  _avg: { gradeReceived: true },
  _count: { id: true }
});
```

##### CSV Generation

The endpoint returns CSV formatted data:

```typescript
const csv = [
  "Name,Email,Role,Status,Created Date",
  ...users.map(u => 
    `${u.name},${u.email},${u.role},${u.status},${u.createdAt.toISOString().split('T')[0]}`
  )
].join("\n");

return new NextResponse(csv, {
  headers: {
    "Content-Type": "text/csv",
    "Content-Disposition": `attachment; filename="report-${date}.csv"`
  }
});
```

## UI Components

### FacilitatorApprovalModal

Displays pending teacher applications with a two-panel interface:

**Left Panel:** List of pending facilitators
- Shows name, email, experience
- Click to select for review

**Right Panel:** Details and decision interface
- Full facilitator information
- Qualification and experience details
- Approve/Reject buttons with optional feedback

**Props:**
```typescript
interface FacilitatorApprovalModalProps {
  isOpen: boolean;
  pendingFacilitators: PendingFacilitator[];
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, feedback?: string) => Promise<void>;
}
```

### SchoolReportsModal

Report generation interface with type selection:

**Features:**
- Report type dropdown (Enrollment, Progress, Grades)
- Date range selection
- Format selection (CSV, JSON)
- Download button

**Props:**
```typescript
interface SchoolReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (reportType: string) => Promise<void>;
}
```

### UserManagementModal

User directory with filtering and status management:

**Features:**
- User list with pagination
- Role filter dropdown
- Status filter (Active/Inactive)
- Individual status toggle buttons
- Bulk actions

**Props:**
```typescript
interface UserManagementModalProps {
  isOpen: boolean;
  users: SchoolUser[];
  onClose: () => void;
  onUpdateUser: (userId: string, status: string) => Promise<void>;
}
```

## SchoolAdminDashboard Component

The main dashboard coordinates all functionality:

```typescript
export default function SchoolAdminDashboard() {
  // State management
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pendingFacilitators, setPendingFacilitators] = useState<PendingFacilitator[]>([]);
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([]);

  // Modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);

  // Load all data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handler: Approve facilitator
  const handleApproveFacilitator = async (facilitatorId: string) => {
    const res = await fetch(`/api/school-admin/facilitators/${facilitatorId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    // Refresh data
    await loadDashboardData();
  };

  // Handler: Generate report
  const handleGenerateReport = async (reportType: string) => {
    const res = await fetch(`/api/school-admin/reports?type=${reportType}&format=csv`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Download as CSV file
  };
}
```

## Authentication & Authorization

### Token Validation

Every request validates the JWT token:

```typescript
const authHeader = request.headers.get("Authorization");
const token = authHeader?.replace("Bearer ", "");

const payload = await verifyToken(token);
if (!payload) {
  return NextResponse.json({ error: "Invalid token" }, { status: 401 });
}
```

### Role Verification

Checks user role matches expected access level:

```typescript
if (payload.role !== "SCHOOL_ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### School Isolation

All queries filter by the admin's school ID:

```typescript
// Admin can only see their own school's data
const schoolId = payload.schoolId;
const data = await prisma.user.findMany({
  where: {
    schoolId: schoolId  // Critical security boundary
  }
});
```

## Error Handling

### Common Error Scenarios

**401 Unauthorized:**
- Missing or invalid token
- Token expired
- Response: Clear auth and redirect to login

**403 Forbidden:**
- User role is not SCHOOL_ADMIN
- Attempting to access another school's data
- Response: Error card with message

**404 Not Found:**
- Facilitator or user does not exist
- School not found
- Response: Graceful error message

### Example Error Response:

```typescript
if (!facilitator || facilitator.schoolId !== adminSchoolId) {
  return NextResponse.json(
    { error: "Facilitator not found" },
    { status: 404 }
  );
}
```

## Data Validation

### Input Validation

All API endpoints validate inputs:

```typescript
const { userId, status } = req.body;

if (!userId || !status) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }
  );
}

if (!["ACTIVE", "INACTIVE"].includes(status)) {
  return NextResponse.json(
    { error: "Invalid status value" },
    { status: 400 }
  );
}
```

### Database Constraints

- Foreign key constraints prevent orphaned records
- Unique constraints on email within school
- Check constraints for valid status values

## Performance Considerations

### Query Optimization

- Use `select` to fetch only needed fields
- Implement pagination for large lists (20 per page)
- Index on `schoolId` for efficient filtering
- Cache dashboard metrics briefly (30 seconds)

### Example Optimized Query:

```typescript
const users = await prisma.user.findMany({
  where: { schoolId },
  select: {  // Only needed fields
    id: true,
    name: true,
    email: true
  },
  skip: (page - 1) * 20,
  take: 20  // Pagination
});
```

## File Structure

```
src/
├── components/
│   ├── dashboard/
│   │   └── SchoolAdminDashboard.tsx      (Main dashboard)
│   └── modals/
│       ├── FacilitatorApprovalModal.tsx  (Teacher approval UI)
│       ├── SchoolReportsModal.tsx        (Report generation UI)
│       └── UserManagementModal.tsx       (User management UI)
├── app/
│   └── api/
│       └── school-admin/
│           ├── dashboard/
│           │   └── route.ts              (Metrics endpoint)
│           ├── facilitators/
│           │   ├── pending/
│           │   │   └── route.ts          (Get pending approvals)
│           │   └── [facilitatorId]/
│           │       └── [action]/
│           │           └── route.ts      (Approve/reject)
│           ├── users/
│           │   └── route.ts              (User list + PATCH)
│           └── reports/
│               └── route.ts              (Generate reports)
```

## Next Steps for Enhancement

1. **Email Notifications** - Send notification emails on approval
2. **Bulk Operations** - Approve/reject multiple facilitators at once
3. **Advanced Filters** - Filter by department, tenure, experience level
4. **Dashboard Charts** - Visualize enrollment and completion trends
5. **Activity Audit Trail** - Track all admin actions with timestamps
6. **Custom Reports** - Allow admins to create custom report templates
