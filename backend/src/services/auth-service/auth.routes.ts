import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import type { AuthController } from './auth.controller.js';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  // Public — no authenticate middleware here.
  router.post('/login', asyncHandler(controller.login));

  return router;
}
