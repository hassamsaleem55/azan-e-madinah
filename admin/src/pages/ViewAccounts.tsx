import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageHeader from "../components/layout/PageHeader";
import { Users, Eye, Filter, Search, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Api/axios";
import { Select } from "../components";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  agencyCode?: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  city?: string;
  address?: string;
  createdAt: string;
}

const ViewAccounts = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [entriesPerPage, setEntriesPerPage] = useState(50);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, cityFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("admin_token");
      const response = await axiosInstance.get("/auth/users", {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role - only show agencies
    filtered = filtered.filter((user) => user.role === "Agency");

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

    setFilteredUsers(filtered);
  };

  const uniqueCities = Array.from(new Set(users.filter(u => u.city).map(u => u.city)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Accounts"
        description="View and manage all registered agency accounts"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Agency Accounts' },
        ]}
      />

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-visible">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Accounts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Search and filter agency accounts</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Agency Accounts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredUsers.length} account{filteredUsers.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Loading accounts...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No accounts found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cell</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Agency</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.slice(0, entriesPerPage).map((user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="font-medium">{index + 1}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Code: {user.agencyCode || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {user.companyName || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user.address || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {user.city || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/ledger/${user._id}`, {
                            state: { userName: user.name, agencyCode: user.agencyCode }
                          })}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                        >
                          <Eye className="w-4 h-4" />
                          View Ledger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Results Summary */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              Showing {Math.min(entriesPerPage, filteredUsers.length)} of {filteredUsers.length} accounts
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewAccounts;
