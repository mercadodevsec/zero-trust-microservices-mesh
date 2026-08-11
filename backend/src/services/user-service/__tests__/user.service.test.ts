import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/errors.js';
import { UserService } from '../user.service.js';

describe('UserService', () => {
  let repo: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
  };
  let service: UserService;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
    };
    service = new UserService(repo as any);
  });

  it('creates a user when the email is unique, hashing the password', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      id: 1,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hashed-value',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await service.createUser({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'correct-horse-battery',
    });

    expect(user.id).toBe(1);
    expect(user).not.toHaveProperty('passwordHash');

    expect(repo.create).toHaveBeenCalledTimes(1);
    const createArg = repo.create.mock.calls[0][0];
    expect(createArg.name).toBe('Ada Lovelace');
    expect(createArg.email).toBe('ada@example.com');
    expect(createArg.passwordHash).toEqual(expect.any(String));
    expect(createArg.passwordHash).not.toBe('correct-horse-battery');
  });

  it('throws ConflictError when the email is already taken', async () => {
    repo.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hashed-value',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.createUser({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123' })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws BadRequestError when required fields are missing', async () => {
    await expect(
      service.createUser({ name: '', email: '', password: '' })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError when the password is too short', async () => {
    repo.findByEmail.mockResolvedValue(null);
    await expect(
      service.createUser({ name: 'Ada', email: 'ada@example.com', password: 'short' })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws NotFoundError when the user does not exist', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getUserById(99)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns the list of users without password hashes', async () => {
    repo.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        passwordHash: 'hashed-value',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const users = await service.listUsers();
    expect(users).toHaveLength(1);
    expect(users[0]).not.toHaveProperty('passwordHash');
  });
});
