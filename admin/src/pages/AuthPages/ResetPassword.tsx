import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../Api/axios";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { toast } from "react-toastify";

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const uid = searchParams.get("userId");
    
    if (token && uid) {
      setResetToken(token);
      setUserId(uid);
    } else {
      toast.error("Invalid reset link");
      navigate("/signin");
    }
  }, [searchParams, navigate]);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      if (!resetToken || !userId) {
        toast.error("Invalid reset link");
        return;
      }

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
          formik.resetForm();
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
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <img src="/admin-portal/images/logo/rihla_logo.png" alt="Logo" className="rounded-full" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-white text-lg font-semibold">
          Reset Password
        </h2>
        <p className="mb-6 text-center text-gray-400 text-sm">
          Enter your new password below
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </button>
          </div>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-red-400 text-sm">
              {formik.errors.newPassword}
            </p>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-400 text-sm">
              {formik.errors.confirmPassword}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium"
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
