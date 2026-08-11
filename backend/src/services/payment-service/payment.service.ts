import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js';
import type { OrderRepository } from '../order-service/order.repository.js';
import type { PaymentRepository } from './payment.repository.js';
import type { CreatePaymentInput, Payment } from './payment.types.js';

export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private orderRepository: OrderRepository
  ) {}

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    if (!input?.orderId || !input?.amount || input.amount <= 0 || !input?.method?.trim()) {
      throw new BadRequestError('orderId, method and a positive amount are required');
    }

    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError(`Order ${input.orderId} not found`);
    }

    if (order.status === 'paid') {
      throw new ConflictError(`Order ${input.orderId} is already paid`);
    }

    if (Number(input.amount) !== Number(order.amount)) {
      throw new BadRequestError(`Payment amount must match order amount (${order.amount})`);
    }

    const payment = await this.paymentRepository.create({
      ...input,
      status: 'completed',
    });

    await this.orderRepository.updateStatus(order.id, 'paid');

    return payment;
  }

  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError(`Payment ${id} not found`);
    }
    return payment;
  }

  async listPaymentsByOrder(orderId: number): Promise<Payment[]> {
    return this.paymentRepository.findByOrderId(orderId);
  }
}
