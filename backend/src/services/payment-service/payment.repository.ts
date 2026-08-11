import type { Pool } from 'pg';
import type { Payment, PaymentStatus } from './payment.types.js';

interface InsertPaymentInput {
  orderId: number;
  amount: number;
  method: string;
  status: PaymentStatus;
}

export class PaymentRepository {
  constructor(private pool: Pool) {}

  async create(input: InsertPaymentInput): Promise<Payment> {
    const result = await this.pool.query(
      `INSERT INTO payments (order_id, amount, method, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_id AS "orderId", amount, method, status, created_at AS "createdAt"`,
      [input.orderId, input.amount, input.method, input.status]
    );
    return result.rows[0];
  }

  async findById(id: number): Promise<Payment | null> {
    const result = await this.pool.query(
      `SELECT id, order_id AS "orderId", amount, method, status, created_at AS "createdAt"
       FROM payments WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByOrderId(orderId: number): Promise<Payment[]> {
    const result = await this.pool.query(
      `SELECT id, order_id AS "orderId", amount, method, status, created_at AS "createdAt"
       FROM payments WHERE order_id = $1 ORDER BY id`,
      [orderId]
    );
    return result.rows;
  }
}
