export type PaymentStatus = 'completed' | 'failed';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: PaymentStatus;
  createdAt: Date;
}

export interface CreatePaymentInput {
  orderId: number;
  amount: number;
  method: string;
}
