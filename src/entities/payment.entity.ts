export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  amountInCents: number;
  clientSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}
