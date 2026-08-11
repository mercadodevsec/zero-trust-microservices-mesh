export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/** User shape safe to return in API responses — never includes passwordHash. */
export type PublicUser = Omit<User, 'passwordHash'>;

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
