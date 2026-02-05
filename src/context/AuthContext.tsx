
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginApi, registerApi, logoutApi, getMeApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
      try {
          const res = await getMeApi();
          // Map backend response to frontend User type if needed
          const userData: User = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              role: res.user.role, // Ensure backend sends 'role' name
              verificationStatus: res.user.verification_status,
              adminLevel: res.user.admin_level
          };
          setUser(userData);
      } catch (e) {
          setUser(null);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials: any) => {
    await loginApi(credentials);
    await fetchUser(); // Update state from HttpOnly cookie session
  };

  const register = async (data: any) => {
      await registerApi(data);
  };

  const logout = async () => {
    try {
        await logoutApi();
    } catch(e) { console.error(e); }
    setUser(null);
    window.location.href = '/#/login';
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, refreshUser: fetchUser }}>
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
