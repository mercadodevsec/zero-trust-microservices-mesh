import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import type { UserService } from './user.service.js';

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json(user);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await this.userService.getUserById(id);
    res.json(user);
  };

  list = async (_req: Request, res: Response) => {
    const users = await this.userService.listUsers();
    res.json(users);
  };

  // Protected — relies on authMiddleware having attached req.user from the
  // verified JWT. Never trusts a client-supplied id for "who am I".
  me = async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await this.userService.getUserById(Number(req.user.sub));
    res.json(user);
  };
}
