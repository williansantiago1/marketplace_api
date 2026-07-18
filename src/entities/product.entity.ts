export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string | null;
  priceInCents: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
