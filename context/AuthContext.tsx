
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginApi, registerApi, api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize: Trust localStorage first for speed, but rely on API for truth
  useEffect(() => {
    const storedUser = localStorage.getItem('bys_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check session validity with backend
    const verifySession = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data.user);
            localStorage.setItem('bys_user', JSON.stringify(res.data.user));
        } catch (e) {
            // If check fails (401), clear local state
            setUser(null);
            localStorage.removeItem('bys_user');
        }
    };
    verifySession();
  }, []);

  const login = async (credentials: any) => {
    try {
        const data = await loginApi(credentials);
        // Backend now sets cookies. We only store User Profile info.
        const userData = data.user;
        localStorage.setItem('bys_user', JSON.stringify(userData));
        setUser(userData);
    } catch (e) {
        console.error("Login failed", e);
        throw e;
    }
  };

  const register = async (data: any) => {
      await registerApi(data);
  };

  const logout = async () => {
    try {
        await api.post('/api/auth/logout');
    } catch(e) { console.error("Logout error", e); }
    
    setUser(null);
    localStorage.removeItem('bys_user');
    window.location.href = '/#/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
