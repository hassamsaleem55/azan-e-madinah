import { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile } from '../../api/profileApi';
import {
    User, Mail, Phone, MapPin, Building,
    Camera, Save, Loader2, Globe, Briefcase, Lock, CheckCircle, AlertCircle, Shield, Edit3
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

const InputField = ({ icon: Icon, readOnly = false, className = '', error = '', ...props }) => (
    <div className={`relative group w-full ${className}`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#C9A536] transition-colors duration-200">
            <Icon size={18} strokeWidth={2} />
        </div>
        <input
            {...props}
            readOnly={readOnly}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-gray-900 text-sm placeholder:text-gray-400 transition-all duration-300 focus:outline-none
            ${error ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : ''}
            ${!error && !readOnly ? 'border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-[#C9A536]/30 focus:border-[#C9A536] focus:bg-white focus:shadow-lg focus:shadow-[#C9A536]/10' : ''}
            ${readOnly ? 'bg-linear-to-br from-gray-50 to-gray-100/50 text-gray-600 cursor-not-allowed border-gray-200 backdrop-blur-sm' : ''}
            ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : ''}`}
        />
        {error && <p className="text-red-600 text-xs mt-1.5 ml-1 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
);

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [info, setInfo] = useState('');
    const [warning, setWarning] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [initialFormData, setInitialFormData] = useState(null);
    const [initialLogoPreview, setInitialLogoPreview] = useState('');
    const [changedFields, setChangedFields] = useState(new Set());
    const [fieldErrors, setFieldErrors] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const fileInputRef = useRef(null);
    const { refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        city: '',
        country: '',
        consultant: '',
        address: '',
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasUnsavedChanges && !updating) {
                    handleSubmit(e);
                }
            }
        };

        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges, updating]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile();
            if (response.success) {
                const userData = response.data;
                const nextFormData = {
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    companyName: userData.companyName || '',
                    city: userData.city || '',
                    country: userData.country || '',
                    consultant: userData.consultant || '',
                    address: userData.address || '',
                };
                setFormData(nextFormData);
                setInitialFormData(nextFormData);
                if (userData.logo) {
                    setLogoPreview(userData.logo);
                    setInitialLogoPreview(userData.logo);
                } else {
                    setLogoPreview('');
                    setInitialLogoPreview('');
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Track changed fields
        if (initialFormData && value !== initialFormData[name]) {
            setChangedFields(prev => new Set([...prev, name]));
        } else {
            setChangedFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(name);
                return newSet;
            });
        }

        // Field-level validation
        const errors = { ...fieldErrors };
        if (name === 'phone') {
            if (!value) {
                errors.phone = 'Phone number is required';
            } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(value)) {
                errors.phone = 'Please enter a valid phone number';
            } else {
                delete errors.phone;
            }
        }
        if (name === 'consultant' && value && value.length < 2) {
            errors.consultant = 'Name must be at least 2 characters';
        } else if (name === 'consultant') {
            delete errors.consultant;
        }
        setFieldErrors(errors);

        // Update unsaved changes flag
        const hasChanges = Object.keys(formData).some(key => {
            const newValue = key === name ? value : formData[key];
            return initialFormData && newValue !== initialFormData[key];
        });
        setHasUnsavedChanges(hasChanges);
        
        setError('');
        setSuccess('');
        setWarning('');
    };

    const handleLogoClick = () => fileInputRef.current.click();

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setError('');
            setWarning('');
            setInfo('');
            
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError(`Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`);
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
                const fileSize = (file.size / 1024).toFixed(1);
                setInfo(`✓ Logo selected (${fileSize}KB). Press Ctrl+S or click "Save Changes" to upload.`);
                setHasUnsavedChanges(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        
        // Validate required fields
        if (!formData.phone) {
            setError('Phone number is required');
            setFieldErrors(prev => ({ ...prev, phone: 'This field is required' }));
            return;
        }

        // Check for field-level errors
        if (Object.keys(fieldErrors).length > 0) {
            setError('Please fix the errors before saving');
            return;
        }

        const formChanged = initialFormData
            ? JSON.stringify(formData) !== JSON.stringify(initialFormData)
            : true;
        const logoChanged = !!logoFile;

        if (!formChanged && !logoChanged) {
            setWarning('No changes detected. Please modify your information before saving.');
            return;
        }

        try {
            setUpdating(true);
            setError('');
            setSuccess('');
            setWarning('');
            setInfo('');

            let updatePayload = { ...formData };
            if (logoFile) {
                const formDataPayload = new FormData();
                Object.entries(updatePayload).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formDataPayload.append(key, value);
                    }
                });
                formDataPayload.append('logo', logoFile);
                updatePayload = formDataPayload;
            }

            const response = await updateUserProfile(updatePayload);

            if (response.success) {
                setLogoFile(null);
                setChangedFields(new Set());
                setHasUnsavedChanges(false);
                await refreshUser();
                await fetchUserProfile();
                setSuccess('✓ Profile updated successfully! All changes have been saved.');
                setInfo('');
                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (err) {
            const message =
                typeof err === 'string'
                    ? err
                    : err?.message || err?.error || 'Failed to update profile';
            setError(message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-linear-to-br from-blue-50/30 to-indigo-50/30 rounded-3xl">
                <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-[#C9A536] animate-spin" strokeWidth={2.5} />
                        <div className="absolute inset-0 w-12 h-12 border-4 border-[#C9A536]/20 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-gray-600 font-semibold">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#C9A536]/5 to-[#A68A2E]/5 rounded-2xl blur-3xl -z-10"></div>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold bg-linear-to-r from-[#C9A536] to-[#A68A2E] bg-clip-text text-transparent">
                            Account Settings
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Shield size={14} className="text-[#C9A536]" />
                            Manage your agency profile and contact information
                        </p>
                    </div>
                    {hasUnsavedChanges && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-amber-700">
                                {changedFields.size + (logoFile ? 1 : 0)} unsaved {changedFields.size + (logoFile ? 1 : 0) === 1 ? 'change' : 'changes'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto">

                {/* Profile Header Card - Enhanced */}
                <div className="bg-linear-to-br from-white via-[#C9A536]/5 to-[#0B0E1A]/5 rounded-3xl shadow-xl border-2 border-white/60 p-8 mb-8 backdrop-blur-sm relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#C9A536]/5 to-[#A68A2E]/5 rounded-full blur-3xl z-0"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-[#0B0E1A]/5 to-[#C9A536]/5 rounded-full blur-3xl z-0"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">

                        {/* Logo Avatar - Enhanced */}
                        <div className="relative group shrink-0">
                            {logoFile && (
                                <div className="absolute -top-2 -right-2 z-30 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-in zoom-in duration-300">
                                    New
                                </div>
                            )}
                            <div className={`w-32 h-32 rounded-2xl border-2 bg-white shadow-xl flex items-center justify-center relative overflow-hidden backdrop-blur-sm group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 ${logoFile ? 'border-amber-400 ring-4 ring-amber-100' : 'border-white/80'}`}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-3" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Building size={40} className="text-gray-300" strokeWidth={1.5} />
                                        <span className="text-xs text-gray-400 font-medium">No Logo</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogoClick}
                                className="absolute -bottom-3 -right-3 z-20 bg-linear-to-br from-[#D4AF37] to-[#B8941F] text-white p-3 rounded-full shadow-xl border-4 border-white hover:from-[#B8941F] hover:to-[#D4AF37] transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                                title="Upload Logo"
                            >
                                <Camera size={16} strokeWidth={2.5} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                        </div>

                        {/* Name & Title - Enhanced */}
                        <div className="flex-1 text-center md:text-left pt-2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                                {formData.companyName || formData.name}
                            </h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                                    <Mail size={14} className="text-[#D4AF37]" strokeWidth={2} /> 
                                    <span className="font-medium">{formData.email}</span>
                                </span>
                                {formData.city && (
                                    <span className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                                        <MapPin size={14} className="text-[#D4AF37]" strokeWidth={2} /> 
                                        <span className="font-medium">{formData.city}, {formData.country}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Desktop Save Action - Enhanced */}
                        <div className="hidden md:block shrink-0">
                            <button
                                onClick={handleSubmit}
                                disabled={updating || !hasUnsavedChanges}
                                className={`group px-8 py-4 rounded-xl text-sm font-bold flex flex-col items-center gap-1 shadow-2xl transition-all duration-300 relative overflow-hidden
                        ${updating || !hasUnsavedChanges
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                            : 'bg-linear-to-br from-[#C9A536] to-[#A68A2E] hover:from-[#A68A2E] hover:to-[#C9A536] text-white hover:shadow-[#C9A536]/40 hover:-translate-y-1 active:translate-y-0 shadow-lg shadow-[#C9A536]/30'}`}
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                    {updating ? <Loader2 size={20} className="animate-spin" strokeWidth={2.5} /> : <Save size={20} strokeWidth={2.5} />}
                                    {updating ? 'Saving...' : 'Save Changes'}
                                </div>
                                {!updating && hasUnsavedChanges && (
                                    <span className="relative z-10 text-[10px] opacity-70 font-normal">Ctrl+S</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Notifications - Enhanced */}
                    <div className="relative z-10 mt-6 space-y-3">
                        {error && (
                            <div className="flex items-center justify-between gap-3 p-4 bg-linear-to-r from-red-50 to-red-100/50 text-red-700 text-sm rounded-xl border border-red-200 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <AlertCircle size={20} className="shrink-0" strokeWidth={2.5} />
                                    <span className="font-medium">{error}</span>
                                </div>
                                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center justify-between gap-3 p-4 bg-linear-to-r from-green-50 to-emerald-100/50 text-green-700 text-sm rounded-xl border border-green-200 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={20} className="shrink-0" strokeWidth={2.5} />
                                    <span className="font-medium">{success}</span>
                                </div>
                                <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {warning && (
                            <div className="flex items-center justify-between gap-3 p-4 bg-linear-to-r from-amber-50 to-yellow-100/50 text-amber-700 text-sm rounded-xl border border-amber-200 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <AlertCircle size={20} className="shrink-0" strokeWidth={2.5} />
                                    <span className="font-medium">{warning}</span>
                                </div>
                                <button onClick={() => setWarning('')} className="text-amber-400 hover:text-amber-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {info && (
                            <div className="flex items-center justify-between gap-3 p-4 bg-linear-to-r from-blue-50 to-cyan-100/50 text-blue-700 text-sm rounded-xl border border-blue-200 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <Shield size={20} className="shrink-0" strokeWidth={2.5} />
                                    <span className="font-medium">{info}</span>
                                </div>
                                <button onClick={() => setInfo('')} className="text-blue-400 hover:text-blue-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Grid - Enhanced */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Col: Account Info (Read Only) - Enhanced */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-linear-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-200/80 p-7 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-linear-to-br from-[#C9A536] to-[#A68A2E] rounded-lg shadow-md shadow-[#C9A536]/30">
                                        <Shield size={18} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <span>Identity Verification</span>
                                </h3>
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Lock size={12} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            Registered Name
                                        </label>
                                        <InputField icon={User} type="text" value={formData.name} readOnly />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Lock size={12} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            Login Email
                                        </label>
                                        <InputField icon={Mail} type="text" value={formData.email} readOnly />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Lock size={12} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            Company Name
                                        </label>
                                        <InputField icon={Building} type="text" value={formData.companyName} readOnly />
                                    </div>
                                </div>
                                
                                {/* Info Badge */}
                                <div className="mt-6 p-4 bg-[#C9A536]/10 border-2 border-[#C9A536]/20 rounded-xl shadow-sm">
                                    <p className="text-xs text-[#0B0E1A] font-medium flex items-start gap-2">
                                        <Shield size={14} className="mt-0.5 shrink-0 text-[#C9A536]" strokeWidth={2.5} />
                                        <span>These fields are verified and cannot be modified. Contact support if changes are needed.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Operations (Editable) - Enhanced */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-linear-to-br from-white to-[#C9A536]/5 rounded-2xl shadow-lg border-2 border-gray-200/80 p-7 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 left-0 w-40 h-40 bg-linear-to-br from-[#C9A536]/5 to-transparent rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-linear-to-br from-[#C9A536] to-[#A68A2E] rounded-lg shadow-md shadow-[#C9A536]/30">
                                        <Edit3 size={18} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <span>Contact Information</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1 group">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <User size={14} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            Contact Person
                                            {changedFields.has('consultant') && (
                                                <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Modified</span>
                                            )}
                                        </label>
                                        <InputField
                                            icon={User}
                                            type="text"
                                            name="consultant"
                                            value={formData.consultant}
                                            onChange={handleInputChange}
                                            placeholder="e.g. John Doe"
                                            error={fieldErrors.consultant}
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1 group">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Phone size={14} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            Phone Number
                                            {changedFields.has('phone') && (
                                                <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Modified</span>
                                            )}
                                            <span className="text-red-500 text-xs ml-auto">*Required</span>
                                        </label>
                                        <InputField
                                            icon={Phone}
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+1 234 567 8900"
                                            required
                                            error={fieldErrors.phone}
                                        />
                                    </div>

                                    <div className="col-span-2 group">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <MapPin size={14} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            Office Address
                                            {changedFields.has('address') && (
                                                <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Modified</span>
                                            )}
                                        </label>
                                        <InputField
                                            icon={MapPin}
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Street address, Suite, Building, etc."
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1 group">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Building size={14} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            City
                                            {changedFields.has('city') && (
                                                <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Modified</span>
                                            )}
                                        </label>
                                        <InputField
                                            icon={Building}
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="e.g. New York"
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1 group">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Globe size={14} className="text-[#D4AF37]" strokeWidth={2.5} />
                                            Country
                                            {changedFields.has('country') && (
                                                <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Modified</span>
                                            )}
                                        </label>
                                        <InputField
                                            icon={Globe}
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            placeholder="e.g. United States"
                                        />
                                    </div>
                                </div>

                                {/* Help Text */}
                                <div className="mt-6 p-4 bg-[#C9A536]/10 border-2 border-[#C9A536]/20 rounded-xl shadow-sm">
                                    <p className="text-xs text-[#0B0E1A] font-medium flex items-start gap-2">
                                        <CheckCircle size={14} className="mt-0.5 shrink-0 text-[#C9A536]" strokeWidth={2.5} />
                                        <span>Keep your contact information up to date to ensure smooth communication and service delivery.</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Save Action - Enhanced & Sticky */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-50">
                            <button
                                type="submit"
                                disabled={updating || !hasUnsavedChanges}
                                className={`group w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-xl transition-all duration-300 relative overflow-hidden
                        ${updating || !hasUnsavedChanges
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                            : 'bg-linear-to-br from-[#C9A536] to-[#A68A2E] hover:from-[#A68A2E] hover:to-[#C9A536] text-white hover:shadow-[#C9A536]/40 active:scale-95 shadow-lg shadow-[#C9A536]/30'}`}
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                    {updating ? <Loader2 size={20} className="animate-spin" strokeWidth={2.5} /> : <Save size={20} strokeWidth={2.5} />}
                                    {updating ? 'Saving Changes...' : hasUnsavedChanges ? `Save ${changedFields.size + (logoFile ? 1 : 0)} Changes` : 'No Changes to Save'}
                                </div>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
