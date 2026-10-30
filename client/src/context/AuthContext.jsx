import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const getStoredItem = (key) => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStoredItem = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage quota errors
  }
};

const removeStoredItem = (key) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage quota errors
  }
};

const getApiBaseUrl = () => {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const envUrl = import.meta.env.VITE_API_URL;

  if (isLocalhost) {
    if (envUrl && envUrl.includes(":4501")) return envUrl.replace(":4501", ":4500");
    return envUrl || "http://localhost:4500";
  }
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) return envUrl;
  return "";
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/verify-login-otp");

      if (!isAuthEndpoint) {
        removeStoredItem("token");
        removeStoredItem("user");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = getStoredItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => getStoredItem("token") || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    }
    setToken(null);
    setUser(null);
    removeStoredItem("token");
    removeStoredItem("user");
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getStoredItem("token");
      if (storedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.data?.user) {
            setUser(res.data.user);
            setStoredItem("user", JSON.stringify(res.data.user));
          }
        } catch {
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, [logout]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    setStoredItem("token", newToken);
    setStoredItem("user", JSON.stringify(userData));
    return response.data;
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    setStoredItem("token", newToken);
    setStoredItem("user", JSON.stringify(userData));
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
    setStoredItem("token", newToken);
    setStoredItem("user", JSON.stringify(userData));
    return response.data;
  };

  const sendForgotPasswordOtp = async (email) => {
    const response = await api.post("/auth/forgot-password/send-otp", { email });
    return response.data;
  };

  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    const response = await api.post("/auth/forgot-password/reset", { email, otp, newPassword });
    return response.data;
  };

  const forgotPassword = async (email, otpOrNewPassword, maybeNewPassword) => {
    if (maybeNewPassword !== undefined) {
      return resetPasswordWithOtp(email, otpOrNewPassword, maybeNewPassword);
    }
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
    setStoredItem("user", JSON.stringify(updatedUser));
    return response.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put("/users/password", { currentPassword, newPassword });
    return response.data;
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
