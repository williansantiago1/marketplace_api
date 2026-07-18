export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
