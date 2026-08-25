import React from "react";
import Sideheader from "./component/sideheader.jsx";
import Herosection from "./component/herosection.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";

const Home = () => {
  return (
    <>
      <Sideheader />
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;