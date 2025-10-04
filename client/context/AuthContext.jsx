import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      API.get("/auth/me")
        .then((res) => setUser(res.data?.user || res.data))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    console.log('Calling API.post /auth/register with:', payload);
    const { data } = await API.post("/auth/register", payload);
    console.log('API.post /auth/register response:', data);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const forgotPassword = async (email) => {
    await API.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (token, password) => {
    await API.post(`/auth/reset-password/${token}`, { password });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, forgotPassword, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
