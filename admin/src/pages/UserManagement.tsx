import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Api/axios";
import { useAuth } from "../context/AuthContext";
import { Shield, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import UserForm from "./UserForm";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  PageContent,
  PageContentSection,
  Button,
  Badge,
  DataTable,
  LoadingState,
  EmptyState,
} from "../components";

interface Role {
  _id: string;
  name: string;
  description: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: Role;
  roles?: Role[];
  status: string;
  companyName?: string;
  createdAt: string;
}

export default function UserManagement() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth/users");
      if (res.data.success) {
        // Filter out users who only have Agent role (agents are managed in Registered Agencies module)
        const filteredUsers = res.data.data.filter((user: User) => {
          // If user has multiple roles and one of them is not Agent, show them
          if (user.roles && user.roles.length > 0) {
            return user.roles.some(role => role.name !== 'Agent');
          }
          // Fallback for legacy single role field
          return user.role?.name !== 'Agent';
        });
        setUsers(filteredUsers);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingId(null);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await axiosInstance.delete(`/auth/users/${userId}`);
      if (res.data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      const res = await axiosInstance.patch(`/auth/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`User ${newStatus === "Active" ? "activated" : "deactivated"} successfully`);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (!isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <>
      <PageMeta title="User Management | Admin" description="Manage system users and their roles" />
      
      <PageLayout>
        <PageHeader
          title="User Management"
          description="Manage system users and their roles"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'User Management' },
          ]}
          actions={
            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
              Add User
            </Button>
          }
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📝 Note: Agents are managed in the "Registered Agencies" module
          </p>
        </div>

        <PageContent>
          <PageContentSection noPadding>
            {users.length === 0 ? (
              <EmptyState
                icon={<Shield className="w-16 h-16" />}
                title="No users found"
                description="Start by adding your first user to the system."
                action={
                  <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                    Add First User
                  </Button>
                }
              />
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'user',
                    header: 'User',
                    render: (user: User) => (
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                    ),
                  },
                  {
                    key: 'contact',
                    header: 'Contact',
                    render: (user: User) => (
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'role',
                    header: 'Role',
                    render: (user: User) => (
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles
                            .filter((role) => role.name !== 'Agent')
                            .map((role) => (
                              <Badge key={role._id} color="info">
                                {role.name}
                              </Badge>
                            ))
                        ) : (
                          user.role?.name !== 'Agent' && (
                            <Badge color="info">
                              {user.role?.name || 'No Role'}
                            </Badge>
                          )
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (user: User) => (
                      <button
                        onClick={() => handleStatusToggle(user._id, user.status)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.status === 'Active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status}
                      </button>
                    ),
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    align: 'center',
                    render: (user: User) => (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 sm:p-2.5 text-warning-600 hover:bg-warning-50 dark:text-warning-400 dark:hover:bg-warning-900/20 rounded-lg transition-colors touch-manipulation"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 sm:p-2.5 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 rounded-lg transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                          disabled={user.roles?.some(r => r.name === 'Super Admin') || user.role?.name === 'Super Admin'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={users}
                keyExtractor={(user) => user._id}
                hover
              />
            )}
          </PageContentSection>
        </PageContent>

      {showModal && (
        <UserForm
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          editId={editingId}
        />
      )}
      </PageLayout>
    </>
  );
}
