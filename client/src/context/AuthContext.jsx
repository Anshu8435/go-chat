import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const getApiBaseUrl = () => {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalhost = host === "localhost" || host === "127.0.0.1";

  const envUrl = import.meta.env.VITE_API_URL;

  // Local development
  if (isLocalhost) {
    if (envUrl && envUrl.includes(":4501")) {
      return envUrl.replace(":4501", ":4500");
    }
    return envUrl || "http://localhost:4500";
  }

  // Production deployment (e.g., Vercel)
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }

  return "";
};

const API_BASE_URL = getApiBaseUrl();

// Configure default axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to attach token from sessionStorage
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

  const sendLoginOtp = async (email) => {
    const response = await api.post("/auth/send-login-otp", { email });
    return response.data;
  };

  const verifyLoginOtp = async (email, otp) => {
    const response = await api.post("/auth/verify-login-otp", { email, otp });
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);

    setSessionItem("token", newToken);
    setSessionItem("user", JSON.stringify(userData));

    return response.data;
  };

  const sendForgotPasswordOtp = async (email) => {
    const response = await api.post("/auth/forgot-password/send-otp", { email });
    return response.data;
  };

  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    const response = await api.post("/auth/forgot-password/reset", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  };

  const forgotPassword = async (email, otpOrNewPassword, maybeNewPassword) => {
    // If 3 arguments or 2nd is OTP, call reset with OTP
    if (maybeNewPassword !== undefined) {
      return resetPasswordWithOtp(email, otpOrNewPassword, maybeNewPassword);
    }
    // Fallback
    const response = await api.post("/auth/forgot-password", {
      email,
      newPassword: otpOrNewPassword,
    });
    return response.data;
  };

  const updateProfile = async (formData) => {
    const response = await api.put("/users/profile", formData);
    const updatedUser = response.data.user;

    setUser(updatedUser);
    setSessionItem("user", JSON.stringify(updatedUser));

    return response.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put("/users/password", {
      currentPassword,
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
        sendLoginOtp,
        verifyLoginOtp,
        sendForgotPasswordOtp,
        resetPasswordWithOtp,
        forgotPassword,
        updateProfile,
        changePassword,
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
