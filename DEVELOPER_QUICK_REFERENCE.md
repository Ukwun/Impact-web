# Developer Quick Reference Guide

## Rapid Lookup for Common Development Tasks

---

## 1. Authentication

### Check if User is Authenticated

```typescript
// In API route
import { authMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Returns 401 Unauthorized
  }
  
  // User is authenticated
  const userId = authResult.user.id;
  const userRole = authResult.user.role;
}
```

### Check User Role

```typescript
import { roleMiddleware } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse) return authResult;
  
  // Only allow FACILITATOR and ADMIN
  const roleCheck = await roleMiddleware(request, ["FACILITATOR", "ADMIN"]);
  if (roleCheck instanceof NextResponse) {
    return roleCheck; // Returns 403 Forbidden
  }
  
  // User has required role
}
```

### Create JWT Token

```typescript
import { createToken } from "@/lib/auth-service";

const user = {
  id: "user-123",
  email: "user@example.com",
  name: "John Doe",
  role: "STUDENT"
};

const token = createToken(user);
// Returns: "eyJhbGci..." (expires in 24 hours)
```

### Verify JWT Token

```typescript
import { verifyToken } from "@/lib/auth-service";

const token = "eyJhbGci...";
const payload = verifyToken(token);

if (payload) {
  console.log("Token valid, user ID:", payload.id);
} else {
  console.log("Token invalid or expired");
}
```

---

## 2. API Response Patterns

### Success Response

```typescript
return NextResponse.json({
  success: true,
  data: {
    // Your data here
  }
});
```

### Error Response

```typescript
return NextResponse.json(
  { 
    success: false, 
    error: "Description of error",
    code: "ERROR_CODE"
  },
  { status: 400 } // or 401, 403, 500, etc.
);
```

### Paginated Response

```typescript
return NextResponse.json({
  success: true,
  data: {
    items: [...],
    pagination: {
      total: 142,
      page: 1,
      perPage: 10,
      totalPages: 15
    }
  }
});
```

---

## 3. Database Queries (Prisma)

### Import Prisma Client

```typescript
import { prisma } from "@/lib/prisma";

// Single instance used throughout app
// Automatically handles connection pooling
```

### Find Single Record

```typescript
// By ID
const user = await prisma.user.findUnique({
  where: { id: "user-123" }
});

// By email
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});

// With relations
const user = await prisma.user.findUnique({
  where: { id: "user-123" },
  include: {
    enrollments: true,
    achievements: true,
    studentProfile: true
  }
});
```

### Find Multiple Records

```typescript
const students = await prisma.user.findMany({
  where: { role: "STUDENT" },
  include: { studentProfile: true },
  take: 10, // Limit
  skip: 0,  // Offset
  orderBy: { name: "asc" } // Sort
});
```

### Create Record

```typescript
const newUser = await prisma.user.create({
  data: {
    email: "student@school.edu",
    name: "Alex Johnson",
    role: "STUDENT",
    schoolId: "school-1",
    studentProfile: {
      create: {
        grade: "Grade 10",
        enrollmentDate: new Date(),
        status: "ACTIVE"
      }
    }
  }
});
```

### Update Record

```typescript
const updated = await prisma.user.update({
  where: { id: "user-123" },
  data: {
    name: "New Name",
    studentProfile: {
      update: { grade: "Grade 11" }
    }
  }
});
```

### Delete Record

```typescript
const deleted = await prisma.user.delete({
  where: { id: "user-123" }
  // Related records cascade delete based on schema
});
```

### Count Records

```typescript
const count = await prisma.user.count({
  where: { role: "STUDENT" }
});
```

---

## 4. Common Queries

### Get Student Dashboard Data

```typescript
const studentData = await prisma.user.findUnique({
  where: { id: studentId },
  include: {
    studentProfile: true,
    enrollments: {
      include: {
        course: { include: { facilitator: true } },
        progress: true
      },
      take: 6
    },
    submissions: {
      include: { assignment: { include: { course: true } } },
      take: 5,
      orderBy: { submittedDate: "desc" }
    },
    achievements: true,
    leaderboardEntries: { take: 10 }
  }
});
```

### Get Facilitator's Courses

```typescript
const courses = await prisma.course.findMany({
  where: { facilitatorId: facilitatorId },
  include: {
    modules: { include: { lessons: true } },
    assignments: true,
    enrollments: { include: { student: true } }
  }
});
```

### Get At-Risk Students (Admin)

```typescript
const atRiskStudents = await prisma.alertNotification.findMany({
  where: {
    type: "STUDENT_AT_RISK",
    schoolId: schoolId
  },
  include: { student: true },
  orderBy: { severity: "desc" }
});
```

### Get Active Projects

```typescript
const projects = await prisma.studentProject.findMany({
  where: { 
    visibility: { in: ["PUBLIC", "COURSE_ONLY"] },
    status: { in: ["IN_DEVELOPMENT", "REVIEW", "SHOWCASED"] }
  },
  include: {
    student: true,
    collaborators: true,
    peerReviews: { include: { reviewer: true } }
  },
  orderBy: { createdAt: "desc" },
  take: 20
});
```

---

## 5. Frontend Integration

### Setup API Client

```typescript
// src/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Create Service

```typescript
// src/lib/services/dashboard-service.ts
import apiClient from '@/lib/api-client';

export const dashboardService = {
  async getStudentDashboard(studentId: string) {
    const { data } = await apiClient.get('/api/dashboard/student', {
      params: { studentId }
    });
    return data.data;
  }
};
```

### Use in Component (React Hook)

```typescript
// src/components/dashboards/StudentDashboard.tsx
import { useEffect, useState } from 'react';
import { dashboardService } from '@/lib/services/dashboard-service';

