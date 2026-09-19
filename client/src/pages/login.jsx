import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginImage from "../assets/login.svg";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(loginData.email, loginData.password);
      toast.success(res.message || "Login successful!");
      navigate("/chatPage");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to login. Please check your credentials.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#232029]">
      {/* LEFT SIDE */}
      <div className="hidden w-1/2 items-center justify-center lg:flex p-12">
        <img src={LoginImage} alt="GoChat Login" className="w-[90%] max-w-lg transition-all duration-300 hover:scale-105" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-4xl bg-white p-8 sm:p-10 shadow-xl">
          {/* HEADING */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#332F3A]">
              Welcome to GoChat
            </h1>
            <p className="mt-2 text-[#635F69]">Login to your account</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#332F3A]"
              >
                Email Address
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
                  transition-all
                  focus:border-[#25D366]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#25D366]/20
                "
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#332F3A]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
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
                    pl-5
                    pr-12
                    text-[#332F3A]
                    outline-none
                    transition-all
                    focus:border-[#25D366]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-[#25D366]/20
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm font-semibold text-[#25D366] hover:underline"
                onClick={() => toast.error("Password reset functionality is under maintenance.")}
              >
                Forgot password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                h-14
                w-full
                rounded-[20px]
                bg-[#25D366]
                font-bold
                text-white
                shadow-md
                transition-all
                hover:bg-[#20bd5c]
                hover:shadow-lg
                disabled:opacity-70
                disabled:cursor-not-allowed
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
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
            <Link to="/register" className="font-bold text-[#25D366] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
