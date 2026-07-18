import type { Role } from "../entities/user.entity";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error";
import { storeRepository } from "../repositories/store.repository";
import type { CreateStoreInput, UpdateStoreInput } from "../schemas/store.schema";

export const storeService = {
  async create(userId: string, role: Role, input: CreateStoreInput) {
    if (role !== "SELLER" && role !== "ADMIN") {
      throw new ForbiddenError("Apenas vendedores podem criar loja");
    }

    const existing = await storeRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError("Slug já em uso");
    }

    return storeRepository.create({
      ...input,
      ownerId: userId,
    });
  },

  async update(userId: string, role: Role, storeId: string, input: UpdateStoreInput) {
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError("Loja não encontrada");
    }

    if (role !== "ADMIN" && store.ownerId !== userId) {
      throw new ForbiddenError("Você não pode editar esta loja");
    }

    if (input.slug && input.slug !== store.slug) {
      const slugTaken = await storeRepository.findBySlug(input.slug);
      if (slugTaken) {
        throw new ConflictError("Slug já em uso");
      }
    }

    return storeRepository.update(storeId, input);
  },

  async getById(storeId: string, userId?: string, role?: Role) {
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError("Loja não encontrada");
    }

    const canSeeInactive =
      role === "ADMIN" || (userId !== undefined && store.ownerId === userId);

    if (!store.isActive && !canSeeInactive) {
      throw new NotFoundError("Loja não encontrada");
    }

    return store;
  },

  async getBySlug(slug: string) {
    const store = await storeRepository.findBySlug(slug);
    if (!store || !store.isActive) {
      throw new NotFoundError("Loja não encontrada");
    }
    return store;
  },

  listMine(userId: string) {
    return storeRepository.findByOwnerId(userId);
  },
};
