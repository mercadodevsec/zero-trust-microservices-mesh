import { BadRequestError, NotFoundError } from '../../shared/errors.js';
import type { UserRepository } from '../user-service/user.repository.js';
import type { OrderRepository } from './order.repository.js';
import type { CreateOrderInput, Order, OrderStatus } from './order.types.js';

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private userRepository: UserRepository
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (!input?.userId || !input?.description?.trim() || !input?.amount || input.amount <= 0) {
      throw new BadRequestError('userId, description and a positive amount are required');
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError(`User ${input.userId} not found`);
    }

    return this.orderRepository.create(input);
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return order;
  }

  async listOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async listOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.updateStatus(id, status);
    if (!order) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return order;
  }
}
