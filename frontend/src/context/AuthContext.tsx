/**
 * Auth Context - Authentication state management
 */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { UserRole } from '../types';

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  status: 'active' | 'pending' | 'blocked';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (phone: string, role: UserRole) => {
    // Simulate login - replace with actual auth logic
    const mockUser: User = {
      id: '1',
      phone,
      name: 'Demo User',
      role,
      status: 'active',
      city: 'Mumbai'
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;

