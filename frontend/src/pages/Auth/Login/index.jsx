import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { User, Mail, Lock, X, ArrowRight, Loader2, Globe } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../api/axios";
import masjidNabviVideo from "../../../assets/videos/masjid-nabvi.mp4";
import OTPVerification from "./OTPVerification";

// --- Custom Hook: Logic Extraction (Kept same) ---
const useAuthLogic = () => {
    const [loginForm, setLoginForm] = useState({ agentCode: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [autoLoginTriggered, setAutoLoginTriggered] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const prefills = {
            agentCode: params.get("agentCode") || params.get("agencyCode") || "",
            email: params.get("email") || "",
            password: params.get("password") || "",
        };
        const shouldAuto = (params.get("auto") || params.get("autoLogin")) === "true";

        if (prefills.agentCode || prefills.email) {
            setLoginForm((prev) => ({ ...prev, ...prefills }));
        }

        if (shouldAuto && prefills.agentCode && prefills.email && prefills.password && !autoLoginTriggered) {
            setAutoLoginTriggered(true);
            performLogin(prefills);
        }
    }, [autoLoginTriggered]);

    const performLogin = async (payload = loginForm) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post("/auth/login", {
                agencyCode: payload.agentCode.trim(),
                email: payload.email.trim(),
                password: payload.password,
                loginFrom: "agent-portal",
            });

            if (res.status === 200 && res.data.success) {
                // Check if OTP is required
                if (res.data.requiresOTP) {
                    setUserEmail(res.data.email || payload.email);
                    setShowOTP(true);
                    toast.success("OTP sent to your email. Please check your inbox.");
                } else {
                    // Old flow (if OTP not required for some reason)
                    const { token } = res.data;
                    login(token);
                    navigate("/", { replace: true });
                }
            }

        } catch (error) {
            const msg = error.response?.data?.message || "Login failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otp) => {
        const res = await axiosInstance.post("/auth/verify-otp", {
            email: userEmail,
            otp,
            loginFrom: "agent-portal"
        });

        if (res.data.success) {
            const { token } = res.data;
            login(token);
            toast.success("Login successful!");
            navigate("/", { replace: true });
        }
    };

    const handleResendOTP = async () => {
        await axiosInstance.post("/auth/login", {
            agencyCode: loginForm.agentCode.trim(),
            email: loginForm.email.trim(),
            password: loginForm.password,
            loginFrom: "agent-portal"
        });
        toast.success("OTP resent successfully!");
    };

    const handleBackToLogin = () => {
        setShowOTP(false);
        setUserEmail("");
    };


    const handleGoogleAuth = async (credentialResponse) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post("/auth/google-auth", {
                credential: credentialResponse.credential,
                loginFrom: "agent-portal",
            });

            if (res.data.success) {
                // Check if OTP is required
                if (res.data.requiresOTP) {
                    setUserEmail(res.data.email);
                    setShowOTP(true);
                    toast.success("OTP sent to your email. Please check your inbox.");
                } else {
                    // Old flow (if OTP not required for some reason)
                    login(res.data.token);
                    toast.success(res.data.message || "Logged in with Google!");
                    navigate("/", { replace: true });
                }
            }
        } catch (err) {
            console.error("Google auth error:", err);
            const errorMessage = err.response?.data?.message || "Google authentication failed";
            
            // Show appropriate message for inactive accounts
            if (err.response?.status === 403) {
                toast.info(errorMessage);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail.trim()) {
            toast.error("Email is required");
            return;
        }
        setForgotLoading(true);
        try {
            const res = await axiosInstance.post("/auth/forgot-password", { 
                email: forgotEmail.trim(),
                portalType: "agent-portal"  // Identity separation: Agent Portal reset
            });
            if (res.data?.success) {
                toast.success("Password reset link sent to your email.");
                setShowForgot(false);
                setForgotEmail("");
            } else {
                toast.error(res.data?.message || "Failed to send reset link");
            }
        } catch (error) {
            // Enhanced error handling for identity violations
            if (error.response?.status === 403) {
                toast.error(error.response.data.message || "Access denied. Please ensure you're using the correct portal.");
            } else {
                toast.error(error.response?.data?.message || "Failed to send reset link");
            }
        } finally {
            setForgotLoading(false);
        }
    };

    return {
        loginForm, loading, handleLoginChange, performLogin, handleGoogleAuth,
        showForgot, setShowForgot, forgotEmail, setForgotEmail,
        forgotLoading, handleForgotPassword,
        showOTP, userEmail, handleVerifyOTP, handleResendOTP, handleBackToLogin,
    };
};

