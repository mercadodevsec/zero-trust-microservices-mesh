import type { Request, Response } from 'express';
import type { PaymentService } from './payment.service.js';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  create = async (req: Request, res: Response) => {
    const payment = await this.paymentService.createPayment(req.body);
    res.status(201).json(payment);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const payment = await this.paymentService.getPaymentById(id);
    res.json(payment);
  };

  list = async (req: Request, res: Response) => {
    const orderId = Number(req.query.orderId);
    const payments = await this.paymentService.listPaymentsByOrder(orderId);
    res.json(payments);
  };
}
