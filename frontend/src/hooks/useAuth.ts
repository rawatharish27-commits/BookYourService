// src/hooks/useAuth.ts

/**
 * A placeholder authentication hook.
 * In a real application, this would be connected to a React Context.
 * It provides the user's authentication status and role.
 *
 * @returns An object containing the user's token and role.
 */
export const useAuth = () => {
  // In a real app, you'd get this from context, which is updated on login/logout.
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') as 'customer' | 'provider' | 'admin' | null;

  return { isAuthenticated: !!token, role };
};
