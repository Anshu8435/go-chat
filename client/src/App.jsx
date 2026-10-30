import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import Herosection from "./component/herosection.jsx";
import Login from "./pages/login.jsx";
import Navbar from "./component/navbar.jsx";
import Footer from "./component/Footer.jsx";
import Register from "./pages/register.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ChatPage from "./pages/chatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { Loader2 } from "lucide-react";

const Home = () => {
  return (
    <>
      <Navbar />
      <Herosection />
      <Footer />
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center theme-shell">
        <div className="flex flex-col items-center gap-3" style={{ color: "var(--text)" }}>
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--accent-a)" }} />
          <p className="font-medium theme-muted">Loading NexusChat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center theme-shell">
        <div className="flex flex-col items-center gap-3" style={{ color: "var(--text)" }}>
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--accent-b)" }} />
          <p className="font-medium theme-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chatPage" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route path="/contact" element={<ContactPage />} />

      <Route
        path="/chatPage"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const ThemeManager = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("gochat-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <ThemeManager />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#111827",
              color: "#fff",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
