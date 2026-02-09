import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { User, Mail, Phone, MapPin, Building, Globe, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
// import loginBgImg from "../../../assets/images/login-background.avif";
import axiosInstance from "../../../api/axios";
import countryCodes from "../../../data/countryCodes.json";
import Select from "react-select";
// import Header from "../../../components/Header"; // REMOVED: This was the duplicate
import CommonSections from "../../../components/CommonSections";
import masjidNabviVideo from "../../../assets/videos/masjid-nabvi.mp4";
import OTPVerification from "../Login/OTPVerification";
import { validateEmail, validateName, validatePhone, validateCompanyName, validateRequired } from "../../../utils/validation";

// Move InputField outside to prevent re-creation on every render
const InputField = ({ icon: Icon, error, ...props }) => (
    <div className="relative group w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#003366] transition-colors">
            <Icon size={18} />
        </div>
        <input
            {...props}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-[#003366]/20 focus:border-[#003366]'} bg-white focus:bg-white focus:outline-none focus:ring-2 text-gray-900 text-sm placeholder:text-gray-400 transition-all duration-200`}
        />
        {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
);

const Register = () => {
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", countryCode: "", address: "", city: "", role: "Agency", companyName: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

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
                    toast.success(res.data.message || "Registered with Google!");
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

    const handleVerifyOTP = async (otp) => {
        const res = await axiosInstance.post("/auth/verify-otp", {
            email: userEmail,
            otp,
            loginFrom: "agent-portal"
        });

        if (res.data.success) {
            const { token } = res.data;
            login(token);
            toast.success("Registration successful!");
            navigate("/", { replace: true });
        }
    };

    const handleResendOTP = async () => {
        // For Google auth, we need to re-authenticate
        // This is tricky - we can just send a message
        toast.info("Please click 'Sign in with Google' again to resend OTP");
        setShowOTP(false);
        setUserEmail("");
    };

    const handleBackToRegister = () => {
        setShowOTP(false);
        setUserEmail("");
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate company name
        const companyError = validateCompanyName(formData.companyName);
        if (companyError) newErrors.companyName = companyError;
        
        // Validate name
        const nameError = validateName(formData.name);
        if (nameError) newErrors.name = nameError;
        
        // Validate email
        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;
        
        // Validate phone
        const phoneError = validatePhone(formData.phone);
        if (phoneError) newErrors.phone = phoneError;
        
        // Validate country code
        if (!formData.countryCode) {
            newErrors.countryCode = 'Country code is required';
        }
        
        // Validate city (optional but if provided, check length)
        if (formData.city && formData.city.length > 100) {
            newErrors.city = 'City name must not exceed 100 characters';
        }
        
        // Validate address (optional but if provided, check length)
        if (formData.address && formData.address.length > 500) {
            newErrors.address = 'Address must not exceed 500 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            const firstError = Object.values(errors)[0] || 'Please fix the errors in the form';
            toast.error(firstError);
            return;
        }
        
        setLoading(true);

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                companyName: formData.companyName.trim(),
                phone: `${formData.countryCode || ""}${formData.phone.trim()}`.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                role: "Agency",
                registrationFrom: "agent-portal",
            };
            const res = await axiosInstance.post("/auth/register", payload);

            if (res.status === 201 || res.status === 200) {
                toast.success("Registration successful! Check your email for login credentials.");
                // Delay navigation to allow toast to display
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const options = countryCodes.map((c) => ({
        value: `+${c.code}`,
        label: `${String.fromCodePoint(...[...c.iso].map((ch) => 127397 + ch.charCodeAt()))} ${c.country} (+${c.code})`,
    }));

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 46, height: 46, backgroundColor: "#fff",
            borderColor: state.isFocused ? "#003366" : "#e5e7eb",
            borderRadius: "0.75rem", boxShadow: "none", paddingLeft: "2px",
            '&:hover': { borderColor: state.isFocused ? "#003366" : "#d1d5db" },
        }),
        placeholder: (base) => ({ ...base, color: "#9ca3af", fontSize: "0.875rem" }),
        singleValue: (base) => ({ ...base, color: "#111827", fontSize: "0.875rem" }),
        menu: (base) => ({ ...base, zIndex: 50, borderRadius: "0.75rem", overflow: "hidden" }),
    };

    const selectedOption = options.find((opt) => opt.value === formData.countryCode);

    // Show OTP screen if needed
    if (showOTP) {
        return (
            <div className="min-h-screen relative flex items-center justify-center overflow-hidden pt-32 pb-20">
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
                            Complete your registration with OTP verification
                        </p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                        <OTPVerification
                            email={userEmail}
                            onVerify={handleVerifyOTP}
                            onResend={handleResendOTP}
                            onBack={handleBackToRegister}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* REMOVED <Header /> here because it's provided by Frontend.jsx */}
            <div className="min-h-screen relative flex items-center justify-center  overflow-hidden pt-32 pb-20">

                {/* --- Background Image & Overlay --- */}
                <video
                    className="absolute inset-0 w-full h-full object-cover brightness-75"
                    autoPlay
                    muted
                    loop
                    playsInline
                    src={masjidNabviVideo}
                    onLoadedMetadata={(e) => e.target.playbackRate = 0.75}
                />

                {/* --- Registration Card --- */}
                <div className="relative z-10 w-full max-w-2xl px-6 animate-in fade-in zoom-in duration-500">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">

                        <div className="mb-8 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner With Us</h1>
                            <p className="text-gray-500 text-sm">
                                Already have an agency account?{" "}
                                <Link to="/" className="text-[#003366] font-bold hover:underline decoration-2 underline-offset-2">
                                    Log in here
                                </Link>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        icon={Building} type="text" name="companyName" placeholder="Agency Name"
                                        value={formData.companyName} onChange={handleChange} required
                                        error={errors.companyName}
                                    />
                                    <InputField
                                        icon={User} type="text" name="name" placeholder="Contact Person Name"
                                        value={formData.name} onChange={handleChange} required
                                        error={errors.name}
                                    />
                                </div>

                                <InputField
                                    icon={Mail} type="email" name="email" placeholder="Business Email Address"
                                    value={formData.email} onChange={handleChange} required
                                    error={errors.email}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <Select
                                            options={options} value={selectedOption}
                                            onChange={(selected) => {
                                                handleChange({ target: { name: "countryCode", value: selected.value } });
                                                if (errors.countryCode) {
                                                    setErrors((prev) => ({ ...prev, countryCode: '' }));
                                                }
                                            }}
                                            classNamePrefix="country-select" placeholder="Code" styles={selectStyles} isSearchable
                                        />
                                        {errors.countryCode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.countryCode}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField
                                            icon={Phone} type="text" name="phone" placeholder="Mobile Number"
                                            value={formData.phone} onChange={handleChange} required
                                            error={errors.phone}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        icon={MapPin} type="text" name="address" placeholder="Full Address"
                                        value={formData.address} onChange={handleChange}
                                        error={errors.address}
                                    />
                                    <InputField
                                        icon={Globe} type="text" name="city" placeholder="City"
                                        value={formData.city} onChange={handleChange}
                                        error={errors.city}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-linear-to-r from-[#003366] to-blue-600 hover:from-[#002855] hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <> <Loader2 size={18} className="animate-spin" /> Creating Account... </>
                                        ) : (
                                            <> Sign Up <ArrowRight size={18} /> </>
                                        )}
                                    </button>
                                </div>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-gray-400">Or continue with</span>
                                    </div>
                                </div>
                                <GoogleLogin
                                    onSuccess={handleGoogleAuth}
                                    onError={() => toast.error("Google authentication failed")}
                                    theme="outline"
                                    size="large"
                                    text="signin_with"
                                    shape="pill"
                                />

                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <CommonSections />
        </>
    );
};

export default Register;