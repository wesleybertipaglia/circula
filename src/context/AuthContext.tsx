'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { getUsers, addUser as addDataUser } from '@/lib/data.client';

type LoginCredentials = {
  email: string;
  password: string;
};

type SignUpData = Omit<User, 'id' | 'reputation' | 'completedTransactions'>;


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignUpData) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem('circula-userId');
      if (storedUserId) {
        const allUsers = getUsers();
        const loggedInUser = allUsers.find(u => u.id === storedUserId);
        setUser(loggedInUser || null);
      }
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }: LoginCredentials): Promise<boolean> => {
    const allUsers = getUsers();
    const userToLogin = allUsers.find(u => u.email === email && u.password === password);
    if (userToLogin) {
      localStorage.setItem('circula-userId', userToLogin.id);
      setUser(userToLogin);
      return true;
    }
    return false;
  }, []);
  
  const signup = useCallback(async (data: SignUpData): Promise<boolean> => {
    const allUsers = getUsers();
    const existingUser = allUsers.find(u => u.email === data.email);
    if (existingUser) {
        return false; // User already exists
    }
    const newUser = addDataUser(data);
    localStorage.setItem('circula-userId', newUser.id);
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('circula-userId');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
