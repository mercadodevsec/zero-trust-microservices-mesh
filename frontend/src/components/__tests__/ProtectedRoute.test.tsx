import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthContext } from '../../context/AuthContext';

function renderProtected(isAuthenticated: boolean, isLoading = false) {
  const contextValue = {
    user: isAuthenticated ? { id: 1, email: 'ada@example.com', role: 'user' } : null,
    token: isAuthenticated ? 'token' : null,
    isAuthenticated,
    isLoading,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when the user is not authenticated', () => {
    renderProtected(false);

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });

  it('renders the protected content when the user is authenticated', () => {
    renderProtected(true);

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('does not redirect while auth state is still loading', () => {
    renderProtected(false, true);

    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });
});
