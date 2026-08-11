import type { Pool } from 'pg';
import type { CreateOrderInput, Order, OrderStatus } from './order.types.js';

export class OrderRepository {
  constructor(private pool: Pool) {}

  async create(input: CreateOrderInput): Promise<Order> {
    const result = await this.pool.query(
      `INSERT INTO orders (user_id, description, amount)
       VALUES ($1, $2, $3)
       RETURNING id, user_id AS "userId", description, amount, status, created_at AS "createdAt"`,
      [input.userId, input.description, input.amount]
    );
    return result.rows[0];
  }

  async findById(id: number): Promise<Order | null> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", description, amount, status, created_at AS "createdAt"
       FROM orders WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", description, amount, status, created_at AS "createdAt"
       FROM orders WHERE user_id = $1 ORDER BY id`,
      [userId]
    );
    return result.rows;
  }

  async findAll(): Promise<Order[]> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", description, amount, status, created_at AS "createdAt"
       FROM orders ORDER BY id`
    );
    return result.rows;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    const result = await this.pool.query(
      `UPDATE orders SET status = $2 WHERE id = $1
       RETURNING id, user_id AS "userId", description, amount, status, created_at AS "createdAt"`,
      [id, status]
    );
    return result.rows[0] ?? null;
  }
}
