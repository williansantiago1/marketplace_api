export type CouponType = "PERCENT" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  storeId: string | null;
  type: CouponType;
  value: number;
  minOrderInCents: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