export default function StudentDashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboard = await dashboardService.getStudentDashboard(studentId);
        setData(dashboard);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>{data.student.name}</h1>
      {/* Display data here */}
    </div>
  );
}
```

### Zustand State Management

```typescript
// src/store/auth-store.ts
import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('authToken'),
  user: null,
  isAuthenticated: !!localStorage.getItem('authToken'),

  login: async (email, password) => {
    const { data } = await apiClient.post('/api/auth/login', { email, password });
    localStorage.setItem('authToken', data.data.token);
    set({ token: data.data.token, user: data.data.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
```

---

## 6. Form Handling

### Basic Form Submission

```typescript
'use client';

import { FormEvent } from 'react';
import apiClient from '@/lib/api-client';

export default function CreateProjectForm() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await apiClient.post('/api/projects', {
        title: formData.get('title'),
        description: formData.get('description'),
        courseId: formData.get('courseId'),
        visibility: 'PUBLIC'
      });

      console.log('Project created:', response.data.data);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Project Title" required />
      <textarea name="description" placeholder="Description" required />
      <select name="courseId" required>
        <option value="">Select Course</option>
        <option value="course-1">Mathematics 101</option>
      </select>
      <button type="submit">Create Project</button>
    </form>
  );
}
```

---

## 7. Error Handling

### Try-Catch Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) return authResult;

    const data = await prisma.user.findUnique({
      where: { id: authResult.user.id }
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Custom Error Classes

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// Usage
try {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');
} catch (error) {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
```

---

## 8. Validation Patterns

### Input Validation with Zod

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short')
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  try {
    const validated = loginSchema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 }
    );
  }
}
```

---

## 9. Debugging

### Enable Prisma Query Logging

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

// Shows all SQL queries in console during development
```

### Use Prisma Studio

```bash
npx prisma studio

# Opens http://localhost:5555
# Visual database browser and editor
```

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@school.edu","password":"password"}'

# Get data with token
curl -X GET http://localhost:3000/api/dashboard/student \
  -H "Authorization: Bearer your_token_here"
```

---

## 10. Performance Tips

### Database Query Optimization

```typescript
// ❌ Bad - N+1 query problem
const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
for (const student of students) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id }
  });
  // Runs query for each student!
}

// ✅ Good - Use include
const students = await prisma.user.findMany({
  where: { role: "STUDENT" },
  include: { enrollments: true }
  // Single query with all data
});
```

### Cache API Responses

```typescript
// src/lib/cache.ts
const cache = new Map<string, any>();

export function getCached(key: string) {
  return cache.get(key);
}

export function setCached(key: string, value: any, ttlMs = 5 * 60 * 1000) {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), ttlMs);
}

// Usage
const dashboardKey = `dashboard-${studentId}`;
const cached = getCached(dashboardKey);
if (cached) return NextResponse.json(cached);

const fresh = await fetchDashboard(studentId);
setCached(dashboardKey, fresh);
return NextResponse.json(fresh);
```

### Pagination Pattern

```typescript
// Client request
const page = parseInt(searchParams.get('page') || '1');
const perPage = 10;
const skip = (page - 1) * perPage;

// Server query
const [items, total] = await Promise.all([
  prisma.course.findMany({ skip, take: perPage }),
  prisma.course.count()
]);

// Response
return NextResponse.json({
  data: items,
  pagination: {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  }
});
```

---

## 11. Common Status Codes

| Code | Meaning | When To Use |
|------|---------|------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 500 | Server Error | Unhandled exception |
| 503 | Service Unavailable | Database down, external service error |

---

## 12. Environment Variables

### Development (.env.local)

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/impactapp_dev"
NEXT_PUBLIC_API_URL="http://localhost:3000"
JWT_SECRET="dev-secret-key-change-in-production"
NODE_ENV="development"
```

### Production (.env.production)

```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/impactapp_prod"
NEXT_PUBLIC_API_URL="https://app.impactdu.com"
JWT_SECRET="production-super-secret-key"
NODE_ENV="production"
SENTRY_DSN="https://your-key@sentry.io/..."
```

---

## 13. Migration Commands

```bash
# Create new migration after schema change
npx prisma migrate dev --name add_new_feature

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Check for issues
npx prisma validate
```

---

## Quick Command Cheat Sheet

```bash
# Build
npm run build

# Development
npm run dev

# Test
npm test

# Database
npx prisma studio          # Open database UI
npx prisma db seed         # Populate test data
npx prisma migrate dev     # Create migration

# Generate types
npx prisma generate

# Check for errors
npx prisma validate
```

---

## File Structure Quick Map

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── dashboard/          # Dashboard endpoints
│   │   ├── projects/           # Project endpoints
│   │   └── ...
│   ├── dashboard/              # Dashboard pages
│   │   ├── student/
│   │   ├── parent/
│   │   ├── facilitator/
│   │   └── admin/
│   ├── learning/               # Learning pages
│   │   └── rhythm/
│   └── layout.tsx              # Root layout
├── lib/
│   ├── auth-service.ts         # Auth logic
│   ├── export-reporting-service.ts
│   ├── prisma.ts               # Database client
│   ├── api-client.ts           # Axios setup
│   ├── cache.ts                # Caching utilities
│   └── services/               # Service layer
├── store/                      # Zustand stores
├── components/
│   ├── dashboards/             # Dashboard components
│   ├── systems/                # System components
│   └── ...
└── types/                      # TypeScript types
```

---

## One-Liners

```bash
# Quick restart
npm run dev

# Full reset and restart
npx prisma migrate reset && npm run dev

# Test API
curl -X GET http://localhost:3000/api/dashboard/student -H "Authorization: Bearer TOKEN"

# Build check
npm run build
```

This reference covers 90% of typical development tasks. Bookmark this page! 🚀
