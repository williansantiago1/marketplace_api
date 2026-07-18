import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/app-error";
import { cartRepository } from "../repositories/cart.repository";
import { productRepository } from "../repositories/product.repository";
import type { AddCartItemInput, UpdateCartItemInput } from "../schemas/cart.schema";

async function getOrCreateCart(userId: string) {
  const existing = await cartRepository.findByUserId(userId);
  if (existing) return existing;
  return cartRepository.createForUser(userId);
}

export const cartService = {
  async getCart(userId: string) {
    return getOrCreateCart(userId);
  },

  async addItem(userId: string, input: AddCartItemInput) {
    const cart = await getOrCreateCart(userId);
    const product = await productRepository.findById(input.productId);

    if (!product || !product.isActive) {
      throw new NotFoundError("Produto não encontrado");
    }

    const current = cart.items.find((i: any) => i.productId === input.productId);
    const nextQty = (current?.quantity ?? 0) + input.quantity;

    if (product.stock < nextQty) {
      throw new ValidationError("Estoque insuficiente");
    }

    await cartRepository.addItem({
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
    });

    return getOrCreateCart(userId);
  },

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    const item = await cartRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundError("Item não encontrado");
    }
    if (item.cart.userId !== userId) {
      throw new ForbiddenError("Item não pertence ao seu carrinho");
    }
    if (item.product.stock < input.quantity) {
      throw new ValidationError("Estoque insuficiente");
    }

    await cartRepository.updateItemQuantity(itemId, input.quantity);
    return getOrCreateCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const item = await cartRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundError("Item não encontrado");
    }
    if (item.cart.userId !== userId) {
      throw new ForbiddenError("Item não pertence ao seu carrinho");
    }

    await cartRepository.removeItem(itemId);
    return getOrCreateCart(userId);
  },
};
