import bcrypt from 'bcryptjs';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js';
import type { UserRepository } from './user.repository.js';
import { toPublicUser } from './user.types.js';
import type { CreateUserInput, PublicUser } from './user.types.js';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<PublicUser> {
    if (!input?.name?.trim() || !input?.email?.trim() || !input?.password) {
      throw new BadRequestError('name, email and password are required');
    }

    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestError(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(`User with email ${input.email} already exists`);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    return toPublicUser(user);
  }

  async getUserById(id: number): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }
    return toPublicUser(user);
  }

  async listUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.findAll();
    return users.map(toPublicUser);
  }
}
