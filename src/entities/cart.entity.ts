import type { Product } from "./product.entity";

export interface Cart {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}
