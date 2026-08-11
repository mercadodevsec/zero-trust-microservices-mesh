import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/basic_app',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

// Fail fast in production if the secret is missing; just warn in dev/test so
// local setup errors are noisy but non-fatal until a token is actually signed.
if (!env.jwtSecret) {
  if (env.nodeEnv === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // eslint-disable-next-line no-console
  console.warn(
    'WARNING: JWT_SECRET is not set. Add it to your .env file before issuing or verifying tokens.'
  );
}
