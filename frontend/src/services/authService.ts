import { api } from './api';
import type { AuthUser, LoginCredentials, LoginResponse } from '../types/auth';

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/auth/login', credentials, { auth: false }),

  me: () => api.get<AuthUser>('/api/users/me'),
};
