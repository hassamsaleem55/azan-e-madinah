import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Api/axios";
import { Shield, Plus, Edit, Trash2 } from "lucide-react";
import RoleForm from "./RoleForm";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  Button,
  Badge,
  LoadingState,
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

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
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

  const handleCreate = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (roleId: string) => {
    setEditingId(roleId);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingId(null);
    fetchRoles();
  };

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
              onClick={handleCreate}
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
                    onClick={() => handleEdit(role._id)}
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

        {showModal && (
          <RoleForm
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            editId={editingId}
          />
        )}
      </PageLayout>
    </>
  );
};

export default RoleManagement;
