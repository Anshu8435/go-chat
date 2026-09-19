import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginImage from "../assets/login.svg";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password, confirmPassword } = registerData;

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register({
        fullName,
        email,
        password,
      });
      toast.success(res.message || "Account created successfully!");
      navigate("/chatPage");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create account. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#232029]">
      {/* LEFT SIDE */}
      <div className="hidden w-1/2 items-center justify-center lg:flex p-12">
        <img
          src={LoginImage}
          alt="GoChat Register"
          className="w-[90%] max-w-lg transition-all duration-300 hover:scale-105"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md rounded-4xl bg-white p-8 sm:p-10 shadow-xl">
          {/* HEADING */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#332F3A]">Create Account</h1>
            <p className="mt-2 text-[#635F69]">Register to start chatting on GoChat</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FULL NAME */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-semibold text-[#332F3A]"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={registerData.fullName}
                onChange={handleChange}
                required
                className="
                  h-12
                  w-full
                  rounded-[16px]
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

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-[#332F3A]"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={handleChange}
                required
                className="
                  h-12
                  w-full
                  rounded-[16px]
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
                className="mb-1.5 block text-sm font-semibold text-[#332F3A]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password (min 6 characters)"
                  value={registerData.password}
                  onChange={handleChange}
                  required
                  className="
                    h-12
                    w-full
                    rounded-[16px]
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-semibold text-[#332F3A]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={registerData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="
                    h-12
                    w-full
                    rounded-[16px]
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                mt-2
                h-13
                w-full
                rounded-[16px]
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
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#DDD8E5]" />
            <span className="text-xs text-[#635F69]">OR</span>
            <div className="h-px flex-1 bg-[#DDD8E5]" />
          </div>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-[#635F69]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#25D366] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
