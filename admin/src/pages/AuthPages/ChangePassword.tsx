import { useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../Api/axios";
import { Lock, Eye, EyeOff, Save, Loader2, KeyRound, ShieldCheck, CheckCircle, AlertCircle, X, ArrowLeft } from "lucide-react";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return { score: 0, text: '' };
    
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, text: strengthLevels[Math.min(score - 1, 4)] || 'Very Weak' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');

    // Real-time validation
    const errors: any = { ...fieldErrors };
    
    if (name === 'currentPassword') {
      if (!value) {
        errors.currentPassword = 'Current password is required';
      } else if (value.length < 6) {
        errors.currentPassword = 'Must be at least 6 characters';
      } else {
        delete errors.currentPassword;
      }
    }

    if (name === 'newPassword') {
      if (!value) {
        errors.newPassword = 'New password is required';
      } else if (value.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      } else if (value === formData.currentPassword) {
        errors.newPassword = 'New password must be different from current';
      } else {
        delete errors.newPassword;
      }
      
      setPasswordStrength(calculatePasswordStrength(value));

      if (formData.confirmPassword && value !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      } else if (formData.confirmPassword) {
        delete errors.confirmPassword;
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (value !== formData.newPassword) {
        errors.confirmPassword = 'Passwords do not match';
      } else {
        delete errors.confirmPassword;
      }
    }

    setFieldErrors(errors);
  };

  const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors: any = {};
    if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
    if (formData.currentPassword && formData.currentPassword.length < 6) {
      errors.currentPassword = 'Must be at least 6 characters';
    }
    if (!formData.newPassword) errors.newPassword = 'New password is required';
    if (formData.newPassword && formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (formData.newPassword === formData.currentPassword) {
      errors.newPassword = 'New password must be different from current';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors before submitting');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await axiosInstance.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        setSuccess('✓ Password changed successfully! Redirecting...');
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setFieldErrors({});
        setPasswordStrength({ score: 0, text: '' });
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to change password. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordInput = ({ id, label, value, show, onToggle, error }: any) => (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-sm font-medium text-white flex items-center gap-2">
        <Lock size={14} className="text-purple-400" />
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={id}
          id={id}
          value={value}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-transparent py-3.5 pl-4 pr-12 text-white outline-none transition focus:border-purple-500 
            ${error ? 'border-red-500 bg-red-500/10' : 'border-stroke dark:border-strokedark'}`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    return colors[Math.min(passwordStrength.score - 1, 4)] || 'bg-gray-600';
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="border-b border-stroke dark:border-strokedark bg-linear-to-r from-purple-500/10 to-blue-500/10 px-7 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-blue-500 shadow-lg">
              <KeyRound className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Change Password
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <ShieldCheck size={14} className="text-purple-500" />
                Update your account security credentials
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Profile</span>
          </button>
        </div>
      </div>

      <div className="p-7">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-red-500 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-500" strokeWidth={2.5} />
              <span className="text-sm font-medium text-red-400">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-green-500 bg-green-500/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="shrink-0 text-green-500" strokeWidth={2.5} />
              <span className="text-sm font-medium text-green-400">{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-300 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordInput
            id="currentPassword"
            label="Current Password"
            value={formData.currentPassword}
            show={showPasswords.current}
            onToggle={() => toggleVisibility('current')}
            error={fieldErrors.currentPassword}
          />

          <div className="border-t border-stroke dark:border-strokedark"></div>

          <PasswordInput
            id="newPassword"
            label="New Password"
            value={formData.newPassword}
            show={showPasswords.new}
            onToggle={() => toggleVisibility('new')}
            error={fieldErrors.newPassword}
          />

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Password Strength:</span>
                <span className={`font-bold ${passwordStrength.score >= 3 ? 'text-green-400' : passwordStrength.score >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            value={formData.confirmPassword}
            show={showPasswords.confirm}
            onToggle={() => toggleVisibility('confirm')}
            error={fieldErrors.confirmPassword}
          />

          {/* Requirements */}
          <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-5">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-purple-400 flex items-center gap-2">
              <ShieldCheck size={16} /> Password Requirements
            </h4>
            <ul className="space-y-2">
              {[
                { met: formData.newPassword.length >= 6, text: 'At least 6 characters long' },
                { met: formData.newPassword && formData.newPassword !== formData.currentPassword, text: 'Different from current password' },
                { met: formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword, text: 'Both new passwords match' }
              ].map((req, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full ${req.met ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                    {req.met ? <CheckCircle size={12} strokeWidth={3} /> : <div className="h-1.5 w-1.5 rounded-full bg-gray-500"></div>}
                  </div>
                  <span className={req.met ? 'text-green-400 font-medium' : 'text-gray-400'}>{req.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading || Object.keys(fieldErrors).length > 0}
            className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-lg py-4 text-sm font-bold shadow-lg transition-all duration-300
              ${isLoading || Object.keys(fieldErrors).length > 0
                ? 'cursor-not-allowed bg-gray-600 text-gray-400' 
                : 'bg-linear-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center gap-3">
              {isLoading ? <Loader2 size={20} className="animate-spin" strokeWidth={2.5} /> : <Save size={20} strokeWidth={2.5} />}
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
