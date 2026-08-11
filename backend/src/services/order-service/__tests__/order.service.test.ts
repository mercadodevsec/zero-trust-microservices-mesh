import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError, NotFoundError } from '../../../shared/errors.js';
import { OrderService } from '../order.service.js';

describe('OrderService', () => {
  let orderRepo: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let userRepo: {
    findById: ReturnType<typeof vi.fn>;
  };
  let service: OrderService;

  beforeEach(() => {
    orderRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findAll: vi.fn(),
      updateStatus: vi.fn(),
    };
    userRepo = {
      findById: vi.fn(),
    };
    service = new OrderService(orderRepo as any, userRepo as any);
  });

  it('creates an order when the user exists', async () => {
    userRepo.findById.mockResolvedValue({ id: 1, name: 'Ada', email: 'a@a.com', createdAt: new Date() });
    orderRepo.create.mockResolvedValue({
      id: 1,
      userId: 1,
      description: 'Widget',
      amount: 25,
      status: 'pending',
      createdAt: new Date(),
    });

    const order = await service.createOrder({ userId: 1, description: 'Widget', amount: 25 });
    expect(order.id).toBe(1);
    expect(orderRepo.create).toHaveBeenCalledWith({ userId: 1, description: 'Widget', amount: 25 });
  });

  it('throws NotFoundError when the user does not exist', async () => {
    userRepo.findById.mockResolvedValue(null);
    await expect(
      service.createOrder({ userId: 99, description: 'Widget', amount: 25 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError for an invalid amount', async () => {
    await expect(
      service.createOrder({ userId: 1, description: 'Widget', amount: 0 })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws NotFoundError when order is missing', async () => {
    orderRepo.findById.mockResolvedValue(null);
    await expect(service.getOrderById(1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates order status', async () => {
    orderRepo.updateStatus.mockResolvedValue({
      id: 1,
      userId: 1,
      description: 'Widget',
      amount: 25,
      status: 'cancelled',
      createdAt: new Date(),
    });

    const order = await service.updateStatus(1, 'cancelled');
    expect(order.status).toBe('cancelled');
  });
});
