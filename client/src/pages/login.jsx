import React, { useState } from "react";
import LoginImage from "../assets/login.svg";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login Data:", loginData);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#232029]">
      {/* LEFT SIDE */}
      <div className="hidden w-1/2 items-center justify-center lg:flex">
        <img src={LoginImage} alt="GoChat Login" className="w-[90%]" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-[420px] rounded-[32px] bg-white p-8 shadow-md">
          {/* HEADING */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#332F3A]">
              Welcome to GoChat
            </h1>

            <p className="mt-2 text-[#635F69]">Login to your account</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#332F3A]"
              >
                Email
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleChange}
                required
                className="
                  h-14
                  w-full
                  rounded-[20px]
                  border
                  border-[#DDD8E5]
                  bg-[#F8F6FA]
                  px-5
                  text-[#332F3A]
                  outline-none
                  focus:border-[#25D366]
                "
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-3">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#332F3A]"
              >
                Password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleChange}
                required
                className="
                  h-14
                  w-full
                  rounded-[20px]
                  border
                  border-[#DDD8E5]
                  bg-[#F8F6FA]
                  px-5
                  text-[#332F3A]
                  outline-none
                  focus:border-[#25D366]
                "
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="mb-6 text-right">
              <button
                type="button"
                className="text-sm font-semibold text-[#25D366]"
              >
                Forgot password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="
                h-14
                w-full
                rounded-[20px]
                bg-[#25D366]
                font-bold
                text-white
                hover:bg-[#20bd5c]
              "
            >
              Login
            </button>
          </form>

          {/* DIVIDER */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#DDD8E5]" />

            <span className="text-sm text-[#635F69]">OR</span>

            <div className="h-px flex-1 bg-[#DDD8E5]" />
          </div>

          {/* CREATE ACCOUNT */}
          <p className="text-center text-sm text-[#635F69]">
            Don't have an account?{" "}
            <button type="button" className="font-bold text-[#25D366]">
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
