import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/errors.js';
import { PaymentService } from '../payment.service.js';

describe('PaymentService', () => {
  let paymentRepo: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByOrderId: ReturnType<typeof vi.fn>;
  };
  let orderRepo: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let service: PaymentService;

  beforeEach(() => {
    paymentRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOrderId: vi.fn(),
    };
    orderRepo = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };
    service = new PaymentService(paymentRepo as any, orderRepo as any);
  });

  it('creates a payment and marks the order as paid', async () => {
    orderRepo.findById.mockResolvedValue({
      id: 1,
      userId: 1,
      description: 'Widget',
      amount: 25,
      status: 'pending',
      createdAt: new Date(),
    });
    paymentRepo.create.mockResolvedValue({
      id: 1,
      orderId: 1,
      amount: 25,
      method: 'card',
      status: 'completed',
      createdAt: new Date(),
    });

    const payment = await service.createPayment({ orderId: 1, amount: 25, method: 'card' });

    expect(payment.status).toBe('completed');
    expect(orderRepo.updateStatus).toHaveBeenCalledWith(1, 'paid');
  });

  it('throws NotFoundError when the order does not exist', async () => {
    orderRepo.findById.mockResolvedValue(null);
    await expect(
      service.createPayment({ orderId: 99, amount: 25, method: 'card' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ConflictError when the order is already paid', async () => {
    orderRepo.findById.mockResolvedValue({
      id: 1,
      userId: 1,
      description: 'Widget',
      amount: 25,
      status: 'paid',
      createdAt: new Date(),
    });

    await expect(
      service.createPayment({ orderId: 1, amount: 25, method: 'card' })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws BadRequestError when amount does not match the order', async () => {
    orderRepo.findById.mockResolvedValue({
      id: 1,
      userId: 1,
      description: 'Widget',
      amount: 25,
      status: 'pending',
      createdAt: new Date(),
    });

    await expect(
      service.createPayment({ orderId: 1, amount: 10, method: 'card' })
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
