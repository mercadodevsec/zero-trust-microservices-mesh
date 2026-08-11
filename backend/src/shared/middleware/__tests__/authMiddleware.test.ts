import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../authMiddleware.js';
import { signToken } from '../../utils/jwt.js';
import { UnauthorizedError } from '../../errors.js';
import { env } from '../../../config/env.js';

function createReq(header?: string) {
  return { headers: { authorization: header } } as any;
}

describe('authenticate middleware', () => {
  it('attaches the decoded user and calls next() with no error for a valid token', () => {
    const token = signToken({ sub: '1', email: 'ada@example.com', role: 'user' });
    const req = createReq(`Bearer ${token}`);
    const next = vi.fn();

    authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ sub: '1', email: 'ada@example.com', role: 'user' });
  });

  it('rejects a missing Authorization header', () => {
    const req = createReq(undefined);
    const next = vi.fn();

    authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects a malformed Authorization header (no Bearer prefix)', () => {
    const req = createReq('Token abc123');
    const next = vi.fn();

    authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects a garbage/invalid token', () => {
    const req = createReq('Bearer not-a-real-token');
    const next = vi.fn();

    authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects a token signed with the wrong secret', () => {
    const badToken = jwt.sign({ sub: '1', email: 'ada@example.com', role: 'user' }, 'wrong-secret');
    const req = createReq(`Bearer ${badToken}`);
    const next = vi.fn();

    authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects an expired token', () => {
    const expiredToken = jwt.sign(
      { sub: '1', email: 'ada@example.com', role: 'user' },
      env.jwtSecret,
      { expiresIn: -10 }
    );
    const req = createReq(`Bearer ${expiredToken}`);
    const next = vi.fn();

    authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
