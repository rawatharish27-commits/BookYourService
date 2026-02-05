import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { loginApi, getMeApi, api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🛡️ PHASE 2 SECURITY: Trust Backend only
   */
  const verifySession = async () => {
      try {
          const res = await getMeApi();
          const userData: User = {
              id: res.id,
              name: res.name,
              email: res.email,
              role: res.role_id === 1 ? Role.ADMIN : res.role_id === 3 ? Role.PROVIDER : Role.CLIENT, 
              verificationStatus: res.verification_status,
              adminLevel: res.admin_level
          };
          setUser(userData);
      } catch (e) {
          setUser(null);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    verifySession();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
        await loginApi(credentials);
        await verifySession();
    } catch (e) {
        setLoading(false);
        throw e;
    }
  };

  const logout = async () => {
    try {
        await api.post('/api/auth/logout');
    } catch(e) { console.error("Logout cleanup failed", e); }
    
    setUser(null);
    window.location.href = '/#/login';
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        login, 
        logout, 
        refreshUser: verifySession 
    }}>
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