// --- Sub-Components ---
const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#003366] transition-colors">
            <Icon size={18} />
        </div>
        <input
            {...props}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] text-gray-900 text-sm placeholder:text-gray-400 transition-all duration-200"
        />
    </div>
);

const ActionButton = ({ loading, text, loadingText, onClick, type = "submit" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={loading}
        className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#003366] hover:bg-[#002855] text-white"}`}
    >
        {loading ? (
            <>
                <Loader2 size={18} className="animate-spin" />
                {loadingText}
            </>
        ) : (
            <>
                {text}
                {!loading && <ArrowRight size={18} />}
            </>
        )}
    </button>
);

// --- Main Component ---
const Login = () => {
    const {
        loginForm, loading, handleLoginChange, performLogin, handleGoogleAuth,
        showForgot, setShowForgot, forgotEmail, setForgotEmail,
        forgotLoading, handleForgotPassword,
        showOTP, userEmail, handleVerifyOTP, handleResendOTP, handleBackToLogin,
    } = useAuthLogic();

    // Show OTP screen if needed
    if (showOTP) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <video 
                    className="absolute inset-0 w-full h-full object-cover brightness-75" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    src={masjidNabviVideo}
                    onLoadedMetadata={(e) => e.target.playbackRate = 0.75}
                />
                <div className="relative z-10 w-full max-w-6xl px-6 grid lg:grid-cols-2 gap-8">
                    <div className="hidden lg:flex flex-col justify-center text-white space-y-6">
                        <h1 className="text-5xl font-bold leading-tight">
                            Welcome to<br />Rihla Access
                        </h1>
                        <p className="text-xl text-blue-100">
                            Your trusted partner for pilgrimage services
                        </p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                        <OTPVerification
                            email={userEmail}
                            onVerify={handleVerifyOTP}
                            onResend={handleResendOTP}
                            onBack={handleBackToLogin}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        // REMOVED <Header /> here because it's provided by Frontend.jsx
        // <div className="min-h-screen relative flex items-center justify-center bg-[#003366]">
        <div className="min-h-screen relative flex items-center justify-center">
            <video 
                className="absolute inset-0 w-full h-full object-cover brightness-75" 
                autoPlay 
                muted 
                loop 
                playsInline
                src={masjidNabviVideo}
                onLoadedMetadata={(e) => e.target.playbackRate = 0.75}
            />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#003366] mb-4 shadow-sm">
                            <Globe size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Access your Rihla travel dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={(e) => { e.preventDefault(); performLogin(); }} className="space-y-4" autoComplete="off">
                        <div className="space-y-4">
                            <InputField
                                icon={User}
                                type="text"
                                name="agentCode"
                                placeholder="Agent Code"
                                value={loginForm.agentCode}
                                onChange={handleLoginChange}
                                required
                            />

                            <InputField
                                icon={Mail}
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={loginForm.email}
                                onChange={handleLoginChange}
                                required
                            />

                            <div>
                                <InputField
                                    icon={Lock}
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={loginForm.password}
                                    onChange={handleLoginChange}
                                    required
                                />
                                <div className="text-right mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgot(true)}
                                        className="text-xs font-semibold text-gray-500 hover:text-[#003366] transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <ActionButton
                                loading={loading}
                                text="Sign In"
                                loadingText="Authenticating..."
                            />
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleAuth}
                                    onError={() => toast.error("Google authentication failed")}
                                    theme="outline"
                                    size="large"
                                    text="signin_with"
                                    shape="pill"
                                />

                            </div>

                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link to="/auth/register" className="text-[#003366] font-bold hover:underline">
                            Sign up now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowForgot(false)}
                    />

                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 transform transition-all scale-100">
                        <button
                            onClick={() => setShowForgot(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6 text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#003366] mb-3 mx-auto">
                                <Mail size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                            <p className="text-gray-500 text-sm mt-1 px-4">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <InputField
                                icon={Mail}
                                type="email"
                                placeholder="Enter your email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                autoFocus
                                required
                            />

                            <ActionButton
                                loading={forgotLoading}
                                text="Send Reset Link"
                                loadingText="Sending..."
                            />
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;