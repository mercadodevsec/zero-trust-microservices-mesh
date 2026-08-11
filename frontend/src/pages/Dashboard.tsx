import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <button type="button" className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <p className="welcome">Welcome, {user?.email}</p>
      <p className="role">
        Role: <strong>{user?.role}</strong>
      </p>
      <p className="auth-status">Authentication status: <strong>Authenticated</strong></p>

      <nav className="dashboard-nav">
        <Link to="/orders">Orders</Link>
        <Link to="/payments">Payments</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </div>
  );
}
