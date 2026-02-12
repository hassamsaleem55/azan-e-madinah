import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../Api/axios";
import PageHeader from "../components/layout/PageHeader";
import { Select } from "../components";
import { Users, UserCheck, UserX, Clock, Download, FileText, Search, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  agencyCode?: string;
  role: string | { _id: string; name: string };
  roles?: Array<{ _id: string; name: string }>;
  status: "Active" | "Inactive" | "Suspended";
  agentStatus: "Active" | "Inactive" | "Suspended" | "Pending";
  plainPassword?: string;
  city?: string;
  accountId?: string;
  accountName?: string;
  consultant?: string;
  country?: string;
  marginType?: "Percentage" | "Amount";
  flightMarginPercent?: number;
  flightMarginAmount?: number;
  registeredFrom?: {
    ipAddress?: string;
    userAgent?: string;
  };
  margin?: string;
  creditAmount?: number;
  activatedBy?: string;
  deactivatedBy?: string;
  deactivatedAt?: string;
  agentActivatedBy?: string;
  agentDeactivatedBy?: string;
  agentDeactivatedAt?: string;
  createdAt: string;
}

const RegisteredAgencies = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);
  const [sendingCredentials, setSendingCredentials] = useState<string | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "https://azanemadinah.com";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, cityFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/users");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role - only show agencies (users with Agent role)
    filtered = filtered.filter((user) => {
      // Check if user has Agent role in their roles array
      if (user.roles && Array.isArray(user.roles)) {
        return user.roles.some(role => role.name === "Agent");
      }
      // Fallback to old role field for backward compatibility (if any)
      const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
      return roleName === "Agency" || roleName === "Agent";
    });

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.agencyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by city
    if (cityFilter !== "All") {
      filtered = filtered.filter((user) => user.city === cityFilter);
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((user) => user.agentStatus === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, newStatus: "Active" | "Inactive" | "Pending" | "Suspended") => {
    try {
      // If activating, check if we already have 2 active agents
      if (newStatus === "Active") {
        const currentActiveCount = users.filter(u => 
          hasAgentRole(u) && u.agentStatus === "Active" && u._id !== userId
        ).length;
        
        if (currentActiveCount >= 1000) {
          toast.error("Maximum limit of 1000 active agents reached. Please deactivate another agent first.");
          return;
        }
      }
      
      setApprovalLoading(userId);
      const response = await axiosInstance.patch(
        `/auth/users/${userId}/status`,
        { agentStatus: newStatus }
      );

      if (response.data.success) {
        const updated = response.data.data as User;
        setUsers(
          users.map((user) =>
            user._id === userId
              ? {
                ...user,
                agentStatus: newStatus,
                agentActivatedBy: updated.agentActivatedBy,
                agentDeactivatedBy: updated.agentDeactivatedBy,
                agentDeactivatedAt: updated.agentDeactivatedAt
              }
              : user
          )
        );
        toast.success(`Agent ${newStatus.toLowerCase()} successfully`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleAgentLogin = (user: User) => {
    if (!user.agencyCode || !user.email || !user.plainPassword) {
      toast.error("Missing agent credentials for auto login");
      return;
    }

    const params = new URLSearchParams({
      agentCode: user.agencyCode,
      email: user.email,
      password: user.plainPassword,
      auto: "true",
    });

    const target = `${frontendUrl.replace(/\/$/, "")}/?${params.toString()}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const handleSendCredentials = async (userId: string) => {
    try {
      setSendingCredentials(userId);
      const response = await axiosInstance.post(
        `/auth/users/${userId}/send-credentials`,
        {}
      );

      if (response.data.success) {
        toast.success(response.data.message || "Credentials sent successfully!");
      }
    } catch (error: any) {
      if (error.response?.status === 500) {
        toast.error("Email service is not configured. Contact system administrator.");
      } else {
        toast.error(error.response?.data?.message || "Failed to send credentials");
      }
    } finally {
      setSendingCredentials(null);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const params = new URLSearchParams({
        searchTerm: searchTerm,
        city: cityFilter,
        status: statusFilter,
      });

      const response = await axiosInstance.get(`/export/users/pdf?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `agencies-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const params = new URLSearchParams({
        searchTerm: searchTerm,
        city: cityFilter,
        status: statusFilter,
      });

      const response = await axiosInstance.get(`/export/users/excel?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `agencies-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel downloaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download Excel");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatMargin = (user: User) => {
    if (user.marginType === "Amount") {
      return `${user.flightMarginAmount ?? 0} PKR`;
    }
    if (user.marginType === "Percentage") {
      return `${user.flightMarginPercent ?? 0}%`;
    }
    return user.margin || "0";
  };

  const hasAgentRole = (user: User) => {
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(role => role.name === "Agent");
    }
    const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
    return roleName === "Agency" || roleName === "Agent";
  };

  const activeCount = users.filter(u => hasAgentRole(u) && u.agentStatus === "Active").length;
  const pendingCount = users.filter(u => hasAgentRole(u) && u.agentStatus === "Pending").length;
  const inactiveCount = users.filter(u => hasAgentRole(u) && u.agentStatus === "Inactive").length;

  const uniqueCities = Array.from(new Set(users.filter(u => u.city).map(u => u.city)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Agencies"
        description="Manage all registered agency users"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Registered Agencies' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-linear-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/90 rounded-full p-3 shadow-md">
              <UserCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">Active Agents</div>
              <div className="text-3xl font-bold">{activeCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/90 rounded-full p-3 shadow-md">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">Pending Agents</div>
              <div className="text-3xl font-bold">{pendingCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-400 to-slate-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/90 rounded-full p-3 shadow-md">
              <UserX className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">Inactive Agents</div>
              <div className="text-3xl font-bold">{inactiveCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-visible">
        <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Filters & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filter by City
              </label>
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                options={[
                  { value: "All", label: "All Cities" },
                  ...uniqueCities.map(city => ({ value: city, label: city }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "All", label: "All" },
                  { value: "Active", label: "Active" },
                  { value: "Pending", label: "Pending" },
                  { value: "Inactive", label: "Inactive" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Entries per page
              </label>
              <Select
                value={entriesPerPage.toString()}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                options={[
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              {downloadingPDF ? "Downloading..." : "Export PDF"}
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloadingExcel ? "Downloading..." : "Export Excel"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500">No agencies found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.slice(0, entriesPerPage).map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                      <div className="text-xs text-gray-500">
                        Code: {user.agencyCode || "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.companyName || "N/A"}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.city || "N/A"}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatMargin(user)}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {user.creditAmount?.toLocaleString() || 0} PKR
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.agentStatus)}`}>
                        {user.agentStatus}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-2">
                        {user.agentStatus === "Active" ? (
                          <button
                            onClick={() => updateUserStatus(user._id, "Inactive")}
                            disabled={approvalLoading === user._id}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all disabled:opacity-50 text-xs"
                          >
                            {approvalLoading === user._id ? "Processing..." : "Deactivate"}
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user._id, "Active")}
                            disabled={approvalLoading === user._id}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all disabled:opacity-50 text-xs"
                          >
                            {approvalLoading === user._id ? "Processing..." : "Activate"}
                          </button>
                        )}

                        <button
                          onClick={() => handleSendCredentials(user._id)}
                          disabled={sendingCredentials === user._id}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all disabled:opacity-50 text-xs"
                        >
                          {sendingCredentials === user._id ? "Sending..." : "Send Credentials"}
                        </button>

                        {user.agentStatus === "Active" && (
                          <button
                            onClick={() => handleAgentLogin(user)}
                            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-all text-xs"
                          >
                            Agent Login
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/registered-agencies/${user._id}`)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all text-xs"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
            Showing {Math.min(entriesPerPage, filteredUsers.length)} of {filteredUsers.length} agencies
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredAgencies;
