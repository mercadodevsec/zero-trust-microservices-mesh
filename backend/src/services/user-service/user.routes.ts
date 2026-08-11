import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import type { UserController } from './user.controller.js';

export function createUserRouter(
  controller: UserController,
  authenticate: RequestHandler
): Router {
  const router = Router();

  // Registration stays public — this is how a user gets credentials.
  router.post('/', asyncHandler(controller.create));

  // Everything else requires a valid JWT.
  router.get('/me', authenticate, asyncHandler(controller.me));
  router.get('/', authenticate, asyncHandler(controller.list));
  router.get('/:id', authenticate, asyncHandler(controller.getById));

  return router;
}
