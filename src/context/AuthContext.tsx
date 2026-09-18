import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  deductCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
}

const DEFAULT_USER: User = {
  id: 'u-student-01',
  name: 'Rameshwar Dewangan',
  email: 'rameshwar@cgssbtest.com',
  role: 'student',
  credits: 350,
  registeredAt: '2024-01-15',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cgssb_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('cgssb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cgssb_user');
    }
  }, [user]);

  const login = (email: string, role: UserRole, name?: string) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name || (role === 'admin' ? 'Super Admin' : 'Aspirant Student'),
      email,
      role,
      credits: role === 'admin' ? 9999 : 350,
      registeredAt: new Date().toISOString().split('T')[0],
      token: `jwt-cgssb-${Date.now()}`,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = {
      ...user,
      role: newRole,
      name: newRole === 'admin' ? 'Super Admin' : 'Rameshwar Dewangan',
    };
    setUser(updated);
  };

  const deductCredits = (amount: number): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // unlimited
    if (user.credits < amount) return false;
    setUser({ ...user, credits: user.credits - amount });
    return true;
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    setUser({ ...user, credits: user.credits + amount });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, deductCredits, addCredits }}>
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
