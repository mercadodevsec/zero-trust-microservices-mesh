import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { DecodedJwtPayload, JwtPayload } from '../types/auth.js';

/**
 * Signs a JWT for an authenticated user. Secret and expiration come from
 * environment variables (see src/config/env.ts) — never hardcoded here.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Verifies a JWT's signature and expiration. Throws if the token is
 * missing, malformed, expired, or signed with a different secret.
 */
export function verifyToken(token: string): DecodedJwtPayload {
  return jwt.verify(token, env.jwtSecret) as DecodedJwtPayload;
}
