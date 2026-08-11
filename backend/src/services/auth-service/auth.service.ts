import bcrypt from 'bcryptjs';
import { BadRequestError, UnauthorizedError } from '../../shared/errors.js';
import { signToken } from '../../shared/utils/jwt.js';
import type { UserRepository } from '../user-service/user.repository.js';
import type { AuthResult, LoginInput } from './auth.types.js';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(input: LoginInput): Promise<AuthResult> {
    if (!input?.email?.trim() || !input?.password) {
      throw new BadRequestError('email and password are required');
    }

    const user = await this.userRepository.findByEmail(input.email);

    // Same error/message for "no such user" and "wrong password" so the
    // response never reveals whether an email address is registered.
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
