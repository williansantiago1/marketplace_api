export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}
