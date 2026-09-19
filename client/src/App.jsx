import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Herosection from "./component/herosection.jsx";
import Login from "./pages/login.jsx";
import Navbar from "./component/navbar.jsx";
import Register from "./pages/register.jsx";
import ChatPage from "./pages/chatPage.jsx";
import { Loader2 } from "lucide-react";

const Home = () => {
  return (
    <>
      <Navbar />
      <Herosection />
    </>
  );
};

// Protected Route Component for pages requiring authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#232029]">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="w-10 h-10 animate-spin text-[#25D366]" />
          <p className="font-medium text-gray-300">Loading GoChat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Only Route Component for Login/Register (redirects to Chat if already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#232029]">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="w-10 h-10 animate-spin text-[#25D366]" />
          <p className="font-medium text-gray-300">Loading...</p>
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
      {/* Home Page */}
      <Route path="/" element={<Home />} />

      {/* Auth Pages (Public Only) */}
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

      {/* Protected Chat Page */}
      <Route
        path="/chatPage"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#332F3A",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
