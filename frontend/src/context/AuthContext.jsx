import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    authAPI.getProfile()
      .then(res => { if (res.status === 'success') setUser(res.data.user); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.status === 'success') {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Authentication failed');
  };

  const register = async (name, email, password, plan = 'FREE') => {
    await authAPI.register(name, email, password, plan);
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
