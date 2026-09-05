import React from "react";

import Herosection from "./component/herosection.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Navbar from "./component/navbar.jsx";
import Register from "./pages/register.jsx";
import ChatPage from "./pages/chatPage.jsx";

const Home = () => {
  return (
    <>
      <Navbar />
      <Herosection />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chatPage" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
