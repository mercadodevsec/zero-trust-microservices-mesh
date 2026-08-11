import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Login } from '../Login';
import { AuthContext } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import type { AuthUser } from '../../types/auth';

function renderLogin(login: ReturnType<typeof vi.fn>, isAuthenticated = false) {
  const contextValue = {
    user: null as AuthUser | null,
    token: null,
    isAuthenticated,
    isLoading: false,
    login,
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email, password fields and a submit button', () => {
    renderLogin(vi.fn());

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows a loading state and calls login with the entered credentials on submit', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    renderLogin(login);

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/password/i), 'correct-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(login).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'correct-password',
    });
  });

  it('shows an error message when login fails with invalid credentials', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new ApiError('Invalid email or password', 401));
    renderLogin(login);

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i);
  });

  it('redirects to the dashboard after a successful login', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    renderLogin(login);

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/password/i), 'correct-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    });
  });
});
