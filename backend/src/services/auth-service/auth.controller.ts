import type { Request, Response } from 'express';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  };
}
