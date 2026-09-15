import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
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
        <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-main)" }}>
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--primary)" }} />
          <p className="font-medium text-sm text-[var(--text-muted)]">Loading GoChat...</p>
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
        <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-main)" }}>
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--secondary)" }} />
          <p className="font-medium text-sm text-[var(--text-muted)]">Loading...</p>
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

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: "var(--bg-card)",
                color: "var(--text-main)",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 30px -5px var(--shadow-glow)",
              },
            }}
          />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
