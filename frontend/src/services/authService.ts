import { api } from './api';
import type { AuthUser, LoginCredentials, LoginResponse, RegisterInput } from '../types/auth';

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/auth/login', credentials, { auth: false }),

  // Registration is public and doesn't return a token — the caller logs in
  // separately afterwards (see Register.tsx, which auto-logs-in on success).
  register: (input: RegisterInput) =>
    api.post<{ id: number; name: string; email: string; role: string }>('/api/users', input, {
      auth: false,
    }),

  me: () => api.get<AuthUser>('/api/users/me'),
};
