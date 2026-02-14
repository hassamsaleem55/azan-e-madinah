import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Api/axios";
import { Shield, Plus, Edit, Trash2 } from "lucide-react";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  Button,
  Badge,
  Modal,
  ModalFooter,
  LoadingState,
  FormField,
  Input,
} from "../components";

interface Permission {
  _id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  isActive: boolean;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

interface FormData {
  name: string;
  description: string;
  permissions: string[];
}

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get("/roles");
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axiosInstance.get("/permissions");
      if (res.data.success) {
        setPermissions(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch permissions");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        const res = await axiosInstance.put(`/roles/${editingRole._id}`, formData);
        if (res.data.success) {
          toast.success("Role updated successfully");
        }
      } else {
        const res = await axiosInstance.post("/roles", formData);
        if (res.data.success) {
          toast.success("Role created successfully");
        }
      }
      setShowModal(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save role");
    }
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }
    try {
      const res = await axiosInstance.delete(`/roles/${roleId}`);
      if (res.data.success) {
        toast.success("Role deleted successfully");
        fetchRoles();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p._id)
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: []
    });
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

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <PageMeta title="Role Management | Admin" description="Manage user roles and permissions" />
      
      <PageLayout>
        <PageHeader
          title="Role Management"
          description="Manage user roles and permissions"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Role Management' },
          ]}
          actions={
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              startIcon={<Plus className="w-4 h-4" />}
            >
              Create Role
            </Button>
          }
        />

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles
            .filter(role => !['Super Admin', 'Agent'].includes(role.name))
            .map((role) => (
            <div key={role._id} className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl hover:shadow-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{role.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-2.5 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-all hover:scale-110 touch-manipulation shadow-sm hover:shadow"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(role._id, role.name)}
                    className="p-2.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110 touch-manipulation shadow-sm hover:shadow"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {role.permissions.length} Permission{role.permissions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 5).map((perm) => (
                    <Badge key={perm._id} color="info">
                      {perm.code}
                    </Badge>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                      +{role.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingRole ? "Edit Role" : "Create New Role"}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 12rem)', overflowY: 'auto' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Role Name" required>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter role name"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of role"
                  />
                </FormField>
              </div>

                <div className="mt-8">
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
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="w-full sm:w-auto px-5 py-3 sm:px-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-3 sm:px-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 touch-manipulation"
              >
                <Shield className="w-5 h-5" />
                <span>{editingRole ? "Update Role" : "Create Role"}</span>
              </button>
            </div>
          </form>
        </Modal>
      </PageLayout>
    </>
  );
};

export default RoleManagement;
