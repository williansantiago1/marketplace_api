import type { Role } from "../entities/user.entity";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/app-error";
import { categoryRepository } from "../repositories/category.repository";
import { productRepository } from "../repositories/product.repository";
import { storeRepository } from "../repositories/store.repository";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../schemas/product.schema";

async function assertCanManageStore(userId: string, role: Role, storeId: string) {
  const store = await storeRepository.findById(storeId);
  if (!store) {
    throw new NotFoundError("Loja não encontrada");
  }
  if (role !== "ADMIN" && store.ownerId !== userId) {
    throw new ForbiddenError("Você não gerencia esta loja");
  }
  return store;
}

export const productService = {
  async create(userId: string, role: Role, input: CreateProductInput) {
    await assertCanManageStore(userId, role, input.storeId);

    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError("Categoria não encontrada");
    }

    if (input.priceInCents <= 0) {
      throw new ValidationError("Preço inválido");
    }

    return productRepository.create(input);
  },

  async update(userId: string, role: Role, productId: string, input: UpdateProductInput) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Produto não encontrado");
    }

    await assertCanManageStore(userId, role, product.storeId);

    if (input.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new NotFoundError("Categoria não encontrada");
      }
    }

    return productRepository.update(productId, input);
  },

  async getById(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new NotFoundError("Produto não encontrado");
    }
    return product;
  },

  list(query: ListProductsQuery) {
    return productRepository.list({
      ...query,
      onlyActive: true,
    });
  },
};
