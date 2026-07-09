import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking"); // checking | authenticated | guest

  useEffect(() => {
    const token = localStorage.getItem("redline_token");
    const cached = localStorage.getItem("redline_user");
    if (token && cached) {
      setUser(JSON.parse(cached));
      setStatus("authenticated");
    } else {
      setStatus("guest");
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem("redline_token", data.token);
    localStorage.setItem("redline_user", JSON.stringify(data.user));
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    localStorage.setItem("redline_token", data.token);
    localStorage.setItem("redline_user", JSON.stringify(data.user));
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("redline_token");
    localStorage.removeItem("redline_user");
    setUser(null);
    setStatus("guest");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
