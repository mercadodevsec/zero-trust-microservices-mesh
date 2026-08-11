import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors.js';
import { AuthService } from '../auth.service.js';

describe('AuthService', () => {
  let userRepo: {
    findByEmail: ReturnType<typeof vi.fn>;
  };
  let service: AuthService;

  beforeEach(() => {
    userRepo = {
      findByEmail: vi.fn(),
    };
    service = new AuthService(userRepo as any);
  });

  it('logs in with valid credentials and returns a signed JWT', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      passwordHash,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.login({ email: 'ada@example.com', password: 'correct-password' });

    expect(result.token).toEqual(expect.any(String));
    expect(result.token.split('.')).toHaveLength(3); // header.payload.signature
    expect(result.user).toEqual({ id: 1, email: 'ada@example.com', role: 'user' });
  });

  it('throws UnauthorizedError for an incorrect password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      passwordHash,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.login({ email: 'ada@example.com', password: 'wrong-password' })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws UnauthorizedError for a nonexistent user', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'whatever123' })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws BadRequestError when email is missing', async () => {
    await expect(service.login({ email: '', password: 'something' })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it('throws BadRequestError when password is missing', async () => {
    await expect(
      service.login({ email: 'ada@example.com', password: '' })
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
