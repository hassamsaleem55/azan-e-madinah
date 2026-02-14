import { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Input } from '../components';

interface Permission {
    _id: string;
    name: string;
    code: string;
    description: string;
    module: string;
    isActive: boolean;
}

interface RoleFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const RoleForm = ({ onClose, onSuccess, editId }: RoleFormProps) => {
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        fetchPermissions();
        if (editId) {
            fetchRole();
        }
    }, [editId]);

    const fetchPermissions = async () => {
        try {
            const res = await axiosInstance.get('/permissions');
            if (res.data.success) {
                setPermissions(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch permissions');
        }
    };

    const fetchRole = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/roles/${editId}`);
            if (res.data.success) {
                const role = res.data.data;
                setFormData({
                    name: role.name || '',
                    description: role.description || '',
                    permissions: role.permissions?.map((p: Permission) => p._id) || []
                });
            }
        } catch (error) {
            toast.error('Failed to fetch role details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Please enter a role name');
            return;
        }

        try {
            setLoading(true);
            if (editId) {
                const res = await axiosInstance.put(`/roles/${editId}`, formData);
                if (res.data.success) {
                    toast.success('Role updated successfully');
                }
            } else {
                const res = await axiosInstance.post('/roles', formData);
                if (res.data.success) {
                    toast.success('Role created successfully');
                }
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save role');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (permissionId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(id => id !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        {editId ? 'Edit Role' : 'Create New Role'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Role Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Enter role name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <Input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Brief description of role"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Assign Permissions
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([module, perms]) => (
                                <div key={module} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-all bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-base uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        {module}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {perms.map((perm) => (
                                            <label
                                                key={perm._id}
                                                className="flex items-start gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-3 rounded-lg transition-all group border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(perm._id)}
                                                    onChange={() => togglePermission(perm._id)}
                                                    className="w-5 h-5 mt-0.5 text-blue-600 rounded border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors">
                                                        {perm.name}
                                                    </span>
                                                    {perm.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{perm.description}</p>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                                    <span>{editId ? 'Update Role' : 'Create Role'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleForm;
