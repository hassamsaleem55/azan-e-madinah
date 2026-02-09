import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);   // initial check
  const [loggingIn, setLoggingIn] = useState(false); // active login
  const [token, setToken] = useState(() => localStorage.getItem("frontend_token"));

  const logout = useCallback(() => {
    localStorage.removeItem("frontend_token");
    window.scrollTo(0, 0);
    setToken(null); // 👈 clear token state
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (skipLoading = false) => {
    const token = localStorage.getItem("frontend_token");
    if (!token) {
      setUser(null);
      if (!skipLoading) setLoading(false);
      return;
    }

    try {
      if (!skipLoading) setLoading(true);
      const res = await axiosInstance.get("/auth/profile");

      if (res.data?.success && res.data.data) {
        setUser(res.data.data);
      } else {
        throw new Error("Invalid token");
      }
    } catch (err) {
      console.error("Auth refresh failed:", err);
      setUser(null);
      localStorage.removeItem("frontend_token");
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    let timer;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = payload.exp * 1000 - Date.now();

      if (expiresIn > 0) {
        timer = setTimeout(() => {
          logout();
        }, expiresIn);
      } else {
        logout();
      }
    } catch {
      logout();
    }

    return () => clearTimeout(timer);
  }, [token, logout]);


  // Initial mount: check session
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (newToken) => {
    localStorage.setItem("frontend_token", newToken);
    setToken(newToken); // 👈 trigger expiry effect
    setLoggingIn(true);
    await refreshUser(true);
    setLoggingIn(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      refreshUser, 
      loading: loading || loggingIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
