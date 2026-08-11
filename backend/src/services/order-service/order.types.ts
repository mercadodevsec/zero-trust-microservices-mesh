export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export interface Order {
  id: number;
  userId: number;
  description: string;
  amount: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface CreateOrderInput {
  userId: number;
  description: string;
  amount: number;
}
