import { ConflictError, NotFoundError } from "../errors/app-error";
import { categoryRepository } from "../repositories/category.repository";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema";

export const categoryService = {
  async create(input: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError("Slug já em uso");
    }
    return categoryRepository.create(input);
  },

  async update(id: string, input: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Categoria não encontrada");
    }

    if (input.slug && input.slug !== category.slug) {
      const slugTaken = await categoryRepository.findBySlug(input.slug);
      if (slugTaken) {
        throw new ConflictError("Slug já em uso");
      }
    }

    return categoryRepository.update(id, input);
  },

  list() {
    return categoryRepository.list();
  },

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Categoria não encontrada");
    }
    return category;
  },
};
