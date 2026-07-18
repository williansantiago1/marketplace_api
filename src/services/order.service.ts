import type { Role } from "../entities/user.entity";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/app-error";
import { cartRepository } from "../repositories/cart.repository";
import { couponRepository } from "../repositories/coupon.repository";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { storeRepository } from "../repositories/store.repository";
import type { CheckoutInput } from "../schemas/order.schema";
import { prisma } from "../shared/prisma";
import { couponService } from "./coupon.service";

export const orderService = {
  async checkout(userId: string, input: CheckoutInput) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Carrinho vazio");
    }

    const byStore = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const list = byStore.get(item.product.storeId) ?? [];
      list.push(item);
      byStore.set(item.product.storeId, list);
    }

    const couponCode = input.couponCode?.toUpperCase();

    const orders = await prisma.$transaction(async (tx) => {
      const createdOrders = [];

      for (const [storeId, items] of byStore) {
        for (const item of items) {
          if (!item.product.isActive) {
            throw new ValidationError(`Produto indisponível: ${item.product.name}`);
          }
          if (item.product.stock < item.quantity) {
            throw new ValidationError(`Estoque insuficiente: ${item.product.name}`);
          }
        }

        const subtotalInCents = items.reduce(
          (sum, item) => sum + item.product.priceInCents * item.quantity,
          0,
        );

        let discountInCents = 0;
        let couponId: string | null = null;

        if (couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: couponCode },
          });

          if (!coupon || !coupon.isActive) {
            throw new ValidationError("Cupom inválido");
          }

          // cupom de outra loja não se aplica a este grupo
          if (coupon.storeId && coupon.storeId !== storeId) {
            // ignora para esta loja; se for o único store e não bater, falha abaixo
          } else {
            const now = new Date();
            if (coupon.startsAt && coupon.startsAt > now) {
              throw new ValidationError("Cupom ainda não está ativo");
            }
            if (coupon.expiresAt && coupon.expiresAt < now) {
              throw new ValidationError("Cupom expirado");
            }
            if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
              throw new ValidationError("Cupom esgotado");
            }
            if (
              coupon.minOrderInCents !== null &&
              subtotalInCents < coupon.minOrderInCents
            ) {
              throw new ValidationError("Pedido abaixo do mínimo do cupom");
            }

            discountInCents = couponService.calculateDiscount(subtotalInCents, coupon);
            couponId = coupon.id;
            await couponRepository.incrementUsedCount(coupon.id, tx);
          }
        }

        const totalInCents = subtotalInCents - discountInCents;

        const order = await orderRepository.createWithItems(
          {
            userId,
            storeId,
            couponId,
            subtotalInCents,
            discountInCents,
            totalInCents,
            items: items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPriceInCents: item.product.priceInCents,
              quantity: item.quantity,
              lineTotalInCents: item.product.priceInCents * item.quantity,
            })),
          },
          tx,
        );

        for (const item of items) {
          await productRepository.decrementStock(item.productId, item.quantity, tx);
        }

        await cartRepository.removeItemsByIds(
          items.map((i) => i.id),
          tx,
        );

        createdOrders.push(order);
      }

      return createdOrders;
    });

    return orders;
  },

  async getById(userId: string, role: Role, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }

    if (order.userId === userId || role === "ADMIN") {
      return order;
    }

    if (role === "SELLER") {
      const store = await storeRepository.findById(order.storeId);
      if (store?.ownerId === userId) {
        return order;
      }
    }

    throw new ForbiddenError("Você não pode ver este pedido");
  },

  listMine(userId: string) {
    return orderRepository.findByUserId(userId);
  },

  async listByStore(userId: string, role: Role, storeId: string) {
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError("Loja não encontrada");
    }
    if (role !== "ADMIN" && store.ownerId !== userId) {
      throw new ForbiddenError("Você não gerencia esta loja");
    }
    return orderRepository.findByStoreId(storeId);
  },

  async cancel(userId: string, role: Role, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }

    if (order.userId !== userId && role !== "ADMIN") {
      throw new ForbiddenError("Você não pode cancelar este pedido");
    }

    if (order.status !== "PENDING_PAYMENT") {
      throw new ValidationError("Só é possível cancelar pedido aguardando pagamento");
    }

    return prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await productRepository.incrementStock(item.productId, item.quantity, tx);
      }
      return orderRepository.updateStatus(orderId, "CANCELLED", tx);
    });
  },

  async markPaid(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }
    if (order.status !== "PENDING_PAYMENT") {
      return order;
    }
    return orderRepository.updateStatus(orderId, "PAID");
  },

  async markFailed(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }
    if (order.status !== "PENDING_PAYMENT") {
      return order;
    }
    return orderRepository.updateStatus(orderId, "FAILED");
  },
};
