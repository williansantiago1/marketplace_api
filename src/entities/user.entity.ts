export type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, "passwordHash">;
