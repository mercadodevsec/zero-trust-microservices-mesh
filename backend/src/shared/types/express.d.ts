import type { JwtPayload } from './auth.js';

// Augments Express's Request type so authenticated routes get proper
// TypeScript types for req.user instead of `any`.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
