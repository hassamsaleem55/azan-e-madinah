import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2, Globe } from "lucide-react";

export default function OTPVerification({ email, onVerify, onResend, onBack }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only the last digit
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) return; // Only allow digits

        const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);
        
        // Focus the last filled input or the first empty one
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            await onVerify(otpString);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError("");
        
        try {
            await onResend();
            setOtp(["", "", "", "", "", ""]);
            setTimeLeft(600); // Reset timer
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-8">
            <div className="w-full max-w-md space-y-8 animate-fadeIn">
                {/* Logo */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-[#C9A536] to-[#E6C35C] shadow-lg mb-4">
                        <Globe size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                    <p className="text-gray-600">
                        We've sent a 6-digit code to<br />
                        <span className="font-semibold text-[#C9A536]">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-[#C9A536] focus:outline-none focus:ring-2 focus:ring-[#C9A536]/20 transition-all"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                        {timeLeft > 0 ? (
                            <p className="text-sm text-gray-600">
                                Code expires in <span className="font-semibold text-[#C9A536]">{formatTime(timeLeft)}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-red-500 font-semibold">Code has expired</p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={isVerifying || timeLeft === 0}
                        className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-200
                        ${isVerifying || timeLeft === 0 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-linear-to-r from-[#C9A536] to-[#E6C35C] hover:shadow-[0_0_20px_rgba(201,165,54,0.4)] text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        }`}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify OTP"
                        )}
                    </button>

                    {/* Resend & Back Links */}
                    <div className="flex justify-between items-center text-sm">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-1 text-gray-600 hover:text-[#C9A536] transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to login
                        </button>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending || timeLeft === 0}
                            className="text-[#C9A536] hover:text-[#A68A2E] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResending ? "Sending..." : "Resend code"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
