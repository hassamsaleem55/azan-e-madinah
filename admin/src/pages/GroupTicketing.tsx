import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../Api/axios";
import { Users, Eye, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";

interface Flight {
  airline: string;
  flightNo: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  sectorFrom: string;
  sectorTo: string;
  fromTerminal?: string;
  toTerminal?: string;
  flightClass?: string;
  baggage?: string;
  meal?: string;
}

interface Passenger {
  adults: number;
  children: number;
  infants: number;
}

interface Price {
  buyingCurrency: string;
  buyingAdultPrice: number;
  buyingChildPrice: number;
  buyingInfantPrice: number;
  sellingCurrencyB2B: string;
  sellingAdultPriceB2B: number;
  sellingChildPriceB2B: number;
  sellingInfantPriceB2B: number;
  total: number;
}

interface Payment {
  amount: number;
  method: "Cash" | "Bank" | "Online";
  status: "Pending" | "Paid" | "Refunded";
  paymentDate?: string;
}

interface GroupTicketing {
  // Common fields
  id?: string;
  _id?: string;
  
  // Admin database fields
  voucher_id?: string;
  groupBookingId?: string;
  user?: string;
  evoucherAccount?: string;
  groupCategory?: string;
  groupName?: string;
  flights?: Flight[];
  passengers?: Passenger;
  price?: Price;
  payments?: Payment[];
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  internalStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Flying Zone API fields
  available_no_of_pax?: number;
  dept_date?: string;
  arv_date?: string;
  details?: any[];
  childPrice?: number;
  infantPrice?: number;
  
  // Shared fields
  sector?: string;
  type?: string;
  airline?: string | { id: number; airline_name: string; short_name: string; logo_url: string };
  showSeat?: boolean;
  totalSeats?: number;
  pnr?: string;
  source?: "flyingzone" | "admin";
}

const GroupTicketing = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<GroupTicketing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [groupCategoryFilter, setGroupCategoryFilter] = useState<string>("All");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [activeTab, setActiveTab] = useState<"flyingzone" | "local">("local");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/group-ticketing");
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch group bookings");
    } finally {
      setLoading(false);
    }
  };

  // Separate bookings by source
  const flyingZoneBookings = bookings.filter(b => b.source === "flyingzone");
  const localBookings = bookings.filter(b => !b.source || b.source === "admin");

  const filterBookings = (bookingsList: GroupTicketing[]) => {
    return bookingsList.filter((booking) => {
      const matchesSearch = 
        booking.groupBookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.voucher_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pnr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.sector?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroupCategory = 
        groupCategoryFilter === "All" || 
        booking.groupCategory === groupCategoryFilter;

      return matchesSearch && matchesGroupCategory;
    });
  };

  const filteredFlyingZone = filterBookings(flyingZoneBookings);
  const filteredLocal = filterBookings(localBookings);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAirlineName = (airline: any) => {
    if (typeof airline === "string") return airline;
    if (airline?.airline_name) return airline.airline_name;
    if (airline?.short_name) return airline.short_name;
    return "N/A";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Group Ticketing
        </h1>
        <p className="text-gray-600 mt-1">Manage Hajj and Umrah group bookings from multiple sources</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Filters & Search</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("local")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "local"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === "local" ? "bg-white" : "bg-blue-600"}`} />
              Custom Groups
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "local" ? "bg-blue-700" : "bg-blue-100 text-blue-800"
              }`}>
                {filteredLocal.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("flyingzone")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "flyingzone"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === "flyingzone" ? "bg-white" : "bg-purple-600"}`} />
              Flying Zone API
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "flyingzone" ? "bg-purple-700" : "bg-purple-100 text-purple-800"
              }`}>
                {filteredFlyingZone.length}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Group Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Group Category
              </label>
              <select
                value={groupCategoryFilter}
                onChange={(e) => setGroupCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="All">All Categories</option>
                <option value="UAE Groups">UAE Groups</option>
                <option value="KSA Groups">KSA Groups</option>
                <option value="Bahrain Groups">Bahrain Groups</option>
                <option value="Mascat Groups">Mascat Groups</option>
                <option value="Qatar Groups">Qatar Groups</option>
                <option value="UK Groups">UK Groups</option>
                <option value="Umrah Groups">Umrah Groups</option>
              </select>
            </div>

            {/* Entries Per Page */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entries per page
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, PNR, or Group Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Custom Groups Tab */}
              {activeTab === "local" && (
                <>
                  {filteredLocal.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Group Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flight Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Passengers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Price
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
                        {filteredLocal.slice(0, entriesPerPage).map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.groupBookingId || "N/A"}
                              </div>
                              {booking.voucher_id && (
                                <div className="text-xs text-gray-500">
                                  Voucher: {booking.voucher_id}
                                </div>
                              )}
                              {booking.pnr && (
                                <div className="text-xs text-gray-500">
                                  PNR: {booking.pnr}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.groupName || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Category: {booking.groupCategory || "N/A"}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {booking.flights && booking.flights.length > 0 ? (
                                <div className="text-sm text-gray-900">
                                  <div className="font-medium">
                                    {booking.flights[0].airline} {booking.flights[0].flightNo}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {booking.flights[0].sectorFrom} → {booking.flights[0].sectorTo}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(booking.flights[0].depDate)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No flight info</span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.passengers ? (
                                <div className="text-sm text-gray-900">
                                  <div>Adults: {booking.passengers.adults || 0}</div>
                                  <div>Children: {booking.passengers.children || 0}</div>
                                  <div>Infants: {booking.passengers.infants || 0}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Total: {booking.totalSeats || 0} seats
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No passenger info</span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-green-600">
                                {booking.price?.buyingCurrency || "PKR"} {booking.price?.total?.toLocaleString() || "0"}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.internalStatus)}`}>
                                {booking.internalStatus || "Active"}
                              </span>
                              {booking.createdAt && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDate(booking.createdAt)}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => navigate(`/group-ticketing/edit/${booking._id || booking.id}`)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all text-xs"
                              >
                                <Eye className="w-3 h-3" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-64">
                      <Users className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-500">No custom groups found</p>
                    </div>
                  )}
                </>
              )}

              {/* Flying Zone API Tab */}
              {activeTab === "flyingzone" && (
                <>
                  {filteredFlyingZone.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Group Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flight Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Passengers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFlyingZone.slice(0, entriesPerPage).map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.id}
                              </div>
                              {booking.pnr && (
                                <div className="text-xs text-gray-500">
                                  PNR: {booking.pnr}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.sector || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Type: {booking.type || "N/A"}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">
                                  {getAirlineName(booking.airline)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.sector || "N/A"}
                                </div>
                                {booking.dept_date && (
                                  <div className="text-xs text-gray-500">
                                    {formatDate(booking.dept_date)}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div>Available: {booking.available_no_of_pax || 0} pax</div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="font-bold text-green-600">Adult: {typeof booking.price === 'number' ? booking.price : 0}</div>
                                <div className="text-xs">Child: {booking.childPrice || 0}</div>
                                <div className="text-xs">Infant: {booking.infantPrice || 0}</div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                              {booking.dept_date && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDate(booking.dept_date)}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-64">
                      <Users className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-500">No Flying Zone bookings found</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
            {activeTab === "local" && (
              <span>Showing {Math.min(entriesPerPage, filteredLocal.length)} of {filteredLocal.length} custom groups</span>
            )}
            {activeTab === "flyingzone" && (
              <span>Showing {Math.min(entriesPerPage, filteredFlyingZone.length)} of {filteredFlyingZone.length} Flying Zone bookings</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupTicketing;
