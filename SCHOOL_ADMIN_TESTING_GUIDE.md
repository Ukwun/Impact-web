# SCHOOL_ADMIN Dashboard Testing Guide

## Overview

This guide provides comprehensive testing procedures for the SCHOOL_ADMIN role functionality, covering all endpoints, UI interactions, and edge cases.

## Test Environment Setup

### Required Test Accounts

Create test accounts with these credentials in `prisma/seed.ts`:

```typescript
// 1. SCHOOL_ADMIN User
const schoolAdmin = await prisma.user.create({
  data: {
    id: "admin_test_001",
    email: "admin@testschool.edu",
    name: "Admin Test",
    role: "SCHOOL_ADMIN",
    status: "ACTIVE",
    schoolId: "school_test_001",
    // ... other fields
  }
});

// 2. FACILITATOR_PENDING User (for approval testing)
const pendingFacilitator = await prisma.user.create({
  data: {
    id: "pending_facilitator_001",
    email: "pending@testschool.edu",
    name: "Pending Facilitator",
    role: "FACILITATOR_PENDING",
    status: "PENDING",
    schoolId: "school_test_001"
  }
});

// 3. STUDENT Users (for user management testing)
const testStudents = Array.from({ length: 5 }).map((_, i) =>
  prisma.user.create({
    data: {
      id: `student_test_${i}`,
      email: `student${i}@testschool.edu`,
      name: `Student Test ${i}`,
      role: "STUDENT",
      status: "ACTIVE",
      schoolId: "school_test_001"
    }
  })
);
```

### Authentication Setup

```bash
# 1. Get JWT token for SCHOOL_ADMIN
POST /api/auth/login
{
  "email": "admin@testschool.edu",
  "password": "Test@1234"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "admin_test_001", "role": "SCHOOL_ADMIN" }
}

# 2. Store token for use in subsequent requests
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

## Unit Tests

### API Endpoint Tests

#### Test 1: Dashboard Metrics Endpoint

**File:** `src/__tests__/api/school-admin-dashboard.test.ts`

```typescript
describe("GET /api/school-admin/dashboard", () => {
  it("should return dashboard metrics for authenticated admin", async () => {
    const res = await fetch("http://localhost:3000/api/school-admin/dashboard", {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      totalUsers: expect.any(Number),
      totalCourses: expect.any(Number),
      totalEnrollments: expect.any(Number),
      pendingApprovals: expect.any(Number),
      activeFacilitators: expect.any(Number)
    });
  });

  it("should return 401 if token is missing", async () => {
    const res = await fetch("http://localhost:3000/api/school-admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("should return 403 if user is not SCHOOL_ADMIN", async () => {
    // Use STUDENT token
    const res = await fetch("http://localhost:3000/api/school-admin/dashboard", {
      headers: { Authorization: `Bearer ${STUDENT_TOKEN}` }
    });
    expect(res.status).toBe(403);
  });

  it("should only return data for admin's school", async () => {
    // Create users in different schools
    const res = await fetch("http://localhost:3000/api/school-admin/dashboard", {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    
    const data = await res.json();
    // Verify numbers match only school_test_001
    expect(data.data.totalUsers).toBe(7); // 1 admin + 1 pending + 5 students
  });
});
```

#### Test 2: Pending Facilitators Endpoint

**File:** `src/__tests__/api/school-admin-facilitators.test.ts`

```typescript
describe("GET /api/school-admin/facilitators/pending", () => {
  it("should return list of pending facilitators", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/facilitators/pending",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0]).toHaveProperty("id");
    expect(data.data[0]).toHaveProperty("name");
    expect(data.data[0]).toHaveProperty("email");
    expect(data.data[0]).toHaveProperty("status", "PENDING");
  });

  it("should filter by school ID", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/facilitators/pending",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    const data = await res.json();
    // Verify no facilitators from other schools appear
    expect(data.data.length).toBeLessThanOrEqual(1);
  });
});
```

#### Test 3: Facilitator Approval Endpoint

**File:** `src/__tests__/api/school-admin-approve.test.ts`

```typescript
describe("POST /api/school-admin/facilitators/[id]/approve", () => {
  it("should approve pending facilitator", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/facilitators/pending_facilitator_001/approve",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      }
    );
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    
    // Verify user role changed
    const facilitator = await prisma.user.findUnique({
      where: { id: "pending_facilitator_001" }
    });
    expect(facilitator.role).toBe("FACILITATOR");
    expect(facilitator.status).toBe("ACTIVE");
  });

  it("should create audit log entry", async () => {
    await fetch(
      "http://localhost:3000/api/school-admin/facilitators/pending_facilitator_001/approve",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      }
    );
    
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action: "FACILITATOR_APPROVED",
        userId: "pending_facilitator_001"
      }
    });
    expect(auditLog).toBeDefined();
  });

  it("should send approval email", async () => {
    // Mock email service
    const emailSpy = jest.spyOn(emailService, "send");
    
    await fetch(
      "http://localhost:3000/api/school-admin/facilitators/pending_facilitator_001/approve",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      }
    );
    
    expect(emailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "pending@testschool.edu",
        subject: expect.stringContaining("Approved")
      })
    );
  });

  it("should return 404 for non-existent facilitator", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/facilitators/non_existent/approve",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      }
    );
    expect(res.status).toBe(404);
  });

  it("should return 403 if facilitator is from different school", async () => {
    // Create pending facilitator in different school
    const otherSchoolFacilitator = await prisma.user.create({
      data: {
        id: "pending_other_school",
        email: "pending@otherschool.edu",
        name: "Other School Pending",
        role: "FACILITATOR_PENDING",
        schoolId: "school_other_001"
      }
    });
    
    const res = await fetch(
      "http://localhost:3000/api/school-admin/facilitators/pending_other_school/approve",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      }
    );
    expect(res.status).toBe(403);
  });
});
```

#### Test 4: User Management Endpoint

**File:** `src/__tests__/api/school-admin-users.test.ts`

```typescript
describe("GET /api/school-admin/users", () => {
  it("should return all school users with pagination", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/users?page=1",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toBeInstanceOf(Array);
    expect(data.pagination).toHaveProperty("page", 1);
    expect(data.pagination).toHaveProperty("pageSize", 20);
    expect(data.pagination).toHaveProperty("total");
  });

  it("should support role filtering", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/users?role=STUDENT",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    const data = await res.json();
    data.data.forEach(user => {
      expect(user.role).toBe("STUDENT");
    });
  });

  it("should support status filtering", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/users?status=ACTIVE",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    const data = await res.json();
    data.data.forEach(user => {
      expect(user.status).toBe("ACTIVE");
    });
  });
});

