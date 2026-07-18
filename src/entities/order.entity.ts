export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  couponId: string | null;
  status: OrderStatus;
  subtotalInCents: number;
  discountInCents: number;
  totalInCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
  lineTotalInCents: number;
}
