import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/app-error";
import { orderRepository } from "../repositories/order.repository";
import { reviewRepository } from "../repositories/review.repository";
import type { CreateReviewInput } from "../schemas/review.schema";

export const reviewService = {
  async create(userId: string, input: CreateReviewInput) {
    const order = await orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }
    if (order.userId !== userId) {
      throw new ForbiddenError("Pedido de outro usuário");
    }
    if (order.status !== "DELIVERED") {
      throw new ValidationError("Só é possível avaliar pedido entregue");
    }

    const bought = order.items.some((item) => item.productId === input.productId);
    if (!bought) {
      throw new ValidationError("Produto não faz parte deste pedido");
    }

    const existing = await reviewRepository.findExisting(
      userId,
      input.productId,
      input.orderId,
    );
    if (existing) {
      throw new ConflictError("Você já avaliou este produto neste pedido");
    }

    return reviewRepository.create({
      userId,
      productId: input.productId,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment,
    });
  },

  listByProduct(productId: string) {
    return reviewRepository.findByProductId(productId);
  },
};
