import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";

import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../Api/axios";
import OTPVerification from "./OTPVerification";

// Validation schema
const SignInSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
});

export default function SignInForm() {
    const [error, setError] = useState("");
    const [showOTP, setShowOTP] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: SignInSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const response = await axiosInstance.post("/auth/login", {
                    ...values,
                    loginFrom: "admin_portal"
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                // Check if OTP is required
                if (response.data.requiresOTP) {
                    setUserEmail(response.data.email || values.email);
                    setShowOTP(true);
                    setError("");
                } else {
                    // Old flow (if OTP not required for some reason)
                    const { token } = response.data;
                    if (token) {
                        login(token);
                        navigate("/", { replace: true });
                    }
                }
            } catch (error: any) {
                setErrors({ email: "Invalid credentials" });
                setError((error as any).response?.data?.message || "Login failed. Please try again.");
                console.error("Login error", error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleVerifyOTP = async (otp: string) => {
        const response = await axiosInstance.post("/auth/verify-otp", {
            email: userEmail,
            otp,
            loginFrom: "admin_portal"
        });

        const { token } = response.data;
        if (token) {
            await login(token);
            navigate("/", { replace: true });
        }
    };

    const handleResendOTP = async () => {
        await axiosInstance.post("/auth/login", {
            email: formik.values.email,
            password: formik.values.password,
            loginFrom: "admin_portal"
        });
    };

    const handleBackToLogin = () => {
        setShowOTP(false);
        setUserEmail("");
        setError("");
    };

    // Show OTP screen if needed
    if (showOTP) {
        return (
            <OTPVerification
                email={userEmail}
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={handleBackToLogin}
            />
        );
    }

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
                <h2 className="mb-8 text-center text-white text-lg">
                    Sign in to start your session
                </h2>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="relative">
                        <Input
                            name="email"
                            placeholder="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            touched={formik.touched.email}
                            error={!!formik.errors.email}
                            className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                        </span>
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••••••••••"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            touched={formik.touched.password}
                            error={!!formik.errors.password}
                            className="w-full pl-4 pr-10 py-3 bg-white text-gray-800 rounded"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link 
                            to="/forgot-password" 
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    {/* Sign In Button */}
                    <Button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
