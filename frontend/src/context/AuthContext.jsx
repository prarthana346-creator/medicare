import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('medicare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medicare_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('medicare_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('medicare_user', JSON.stringify(res.data.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        const { token: jwtToken, admin } = res.data.data;
        setToken(jwtToken);
        setUser(admin);
        localStorage.setItem('medicare_token', jwtToken);
        localStorage.setItem('medicare_user', JSON.stringify(admin));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials or server error';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
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

