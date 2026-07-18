import type { Coupon } from "../entities/coupon.entity";
import type { Role } from "../entities/user.entity";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/app-error";
import { couponRepository } from "../repositories/coupon.repository";
import { storeRepository } from "../repositories/store.repository";
import type { CreateCouponInput, ValidateCouponInput } from "../schemas/coupon.schema";

function assertCouponValue(type: "PERCENT" | "FIXED", value: number) {
  if (type === "PERCENT" && (value < 1 || value > 100)) {
    throw new ValidationError("Percentual deve ser entre 1 e 100");
  }
  if (type === "FIXED" && value <= 0) {
    throw new ValidationError("Valor fixo inválido");
  }
}

export const couponService = {
  calculateDiscount(subtotalInCents: number, coupon: Coupon) {
    let discount =
      coupon.type === "PERCENT"
        ? Math.floor((subtotalInCents * coupon.value) / 100)
        : coupon.value;

    if (discount > subtotalInCents) {
      discount = subtotalInCents;
    }
    return discount;
  },

  async create(userId: string, role: Role, input: CreateCouponInput) {
    assertCouponValue(input.type, input.value);

    if (input.storeId) {
      const store = await storeRepository.findById(input.storeId);
      if (!store) {
        throw new NotFoundError("Loja não encontrada");
      }
      if (role !== "ADMIN" && store.ownerId !== userId) {
        throw new ForbiddenError("Você não gerencia esta loja");
      }
    } else if (role !== "ADMIN") {
      throw new ForbiddenError("Apenas admin cria cupom global");
    }

    const existing = await couponRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError("Código de cupom já existe");
    }

    return couponRepository.create({
      code: input.code,
      type: input.type,
      value: input.value,
      storeId: input.storeId ?? null,
      minOrderInCents: input.minOrderInCents ?? null,
      maxUses: input.maxUses ?? null,
      startsAt: input.startsAt ?? null,
      expiresAt: input.expiresAt ?? null,
    });
  },

  async validate(input: ValidateCouponInput) {
    const coupon = await couponRepository.findByCode(input.code);
    if (!coupon || !coupon.isActive) {
      throw new ValidationError("Cupom inválido");
    }

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
    if (coupon.storeId && input.storeId && coupon.storeId !== input.storeId) {
      throw new ValidationError("Cupom não vale para esta loja");
    }

    const subtotal = input.subtotalInCents ?? 0;
    if (coupon.minOrderInCents !== null && subtotal < coupon.minOrderInCents) {
      throw new ValidationError("Pedido abaixo do mínimo do cupom");
    }

    const discountInCents = this.calculateDiscount(subtotal, coupon);

    return { coupon, discountInCents };
  },

  listByStore(storeId: string) {
    return couponRepository.listByStoreId(storeId);
  },
};
