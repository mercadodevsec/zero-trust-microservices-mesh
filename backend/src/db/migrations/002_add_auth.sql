-- Adds the columns needed for password-based authentication to the
-- existing users table, without creating a duplicate user table.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
