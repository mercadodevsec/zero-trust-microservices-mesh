import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { ApiError } from '../services/api';
import type { AuthUser } from '../types/auth';

/**
 * Demonstrates a protected API call: this page fetches the current user
 * from GET /api/users/me using the stored JWT, rather than only trusting
 * the locally cached user object from login.
 */
export function Profile() {
  const { user: cachedUser } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authService
      .me()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load profile.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayUser = profile ?? cachedUser;

  return (
    <div className="page">
      <h1>Profile</h1>
      {isLoading && <p>Loading profile…</p>}
      {error && <p className="form-error">{error}</p>}
      {displayUser && (
        <dl className="profile-details">
          <dt>Email</dt>
          <dd>{displayUser.email}</dd>
          <dt>Role</dt>
          <dd>{displayUser.role}</dd>
          <dt>User ID</dt>
          <dd>{displayUser.id}</dd>
        </dl>
      )}
    </div>
  );
}
