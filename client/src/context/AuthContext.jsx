import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:4500";

// Configure default axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to attach token from localStorage
api.interceptors.request.use((config) => {
  const token = getSessionItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getSessionItem = (key) => {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const setSessionItem = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage quota/session issues
  }
};

const removeSessionItem = (key) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    // Ignore storage quota/session issues
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = getSessionItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => getSessionItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getSessionItem("token");
      if (storedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.data?.user) {
            setUser(res.data.user);
            setSessionItem("user", JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);

    setSessionItem("token", newToken);
    setSessionItem("user", JSON.stringify(userData));

    return response.data;
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);

    setSessionItem("token", newToken);
    setSessionItem("user", JSON.stringify(userData));

    return response.data;
  };

  const forgotPassword = async (email, newPassword) => {
    const response = await api.post("/auth/forgot-password", {
      email,
      newPassword,
    });

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setUser(null);
      removeSessionItem("token");
      removeSessionItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
