# Implementation Patterns Reference - Quick Copy-Paste Guide

Use these patterns when creating the next role (FACILITATOR) or extending existing ones.

## Pattern 1: API Endpoint Authentication & Role Check

```typescript
// Always use this pattern for every API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';  // ✅ CORRECT - NOT @/lib/jwt
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Extract and validate token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    // ✅ CRITICAL: Verify role matches endpoint
    if (!payload || payload.role !== 'ROLE_NAME') {
      return NextResponse.json(
        { error: 'Forbidden: Invalid role' },
        { status: 403 }
      );
    }

    const userId = payload.userId;

    // Now your database queries with user isolation
    const data = await prisma.model.findMany({
      where: { userId },  // User isolation
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Pattern 2: Modal Component with Real Data

```typescript
import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  // ... other fields
}

interface ModalProps {
  isOpen: boolean;
  items: Item[];
  onClose: () => void;
  onAction?: (itemId: string) => Promise<void>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  items,
  onClose,
  onAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter items (keep in sync with API filtering)
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleAction = async (itemId: string) => {
    if (!onAction) return;
    setLoading(true);
    try {
      await onAction(itemId);
      // Refresh data or close modal
      setSelectedItem(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Modal Title</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedItem ? (
            // Detail view
            <div className="space-y-6">
              <button
                onClick={() => setSelectedItem(null)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back
              </button>
              {/* Render detail view */}
            </div>
          ) : (
            // List view
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Items grid/list */}
              <div className="grid grid-cols-1 gap-4">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="border rounded-lg p-4 hover:shadow-lg cursor-pointer"
                  >
                    {/* Item content */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

## Pattern 3: Dashboard Component with Real Data Loading

```typescript
import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import MyModal from '@/components/MyModal';

interface Metrics {
  // Define all metrics
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('token') 
    : null;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Load metrics
      const metricsRes = await fetch('/api/[role]/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!metricsRes.ok) throw new Error('Failed to load metrics');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // Load data
      const dataRes = await fetch('/api/[role]/data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!dataRes.ok) throw new Error('Failed to load data');
      const responseData = await dataRes.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, payload: any) => {
    if (!token) return;

    try {
      const res = await fetch('/api/[role]/action', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...payload }),
      });

      if (!res.ok) throw new Error('Failed to perform action');
      await loadDashboardData();  // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Title</h1>
        <p className="text-gray-600 mb-8">Description</p>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-medium mb-1">Metric Name</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.count}</p>
            </div>
            {/* More KPI cards */}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6"
          >
            {/* Card content */}
          </button>
        </div>

        {/* Data Table/Grid */}
        <div className="bg-white rounded-lg shadow">
          {/* Table or grid content */}
        </div>
      </div>

      {/* Modals */}
      <MyModal
        isOpen={showModal}
        items={data}
        onClose={() => setShowModal(false)}
        onAction={handleAction}
      />
    </div>
  );
}
```

## Pattern 4: Database Query Best Practices

### Get user's data (most common)
```typescript
// Single user query
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// User's related data
const items = await prisma.model.findMany({
  where: { userId },
  include: { relatedModel: true },
  orderBy: { createdAt: 'desc' },
});

// Count for metrics
const count = await prisma.model.count({
  where: { userId },
});
```

### Aggregate data (for dashboards)
```typescript
// Sum/average for metrics
const progress = await prisma.enrollment.aggregate({
  where: { userId },
  _avg: { completionPercentage: true },
  _count: true,
});

// Group by role for analytics
const byRole = await prisma.user.groupBy({
  by: ['role'],
  _count: true,
});

// Get top N items
const topItems = await prisma.model.findMany({
  take: 10,
  orderBy: { metric: 'desc' },
});
```

### Relationship queries
```typescript
// Parent-child relationships
const parents = await prisma.user.findMany({
  where: { childrenIds: { has: childId } },
});

// Many-to-many with pivot data
const memberships = await prisma.userCircle.findMany({
  where: { userId },
  include: { circle: true },
});

// Conditional includes
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    children: user.role === 'PARENT',
    enrollments: user.role === 'STUDENT',
  },
});
```

## Pattern 5: Modal Toggle & State Management

```typescript
// Dashboard state
const [showModal1, setShowModal1] = useState(false);
const [showModal2, setShowModal2] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);

// Handle open with data
const handleOpenModal = async (item: Item) => {
  setSelectedItem(item);
  // Optional: Load additional data
  setShowModal1(true);
};

// Modals in JSX
{/* Multiple modals can coexist */}
<Modal1 
  isOpen={showModal1} 
  item={selectedItem}
  onClose={() => setShowModal1(false)} 
/>

<Modal2 
  isOpen={showModal2}
  onClose={() => setShowModal2(false)} 
/>
```

## Pattern 6: Form Validation in API

```typescript
// Always validate required fields
const { field1, field2 } = await request.json();

if (!field1 || !field2) {
  return NextResponse.json(
    { error: 'field1 and field2 are required' },
    { status: 400 }
  );
}

// Validate data constraints
if (title.length < 5 || title.length > 200) {
  return NextResponse.json(
    { error: 'Title must be between 5 and 200 characters' },
    { status: 400 }
  );
}

// Check authorization (beyond role)
const ownership = await prisma.model.findUnique({
  where: { id: itemId },
});

if (ownership.userId !== userId) {
  return NextResponse.json(
    { error: 'You do not own this resource' },
    { status: 403 }
  );
}

// Verify foreign keys exist
const referenced = await prisma.other.findUnique({
  where: { id: otherId },
});

if (!referenced) {
  return NextResponse.json(
    { error: 'Referenced item not found' },
    { status: 404 }
  );
}
```

## Pattern 7: Error Handling (Consistent Across All Roles)

```typescript
// API errors
try {
  // ... database/business logic
  return NextResponse.json(data);
} catch (error) {
  console.error('Operation error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Component errors
const handleAction = async () => {
  try {
    const res = await fetch(...);
    if (!res.ok) throw new Error('Operation failed');
    await loadData();  // Refresh on success
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};
```

---

## Quick Setup for New Role

1. **Create modal component**: `src/components/[Role]Modal.tsx`
2. **Create dashboard**: `src/components/[Role]Dashboard.tsx`
3. **Create API routes**:
   - `src/app/api/[role]/dashboard/route.ts`
   - `src/app/api/[role]/entity/route.ts`
   - `src/app/api/[role]/action/route.ts`
4. **Test locally**: `npm run build`
5. **Commit**: Document and push to git

---

**Key Principles**:
- ✅ Always verify role = "EXPECTED_ROLE"
- ✅ Always isolate data by userId
- ✅ Always load fresh data after actions
- ✅ Always validate required fields
- ✅ Always import from @/lib/auth (NOT @/lib/jwt)
- ✅ Always handle errors gracefully
- ✅ Always use real Prisma queries
