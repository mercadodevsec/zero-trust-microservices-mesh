import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Access authentication state and actions (login/logout). Must be used
 * within an <AuthProvider>. Centralizing this in one hook keeps auth logic
 * out of individual components.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
