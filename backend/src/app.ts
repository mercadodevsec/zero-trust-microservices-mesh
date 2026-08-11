import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './shared/middleware/errorHandler.js';
import { notFound } from './shared/middleware/notFound.js';
import { authenticate } from './shared/middleware/authMiddleware.js';
import { pool } from './db/pool.js';

import { AuthController } from './services/auth-service/auth.controller.js';
import { createAuthRouter } from './services/auth-service/auth.routes.js';
import { AuthService } from './services/auth-service/auth.service.js';

import { OrderController } from './services/order-service/order.controller.js';
import { OrderRepository } from './services/order-service/order.repository.js';
import { createOrderRouter } from './services/order-service/order.routes.js';
import { OrderService } from './services/order-service/order.service.js';

import { PaymentController } from './services/payment-service/payment.controller.js';
import { PaymentRepository } from './services/payment-service/payment.repository.js';
import { createPaymentRouter } from './services/payment-service/payment.routes.js';
import { PaymentService } from './services/payment-service/payment.service.js';

import { UserController } from './services/user-service/user.controller.js';
import { UserRepository } from './services/user-service/user.repository.js';
import { createUserRouter } from './services/user-service/user.routes.js';
import { UserService } from './services/user-service/user.service.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  // CORS: allow the configured frontend origin (defaults to Vite's dev
  // server) so the browser app can call this API with credentials/headers.
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    })
  );
  app.use(express.json());

  // Repositories
  const userRepository = new UserRepository(pool);
  const orderRepository = new OrderRepository(pool);
  const paymentRepository = new PaymentRepository(pool);

  // Services
  const authService = new AuthService(userRepository);
  const userService = new UserService(userRepository);
  const orderService = new OrderService(orderRepository, userRepository);
  const paymentService = new PaymentService(paymentRepository, orderRepository);

  // Controllers
  const authController = new AuthController(authService);
  const userController = new UserController(userService);
  const orderController = new OrderController(orderService);
  const paymentController = new PaymentController(paymentService);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/auth', createAuthRouter(authController));
  app.use('/api/users', createUserRouter(userController, authenticate));
  app.use('/api/orders', createOrderRouter(orderController, authenticate));
  app.use('/api/payments', createPaymentRouter(paymentController, authenticate));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