describe("PATCH /api/school-admin/users", () => {
  it("should update user status to INACTIVE", async () => {
    const res = await fetch("http://localhost:3000/api/school-admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        userId: "student_test_0",
        status: "INACTIVE"
      })
    });
    
    expect(res.status).toBe(200);
    
    // Verify database change
    const user = await prisma.user.findUnique({
      where: { id: "student_test_0" }
    });
    expect(user.status).toBe("INACTIVE");
  });

  it("should return 403 for different school user", async () => {
    const otherSchoolUser = await prisma.user.create({
      data: {
        id: "student_other_school",
        email: "other@otherschool.edu",
        name: "Other School Student",
        role: "STUDENT",
        schoolId: "school_other_001"
      }
    });
    
    const res = await fetch("http://localhost:3000/api/school-admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        userId: "student_other_school",
        status: "INACTIVE"
      })
    });
    
    expect(res.status).toBe(403);
  });
});
```

#### Test 5: Report Generation Endpoint

**File:** `src/__tests__/api/school-admin-reports.test.ts`

```typescript
describe("GET /api/school-admin/reports", () => {
  it("should generate enrollment report as CSV", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/reports?type=enrollment&format=csv",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    
    const csv = await res.text();
    expect(csv).toContain("Course Name");
    expect(csv).toContain("Total Enrolled");
    expect(csv).toContain("Percent Complete");
  });

  it("should generate progress report", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/reports?type=progress&format=csv",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    expect(res.status).toBe(200);
    const csv = await res.text();
    expect(csv).toContain("Student Name");
    expect(csv).toContain("Course Progress");
  });

  it("should generate grades report", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/reports?type=grades&format=csv",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    expect(res.status).toBe(200);
    const csv = await res.text();
    expect(csv).toContain("Student Name");
    expect(csv).toContain("Average Grade");
  });

  it("should return JSON if format=json", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/reports?type=enrollment&format=json",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should return 400 for invalid report type", async () => {
    const res = await fetch(
      "http://localhost:3000/api/school-admin/reports?type=invalid",
      { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
    );
    
    expect(res.status).toBe(400);
  });
});
```

## Integration Tests

### UI Interaction Tests

#### Test: Facilitator Approval Workflow

**File:** `src/__tests__/integration/facilitator-approval.test.ts`

```typescript
describe("Facilitator Approval Workflow", () => {
  beforeEach(async () => {
    // Reset database
    await resetTestDatabase();
    // Render dashboard
    render(<SchoolAdminDashboard />);
  });

  it("should show pending approvals count on dashboard", async () => {
    await waitFor(() => {
      expect(screen.getByText("Pending Approvals")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("should open modal when clicking 'Review Requests'", async () => {
    const button = screen.getByRole("button", { name: /Review Requests/i });
    await userEvent.click(button);
    
    expect(screen.getByText("Pending Facilitator Approvals")).toBeInTheDocument();
  });

  it("should display facilitator details when selected", async () => {
    const button = screen.getByRole("button", { name: /Review Requests/i });
    await userEvent.click(button);
    
    const facilitatorButton = screen.getByRole("button", {
      name: /Pending Facilitator/i
    });
    await userEvent.click(facilitatorButton);
    
    expect(screen.getByText("pending@testschool.edu")).toBeInTheDocument();
    expect(screen.getByText(/Bachelor of Science/i)).toBeInTheDocument();
  });

  it("should approve facilitator and refresh dashboard", async () => {
    const button = screen.getByRole("button", { name: /Review Requests/i });
    await userEvent.click(button);
    
    const facilitatorButton = screen.getByRole("button", {
      name: /Pending Facilitator/i
    });
    await userEvent.click(facilitatorButton);
    
    const approveButton = screen.getByRole("button", { name: /Approve/i });
    await userEvent.click(approveButton);
    
    await waitFor(() => {
      expect(screen.queryByText("Pending Facilitator Approvals")).not.toBeInTheDocument();
    });
    
    // Verify metrics updated
    expect(screen.getByText("Pending Approvals")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
```

#### Test: Report Generation Workflow

**File:** `src/__tests__/integration/report-generation.test.ts`

```typescript
describe("Report Generation Workflow", () => {
  it("should generate and download enrollment report", async () => {
    render(<SchoolAdminDashboard />);
    
    const reportsButton = screen.getByRole("button", {
      name: /Create Report/i
    });
    await userEvent.click(reportsButton);
    
    const typeSelect = screen.getByRole("combobox", { name: /Report Type/i });
    await userEvent.selectOptions(typeSelect, "enrollment");
    
    const downloadButton = screen.getByRole("button", {
      name: /Download/i
    });
    
    const downloadSpy = jest.spyOn(window, "URL");
    await userEvent.click(downloadButton);
    
    expect(downloadSpy).toHaveBeenCalledWith.createObjectURL(
      expect.any(Blob)
    );
  });
});
```

## Edge Cases

### Test Cases for Boundary Conditions

#### Test: Empty Data Sets

```typescript
it("should handle zero pending facilitators", async () => {
  // Delete all pending facilitators
  await prisma.user.deleteMany({
    where: { role: "FACILITATOR_PENDING" }
  });
  
  render(<SchoolAdminDashboard />);
  
  const approvalCard = screen.getByText("Facilitator Approvals");
  expect(approvalCard).toBeInTheDocument();
  expect(screen.getByText("No Pending Requests")).toBeInTheDocument();
});
```

#### Test: Large Data Sets

```typescript
it("should paginate users correctly with 100+ records", async () => {
  // Create 50 test users
  for (let i = 0; i < 50; i++) {
    await prisma.user.create({
      data: {
        id: `bulk_user_${i}`,
        email: `bulk${i}@testschool.edu`,
        name: `Bulk User ${i}`,
        role: "STUDENT",
        schoolId: "school_test_001"
      }
    });
  }
  
  render(<SchoolAdminDashboard />);
  
  // Open user management modal
  const managementButton = screen.getByRole("button", {
    name: /Manage Users/i
  });
  await userEvent.click(managementButton);
  
  // Should show page 1 of paginated results
  const users = screen.getAllByRole("row");
  expect(users.length).toBeLessThanOrEqual(21); // 20 + header
  
  // Should have pagination controls
  expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
});
```

## Performance Tests

### Test: Response Time

```typescript
it("dashboard endpoint should respond in < 500ms", async () => {
  const start = performance.now();
  
  await fetch("http://localhost:3000/api/school-admin/dashboard", {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
  });
  
  const end = performance.now();
  expect(end - start).toBeLessThan(500);
});
```

## Security Tests

### Test: Authorization

```typescript
it("should reject requests without token", async () => {
  const res = await fetch("http://localhost:3000/api/school-admin/dashboard");
  expect(res.status).toBe(401);
});

it("should reject STUDENT requests", async () => {
  const res = await fetch("http://localhost:3000/api/school-admin/dashboard", {
    headers: { Authorization: `Bearer ${STUDENT_TOKEN}` }
  });
  expect(res.status).toBe(403);
});

it("should prevent cross-school access", async () => {
  // Verify admin cannot see other school's users
  const res = await fetch("http://localhost:3000/api/school-admin/users", {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
  });
  
  const data = await res.json();
  data.data.forEach(user => {
    expect(user.schoolId).toBe("school_test_001");
  });
});
```

## Manual Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Metrics display correctly (5 KPI cards)
- [ ] Pending approvals count updates in real-time
- [ ] Facilitator approval modal opens/closes
- [ ] Can select pending facilitator and view details
- [ ] Can approve facilitator with success notification
- [ ] Can reject facilitator with feedback
- [ ] User management modal displays all school users
- [ ] Can filter users by role (PARENT, STUDENT, FACILITATOR)
- [ ] Can activate/deactivate users
- [ ] Report modal opens with report type selection
- [ ] Can generate and download CSV reports
- [ ] Dashboard metrics update after approvals
- [ ] Error messages display on API failures
- [ ] Session timeout redirects to login
- [ ] Works on mobile (responsive design)

## Run All Tests

```bash
# Run unit tests
npm test -- src/__tests__/api/school-admin-*.test.ts

# Run integration tests
npm test -- src/__tests__/integration/*.test.ts

# Run all with coverage
npm test -- --coverage --testPathPattern=school-admin
```
