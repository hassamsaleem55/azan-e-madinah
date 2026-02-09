import { useState, useCallback } from "react";
import axiosInstance from "../../api/axios";
import { Lock, Eye, EyeOff, Save, Loader2, KeyRound, ShieldCheck, CheckCircle, AlertCircle, X } from "lucide-react";

const PasswordInput = ({ id, label, value, show, onToggle, error, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      <Lock size={14} className="text-[#C9A536]" />
      {label}
    </label>
    <div className="relative group">
      <input
        type={show ? "text" : "password"}
        name={id}
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full pl-4 pr-12 py-3.5 rounded-xl border-2 text-gray-900 text-sm placeholder:text-gray-400 transition-all duration-300 focus:outline-none
          ${error ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-[#C9A536]/10 focus:border-[#C9A536] focus:bg-white shadow-sm'}`}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A536] focus:outline-none transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && (
      <p className="text-red-600 text-xs mt-1.5 ml-1 font-medium animate-in fade-in slide-in-from-top-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
);

const ChangePassword = () => {
  const [formData, setFormData] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    retypePassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ 
    current: false, 
    new: false, 
    retype: false 
  });
  const [error, setError] = useState('');   
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });

  const calculatePasswordStrength = (password) => {
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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Real-time validation
    const errors = { ...fieldErrors };
    let newStrength = passwordStrength;
    
    if (name === 'currentPassword') {
      if (!value) {
        errors.currentPassword = 'Current password is required';
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
      
      // Calculate password strength
      newStrength = calculatePasswordStrength(value);

      // Check if retype matches
      if (formData.retypePassword && value !== formData.retypePassword) {
        errors.retypePassword = 'Passwords do not match';
      } else if (formData.retypePassword) {
        delete errors.retypePassword;
      }
    }

    if (name === 'retypePassword') {
      if (!value) {
        errors.retypePassword = 'Please confirm your password';
      } else if (value !== formData.newPassword) {
        errors.retypePassword = 'Passwords do not match';
      } else {
        delete errors.retypePassword;
      }
    }

    // Batch all state updates together
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(errors);
    if (name === 'newPassword') {
      setPasswordStrength(newStrength);
    }
    if (error) setError('');
    if (success) setSuccess('');
  }, [formData.currentPassword, formData.newPassword, formData.retypePassword, fieldErrors, passwordStrength, error, success]);

  const toggleVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!formData.newPassword) errors.newPassword = 'New password is required';
    if (formData.newPassword && formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.retypePassword) errors.retypePassword = 'Please confirm your password';
    if (formData.newPassword !== formData.retypePassword) {
      errors.retypePassword = 'Passwords do not match';
    }
    if (formData.newPassword === formData.currentPassword) {
      errors.newPassword = 'New password must be different from current';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.post("/auth/change-password", { 
        currentPassword: formData.currentPassword, 
        newPassword: formData.newPassword 
      });
      
      if (res.data.success) {
        setSuccess('✓ Password updated successfully!');
        setFormData({ currentPassword: "", newPassword: "", retypePassword: "" });
        setShowPasswords({ current: false, new: false, retype: false });
        setFieldErrors({});
        setPasswordStrength({ score: 0, text: '' });
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    return colors[Math.min(passwordStrength.score - 1, 4)] || 'bg-gray-300';
  };

  return (
    <div className="w-full pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-linear-to-r from-[#C9A536]/5 to-[#A68A2E]/5 rounded-2xl blur-3xl -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-linear-to-br from-[#C9A536] to-[#A68A2E] rounded-2xl flex items-center justify-center shadow-lg shadow-[#C9A536]/30">
            <KeyRound size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-[#C9A536] to-[#A68A2E] bg-clip-text text-transparent">
              Change Password
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <ShieldCheck size={14} className="text-[#C9A536]" />
              Secure your account with a strong password
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-3 p-4 bg-linear-to-r from-red-50 to-red-100/50 text-red-700 text-sm rounded-xl border border-red-200 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" strokeWidth={2.5} />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center justify-between gap-3 p-4 bg-linear-to-r from-green-50 to-emerald-100/50 text-green-700 text-sm rounded-xl border border-green-200 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="shrink-0" strokeWidth={2.5} />
              <span className="font-medium">{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-linear-to-br from-white via-[#C9A536]/5 to-[#E6C35C]/5 rounded-3xl shadow-xl border-2 border-white/60 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#C9A536]/5 to-[#A68A2E]/5 rounded-full blur-3xl z-0"></div>
          
          <div className="relative z-10 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PasswordInput 
                id="currentPassword" 
                label="Current Password" 
                value={formData.currentPassword} 
                show={showPasswords.current} 
                onToggle={() => toggleVisibility('current')}
                error={fieldErrors.currentPassword}
                onChange={handleChange}
              />
              
              <div className="pt-4 border-t border-gray-200"></div>

              <PasswordInput 
                id="newPassword" 
                label="New Password" 
                value={formData.newPassword} 
                show={showPasswords.new} 
                onToggle={() => toggleVisibility('new')}
                error={fieldErrors.newPassword}
                onChange={handleChange}
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Password Strength:</span>
                    <span className={`font-bold ${passwordStrength.score >= 3 ? 'text-green-600' : passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <PasswordInput 
                id="retypePassword" 
                label="Confirm New Password" 
                value={formData.retypePassword} 
                show={showPasswords.retype} 
                onToggle={() => toggleVisibility('retype')}
                error={fieldErrors.retypePassword}
                onChange={handleChange}
              />

              {/* Requirements */}
              <div className="bg-[#C9A536]/10 rounded-xl p-5 border-2 border-[#C9A536]/20 shadow-sm">
                <h4 className="text-xs font-bold text-[#C9A536] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} /> Password Requirements
                </h4>
                <ul className="space-y-2">
                  {[
                    { met: formData.newPassword.length >= 6, text: 'At least 6 characters long' },
                    { met: formData.newPassword && formData.newPassword !== formData.currentPassword, text: 'Different from current password' },
                    { met: formData.newPassword && formData.retypePassword && formData.newPassword === formData.retypePassword, text: 'Both new passwords match' }
                  ].map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {req.met ? <CheckCircle size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>}
                      </div>
                      <span className={req.met ? 'text-green-700 font-medium' : 'text-gray-600'}>{req.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || Object.keys(fieldErrors).length > 0}
                className={`group w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 relative overflow-hidden
                  ${loading || Object.keys(fieldErrors).length > 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                    : 'bg-linear-to-br from-[#C9A536] to-[#A68A2E] hover:from-[#A68A2E] hover:to-[#C9A536] text-white hover:shadow-[#C9A536]/40 hover:-translate-y-1 active:translate-y-0'}`}
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative z-10 flex items-center gap-3">
                  {loading ? <Loader2 size={20} className="animate-spin" strokeWidth={2.5} /> : <Save size={20} strokeWidth={2.5} />}
                  {loading ? 'Updating Password...' : 'Update Password'}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
