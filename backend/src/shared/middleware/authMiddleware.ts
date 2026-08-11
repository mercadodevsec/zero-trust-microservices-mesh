import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * decoded, server-issued identity to req.user. Client-supplied identity
 * fields in the request body/query are never trusted for authorization.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    next(new UnauthorizedError('Missing token'));
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
