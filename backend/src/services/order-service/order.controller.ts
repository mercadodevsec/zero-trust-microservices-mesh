import type { Request, Response } from 'express';
import type { OrderService } from './order.service.js';

export class OrderController {
  constructor(private orderService: OrderService) {}

  create = async (req: Request, res: Response) => {
    const order = await this.orderService.createOrder(req.body);
    res.status(201).json(order);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const order = await this.orderService.getOrderById(id);
    res.json(order);
  };

  list = async (req: Request, res: Response) => {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const orders = userId
      ? await this.orderService.listOrdersByUser(userId)
      : await this.orderService.listOrders();
    res.json(orders);
  };
}
