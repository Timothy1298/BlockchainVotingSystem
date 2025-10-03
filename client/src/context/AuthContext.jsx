import React, { createContext, useEffect, useState } from 'react';
import API from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await API.get('/auth/me');
        setUser(res.data.user || res.data);
      } catch (err) {
        console.error('Auth init failed', err);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const t = res.data.token;
    setToken(t);
    try { localStorage.setItem('token', t); } catch (e) {}
    setUser(res.data.user || res.data);
    return res.data;
  };

  const register = async (payload) => {
    const res = await API.post('/auth/register', payload);
    const t = res.data.token;
    setToken(t);
    try { localStorage.setItem('token', t); } catch (e) {}
    setUser(res.data.user || res.data);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try { localStorage.removeItem('token'); } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
