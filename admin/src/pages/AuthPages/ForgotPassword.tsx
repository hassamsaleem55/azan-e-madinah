import { useState } from "react";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../Api/axios";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { toast } from "react-toastify";

// Step 1: Request reset
const RequestResetSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

// Step 2: Reset password
const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [resetToken, setResetToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Request Password Reset
  const requestFormik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: RequestResetSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.post("/auth/forgot-password", {
          email: values.email,
          portalType: "admin_portal",  // Identity separation: Admin Panel reset
        });

        if (response.data.success) {
          setResetToken(response.data.resetToken);
          setUserId(response.data.userId);
          setUserEmail(values.email);
          toast.success("Reset link sent! Check your email or proceed below.");
          setStep("reset");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Failed to request password reset. Please try again.";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Step 2: Reset Password
  const resetFormik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.post("/auth/reset-password", {
          resetToken,
          userId,
          newPassword: values.newPassword,
          portalType: "admin_portal",  // Identity separation: Admin Panel reset
        });

        if (response.data.success) {
          toast.success("Password reset successfully! Redirecting to login...");
          resetFormik.resetForm();
          setTimeout(() => {
            navigate("/signin", { replace: true });
          }, 2000);
        }
      } catch (error: any) {
        // Enhanced error handling for identity violations
        const message = error.response?.status === 403
          ? (error.response.data.message || "Access denied. Please ensure you're using the correct portal.")
          : (error.response?.data?.message || "Failed to reset password. Please try again.");
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
  });

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
        {step === "request" ? (
          <>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <img src="/admin-portal/images/logo/azan-e-madinah-logo.png" alt="Logo" className="rounded-full" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-white text-lg font-semibold">
              Forgot Password?
            </h2>
            <p className="mb-6 text-center text-gray-400 text-sm">
              Enter your email to receive reset instructions
            </p>

            <form onSubmit={requestFormik.handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Input
                  name="email"
                  placeholder="Email"
                  value={requestFormik.values.email}
                  onChange={requestFormik.handleChange}
                  onBlur={requestFormik.handleBlur}
                  touched={requestFormik.touched.email}
                  error={!!requestFormik.errors.email}
                  className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
              </div>

              {/* Send Reset Link Button */}
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              {/* Back to Sign In */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/signin")}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-white text-lg font-semibold">
              Reset Password
            </h2>
            <p className="mb-6 text-center text-gray-400 text-sm">
              Enter your new password for <span className="text-blue-400">{userEmail}</span>
            </p>

            <form onSubmit={resetFormik.handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="relative">
                <Input
                  name="newPassword"
                  type="password"
                  placeholder="New Password"
                  value={resetFormik.values.newPassword}
                  onChange={resetFormik.handleChange}
                  onBlur={resetFormik.handleBlur}
                  touched={resetFormik.touched.newPassword}
                  error={!!resetFormik.errors.newPassword}
                  className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={resetFormik.values.confirmPassword}
                  onChange={resetFormik.handleChange}
                  onBlur={resetFormik.handleBlur}
                  touched={resetFormik.touched.confirmPassword}
                  error={!!resetFormik.errors.confirmPassword}
                  className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              {/* Back to Email */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    requestFormik.resetForm();
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Back to Email
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
