import { useState, useEffect } from 'react';
import { X, Shield, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';

interface Role {
  _id: string;
  name: string;
  description: string;
}

interface UserFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const UserForm = ({ onClose, onSuccess, editId }: UserFormProps) => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: [] as string[]
    });

    useEffect(() => {
        fetchRoles();
        if (editId) {
            fetchUser();
        }
    }, [editId]);

    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get('/roles');
            if (res.data.success) {
                setRoles(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch roles');
        }
    };

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/auth/users/${editId}`);
            if (res.data.success) {
                const user = res.data.data;
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    role: user.roles ? user.roles.map((r: Role) => r._id) : (user.role ? [user.role._id] : [])
                });
            }
        } catch (error) {
            toast.error('Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role || formData.role.length === 0) {
            toast.error('Please select at least one role');
            return;
        }

        try {
            setLoading(true);
            if (editId) {
                const res = await axiosInstance.put(`/auth/users/${editId}`, formData);
                if (res.data.success) {
                    toast.success('User updated successfully');
                } else {
                    toast.error(res.data.message || 'Failed to update user');
                }
            } else {
                const res = await axiosInstance.post('/auth/register', {
                    ...formData,
                    registrationFrom: 'admin_portal'
                });
                if (res.data.success) {
                    toast.success('User created successfully');
                } else {
                    toast.error(res.data.message || 'Failed to create user');
                }
            }
            onSuccess();
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error(error.response.data.message || 'Access denied. Agent role cannot be assigned from Admin Panel.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to save user');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        {editId ? 'Edit User' : 'Create New User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* User Information */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            User Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                                    placeholder="email@example.com"
                                    disabled={!!editId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                                    placeholder="+1234567890"
                                />
                            </div>
                        </div>

                        {!editId && (
                            <div className="mt-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <strong>Note:</strong> A secure password will be automatically generated and sent to the user's email.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Role Assignment */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Role Assignment
                        </h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Roles <span className="text-red-500">*</span>
                            </label>
                            <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2.5">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    <strong>ℹ️ Identity Separation:</strong> The Agent role cannot be assigned from the Admin Panel. 
                                    Agents must self-register through the Agent Portal on the main website.
                                </p>
                            </div>
                            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto bg-white dark:bg-gray-700 shadow-inner">
                                {roles.filter(role => role.name !== 'Agent').length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No roles available</p>
                                ) : (
                                    <div className="space-y-2">
                                        {roles.filter(role => role.name !== 'Agent').map((role) => (
                                            <label key={role._id} className="flex items-start gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-3 rounded-lg transition-all group">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.role.includes(role._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, role: [...formData.role, role._id] });
                                                        } else {
                                                            setFormData({ ...formData, role: formData.role.filter(r => r !== role._id) });
                                                        }
                                                    }}
                                                    className="w-5 h-5 mt-0.5 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{role.name}</span>
                                                    {role.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{role.description}</p>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {formData.role.length === 0 && (
                                <p className="text-xs text-red-500 dark:text-red-400 mt-1">Please select at least one role</p>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-3 sm:px-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all touch-manipulation"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-5 py-3 sm:px-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    <span>{editId ? 'Update User' : 'Create User'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
