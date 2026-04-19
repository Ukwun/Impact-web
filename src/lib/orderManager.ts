/**
 * Order Manager
 * Server-side functions for managing orders and payments
 */

import { Order, Payment, OrderStatus, PaymentMethod, createOrder, OrderItem } from '@/types/orders';

// Mock Orders Data
const mockOrders: Order[] = [
  {
    id: 'order-001',
    userId: 'user-1',
    items: [
      {
        id: 'item-1',
        type: 'course',
        itemId: 'course-1',
        itemName: 'Personal Finance Fundamentals',
        quantity: 1,
        unitPrice: 99.99,
        totalPrice: 99.99,
      },
    ],
    subtotal: 99.99,
    tax: 9.99,
    total: 109.98,
    status: 'completed',
    paymentMethod: 'flutterwave',
    transactionId: 'TXN-FLW-2026-001',
    orderedAt: new Date('2026-03-15'),
    completedAt: new Date('2026-03-15'),
  },
  {
    id: 'order-002',
    userId: 'user-1',
    items: [
      {
        id: 'item-2',
        type: 'membership',
        itemId: 'tier-premium',
        itemName: 'Premium Membership (1 year)',
        quantity: 1,
        unitPrice: 499.99,
        totalPrice: 499.99,
      },
    ],
    subtotal: 499.99,
    tax: 49.99,
    total: 549.98,
    status: 'completed',
    paymentMethod: 'flutterwave',
    transactionId: 'TXN-FLW-2026-002',
    orderedAt: new Date('2026-02-01'),
    completedAt: new Date('2026-02-01'),
  },
  {
    id: 'order-003',
    userId: 'user-1',
    items: [
      {
        id: 'item-3',
        type: 'course',
        itemId: 'course-2',
        itemName: 'Investment Strategies 101',
        quantity: 1,
        unitPrice: 149.99,
        totalPrice: 149.99,
      },
    ],
    subtotal: 149.99,
    tax: 15.00,
    total: 164.99,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN-BANK-2026-003',
    orderedAt: new Date('2026-03-20'),
    completedAt: new Date('2026-03-20'),
  },
];

const mockPayments: Payment[] = [
  {
    id: 'payment-001',
    orderId: 'order-001',
    userId: 'user-1',
    amount: 109.98,
    currency: 'NGN',
    method: 'flutterwave',
    status: 'completed',
    transactionId: 'TXN-FLW-2026-001',
    refunded: false,
    refundAmount: 0,
    createdAt: new Date('2026-03-15'),
    completedAt: new Date('2026-03-15'),
  },
  {
    id: 'payment-002',
    orderId: 'order-002',
    userId: 'user-1',
    amount: 549.98,
    currency: 'NGN',
    method: 'flutterwave',
    status: 'completed',
    transactionId: 'TXN-FLW-2026-002',
    refunded: false,
    refundAmount: 0,
    createdAt: new Date('2026-02-01'),
    completedAt: new Date('2026-02-01'),
  },
];

/**
 * Get orders for a user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockOrders.filter((o) => o.userId === userId).sort((a, b) => 
    new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
  );
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockOrders.find((o) => o.id === orderId) || null;
}

/**
 * Get payment by order ID
 */
export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockPayments.find((p) => p.orderId === orderId) || null;
}

/**
 * Create order
 */
export async function createUserOrder(
  userId: string,
  items: OrderItem[]
): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const order = createOrder(userId, items);
  mockOrders.push(order);
  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const order = mockOrders.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = status;
  if (status === 'completed') {
    order.completedAt = new Date();
  }

  return order;
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(
  status?: OrderStatus,
  limit = 50,
  offset = 0
): Promise<{ orders: Order[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  let filtered = [...mockOrders];
  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  filtered.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());

  return {
    orders: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

/**
 * Get order statistics
 */
export async function getOrderStatistics() {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const completed = mockOrders.filter((o) => o.status === 'completed');
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = completed.length > 0 ? totalRevenue / completed.length : 0;

  return {
    totalOrders: mockOrders.length,
    completedOrders: completed.length,
    pendingOrders: mockOrders.filter((o) => o.status === 'pending').length,
    failedOrders: mockOrders.filter((o) => o.status === 'failed').length,
    totalRevenue,
    averageOrderValue: Math.round(avgOrderValue * 100) / 100,
    totalCustomers: new Set(mockOrders.map((o) => o.userId)).size,
  };
}

/**
 * Get refundable orders (not already refunded)
 */
export async function getRefundableOrders(userId: string): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  return mockOrders.filter(
    (o) =>
      o.userId === userId &&
      o.status === 'completed' &&
      // Only refundable within 30 days
      new Date().getTime() - new Date(o.completedAt || 0).getTime() < 30 * 24 * 60 * 60 * 1000
  );
}
