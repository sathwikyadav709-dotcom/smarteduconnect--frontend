import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const authData = response.data.data;
        const userData = {
          id: authData.id,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role,
          studentId: authData.studentId,
          rollNumber: authData.rollNumber
        };

        setToken(authData.token);
        setUser(userData);

        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isStudent = user?.role === 'ROLE_STUDENT';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
