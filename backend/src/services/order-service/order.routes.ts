import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import type { OrderController } from './order.controller.js';

export function createOrderRouter(
  controller: OrderController,
  authenticate: RequestHandler
): Router {
  const router = Router();

  router.use(authenticate);
  router.post('/', asyncHandler(controller.create));
  router.get('/', asyncHandler(controller.list));
  router.get('/:id', asyncHandler(controller.getById));

  return router;
}
