import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    me: vi.fn(),
  },
}));

function TestConsumer() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="status">{isAuthenticated ? 'authenticated' : 'anonymous'}</p>
      <p data-testid="email">{user?.email ?? 'none'}</p>
      <button onClick={() => login({ email: 'ada@example.com', password: 'password123' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated when no stored session exists', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'));
  });

  it('logs in, stores the session, and updates auth state', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValue({
      message: 'Login successful',
      token: 'fake.jwt.token',
      user: { id: 1, email: 'ada@example.com', role: 'user' },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('email')).toHaveTextContent('ada@example.com');
    expect(localStorage.getItem('auth_token')).toBe('fake.jwt.token');
  });

  it('restores authentication state from storage on reload', async () => {
    localStorage.setItem('auth_token', 'stored.jwt.token');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'ada@example.com', role: 'user' }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('email')).toHaveTextContent('ada@example.com');
  });

  it('clears authentication state and storage on logout', async () => {
    const user = userEvent.setup();
    localStorage.setItem('auth_token', 'stored.jwt.token');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'ada@example.com', role: 'user' }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    await user.click(screen.getByText('logout'));

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
