import type { Pool } from 'pg';
import type { User } from './user.types.js';

interface InsertUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}

const SELECT_COLUMNS = `
  id,
  name,
  email,
  password_hash AS "passwordHash",
  role,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export class UserRepository {
  constructor(private pool: Pool) {}

  async create(input: InsertUserInput): Promise<User> {
    const result = await this.pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [input.name, input.email, input.passwordHash, input.role ?? 'user']
    );
    return result.rows[0];
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT ${SELECT_COLUMNS} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT ${SELECT_COLUMNS} FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] ?? null;
  }

  async findAll(): Promise<User[]> {
    const result = await this.pool.query(
      `SELECT ${SELECT_COLUMNS} FROM users ORDER BY id`
    );
    return result.rows;
  }
}
