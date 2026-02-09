import { useState, useRef, useEffect } from "react";
import Button from "../ui/button/Button";

interface OTPVerificationProps {
    email: string;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
}

export default function OTPVerification({ email, onVerify, onResend, onBack }: OTPVerificationProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleChange = (index: number, value: string) => {
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

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) return; // Only allow digits

        const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);
        
        // Focus the last filled input or the first empty one
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
        } catch (err: any) {
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
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

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
                <h2 className="mb-2 text-center text-white text-xl font-semibold">
                    Verify Your Email
                </h2>
                <p className="mb-6 text-center text-gray-400 text-sm">
                    We've sent a 6-digit code to<br />
                    <span className="text-blue-400 font-medium">{email}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-white text-gray-800 rounded border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                        {timeLeft > 0 ? (
                            <p className="text-gray-400 text-sm">
                                Code expires in <span className="text-blue-400 font-medium">{formatTime(timeLeft)}</span>
                            </p>
                        ) : (
                            <p className="text-red-400 text-sm">Code has expired</p>
                        )}
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    {/* Verify Button */}
                    <Button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium"
                        disabled={isVerifying || timeLeft === 0}
                    >
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                    </Button>

                    {/* Resend & Back Links */}
                    <div className="flex justify-between items-center text-sm">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to login
                        </button>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending || timeLeft === 0}
                            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResending ? "Sending..." : "Resend code"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
