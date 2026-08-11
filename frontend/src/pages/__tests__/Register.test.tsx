import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Register } from '../Register';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { ApiError } from '../../services/api';
import type { AuthUser } from '../../types/auth';

vi.mock('../../services/authService', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    me: vi.fn(),
  },
}));

function renderRegister(login: ReturnType<typeof vi.fn>, isAuthenticated = false) {
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
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { name = 'Ada Lovelace', email = 'ada@example.com', password = 'password123', confirm = password } = {}
) {
  await user.type(screen.getByLabelText(/^name$/i), name);
  await user.type(screen.getByLabelText(/^email$/i), email);
  await user.type(screen.getByLabelText(/^password$/i), password);
  await user.type(screen.getByLabelText(/confirm password/i), confirm);
}

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name, email, password, and confirm password fields', () => {
    renderRegister(vi.fn());

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows an error when passwords do not match, without calling the API', async () => {
    const user = userEvent.setup();
    renderRegister(vi.fn());

    await fillForm(user, { confirm: 'different-password' });
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/i);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('registers, logs in automatically, and redirects to the dashboard', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    vi.mocked(authService.register).mockResolvedValue({
      id: 1,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'user',
    });

    renderRegister(login);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password123' });
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    });
  });

  it('shows a friendly error when the email is already registered', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.register).mockRejectedValue(
      new ApiError('User with email ada@example.com already exists', 409)
    );

    renderRegister(vi.fn());

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i);
  });
});
