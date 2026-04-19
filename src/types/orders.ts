/**
 * Order & Payment Types
 * Core types for purchases, orders, and payment tracking
 */

export type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'flutterwave' | 'bank_transfer' | 'wallet';

export interface OrderItem {
  id: string;
  type: 'course' | 'membership' | 'material';
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  orderedAt: Date;
  completedAt?: Date;
  shippingAddress?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  refunded: boolean;
  refundAmount: number;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface OrderHistory {
  total: number;
  completed: number;
  pending: number;
  totalSpent: number;
  averageOrderValue: number;
}

/**
 * Helper functions
 */

export function createOrder(userId: string, items: OrderItem[]): Order {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    items,
    subtotal,
    tax,
    total,
    status: 'pending',
    paymentMethod: 'flutterwave',
    orderedAt: new Date(),
  };
}

export function calculateOrderStats(orders: Order[]): OrderHistory {
  const completedOrders = orders.filter((o) => o.status === 'completed');
  return {
    total: orders.length,
    completed: completedOrders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    totalSpent: completedOrders.reduce((sum, o) => sum + o.total, 0),
    averageOrderValue: completedOrders.length > 0 
      ? completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length 
      : 0,
  };
}

export function getOrderDisplayStatus(status: OrderStatus): { label: string; color: string } {
  const statusMap = {
    pending: { label: 'Pending Payment', color: 'yellow' },
    completed: { label: 'Completed', color: 'green' },
    failed: { label: 'Failed', color: 'red' },
    cancelled: { label: 'Cancelled', color: 'gray' },
  };
  return statusMap[status];
}
