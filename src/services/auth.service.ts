import { env } from "../config/env";
import type { Role } from "../entities/user.entity";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/app-error";
import { hashProvider } from "../providers/hash.provider";
import { tokenProvider } from "../providers/token.provider";
import { refreshTokenRepository } from "../repositories/refresh-token.repository";
import { userRepository } from "../repositories/user.repository";
import type { LoginInput, RefreshInput, RegisterInput } from "../schemas/auth.schema";
import { prisma } from "../shared/prisma";

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function issueTokens(userId: string, role: Role) {
  const accessToken = tokenProvider.signAccessToken({ sub: userId, role });
  const refreshToken = tokenProvider.generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_DAYS);

  await refreshTokenRepository.create({ userId, token: refreshToken, expiresAt });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email.toLowerCase());
    if (existing) {
      throw new ConflictError("E-mail já cadastrado");
    }

    const role = input.role ?? "CUSTOMER";
    const passwordHash = await hashProvider.hash(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          role,
        },
      });
      await tx.cart.create({ data: { userId: created.id } });
      return created;
    });

    return toPublicUser(user);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedError("E-mail ou senha inválidos");
    }

    const valid = await hashProvider.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthorizedError("E-mail ou senha inválidos");
    }

    const tokens = await issueTokens(user.id, user.role);

    return {
      user: toPublicUser(user),
      ...tokens,
    };
  },

  async refresh(input: RefreshInput) {
    const stored = await refreshTokenRepository.findByToken(input.refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token inválido");
    }

    await refreshTokenRepository.deleteByToken(input.refreshToken);
    const tokens = await issueTokens(stored.user.id, stored.user.role);

    return {
      user: toPublicUser(stored.user),
      ...tokens,
    };
  },

  async me(userId: string) {
    const user = await userRepository.findPublicById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return user;
  },

  async logout(refreshToken: string) {
    await refreshTokenRepository.deleteByToken(refreshToken);
  },
};
