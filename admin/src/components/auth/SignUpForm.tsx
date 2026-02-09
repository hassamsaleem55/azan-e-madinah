import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Checkbox from "../form/input/Checkbox";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div 
      className="flex items-center justify-center min-h-screen w-full"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/admin-portal/images/carousel/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'bottom',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <img src="/admin-portal/images/logo/azan-e-madinah-logo.png" alt="Logo" className="rounded-full" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-white text-lg font-semibold">
          Sign Up
        </h2>
        <p className="mb-6 text-center text-gray-400 text-sm">
          Enter your information to create an account
        </p>
        <form className="space-y-4">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                id="fname"
                name="fname"
                placeholder="First Name"
                className="w-full pl-4 pr-4 py-3 bg-white text-gray-800 rounded"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                id="lname"
                name="lname"
                placeholder="Last Name"
                className="w-full pl-4 pr-4 py-3 bg-white text-gray-800 rounded"
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </span>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </span>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              className="w-5 h-5 mt-0.5"
              checked={isChecked}
              onChange={setIsChecked}
            />
            <p className="text-xs text-gray-400">
              By creating an account you agree to the{" "}
              <span className="text-white">Terms and Conditions</span> and{" "}
              <span className="text-white">Privacy Policy</span>
            </p>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium"
          >
            Sign Up
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
