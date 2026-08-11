import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guards a subtree of routes: unauthenticated users are redirected to
 * /login (preserving where they were headed), so protected pages can never
 * be reached just by typing the URL. Renders nothing while auth state is
 * still being restored from storage to avoid a login-page flash.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="page-loading">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
