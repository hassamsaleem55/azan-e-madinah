import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, Plus, Eye, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Api/axios";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  FilterBar,
  Button,
  LoadingState,
  EmptyState,
  FormField,
  Select,
  Input,
} from "../components";

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
    <>
      <PageMeta title="Group Ticketing | Admin" description="Manage Hajj and Umrah group bookings from multiple sources" />
      
      <PageLayout>
        <PageHeader
          title="Group Ticketing"
          description="Manage Hajj and Umrah group bookings from multiple sources"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Group Ticketing' },
          ]}
          actions={
            <Button onClick={() => navigate('/group-ticketing/create')} startIcon={<Plus className="w-4 h-4" />}>
              Add Group Booking
            </Button>
          }
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("local")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "local"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === "local" ? "bg-white" : "bg-blue-600"}`} />
            Custom Groups
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === "local" ? "bg-blue-700" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            }`}>
              {filteredLocal.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("flyingzone")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "flyingzone"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === "flyingzone" ? "bg-white" : "bg-purple-600"}`} />
            Flying Zone API
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === "flyingzone" ? "bg-purple-700" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            }`}>
              {filteredFlyingZone.length}
            </span>
          </button>
        </div>

        <FilterBar
          filters={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Group Category">
                <Select
                  value={groupCategoryFilter}
                  onChange={(e) => setGroupCategoryFilter(e.target.value)}
                  options={[
                    { value: "All", label: "All Categories" },
                    { value: "UAE Groups", label: "UAE Groups" },
                    { value: "KSA Groups", label: "KSA Groups" },
                    { value: "Bahrain Groups", label: "Bahrain Groups" },
                    { value: "Mascat Groups", label: "Mascat Groups" },
                    { value: "Qatar Groups", label: "Qatar Groups" },
                    { value: "UK Groups", label: "UK Groups" },
                    { value: "Umrah Groups", label: "Umrah Groups" },
                  ]}
                />
              </FormField>
              <FormField label="Entries per page">
                <Select
                  value={entriesPerPage.toString()}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  options={[
                    { value: "10", label: "10" },
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                    { value: "100", label: "100" },
                  ]}
                />
              </FormField>
              <FormField label="Search">
                <Input
                  type="text"
                  placeholder="Search by ID, PNR, or Group Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormField>
            </div>
          }
          showFilters={true}
        />

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Custom Groups Tab */}
            {activeTab === "local" && (
              <>
                {filteredLocal.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-visible">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Booking ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Group Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Flight Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Passengers
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredLocal.slice(0, entriesPerPage).map((booking) => (
                            <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {booking.groupBookingId || "N/A"}
                                </div>
                                {booking.voucher_id && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Voucher: {booking.voucher_id}
                                  </div>
                                )}
                                {booking.pnr && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    PNR: {booking.pnr}
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {booking.groupName || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Category: {booking.groupCategory || "N/A"}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                {booking.flights && booking.flights.length > 0 ? (
                                  <div className="space-y-1">
                                    {booking.flights.slice(0, 2).map((flight, idx) => (
                                      <div key={idx} className="text-xs">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {flight.airline} {flight.flightNo}
                                        </span>
                                        <div className="text-gray-500 dark:text-gray-400">
                                          {formatDate(flight.depDate)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">No flights</span>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                {booking.passengers ? (
                                  <div className="text-xs text-gray-900 dark:text-white">
                                    <div>Adults: {booking.passengers.adults}</div>
                                    <div>Children: {booking.passengers.children}</div>
                                    <div>Infants: {booking.passengers.infants}</div>
                                    <div className="font-medium mt-1">
                                      Total: {booking.passengers.adults + booking.passengers.children + booking.passengers.infants}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                  PKR {booking.price?.total?.toLocaleString() || "0"}
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.internalStatus)}`}>
                                  {booking.internalStatus || "Pending"}
                                </span>
                                {booking.createdAt && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatDate(booking.createdAt)}
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => navigate(`/group-ticketing/${booking._id}`)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => navigate(`/group-ticketing/edit/${booking._id}`)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Users className="w-16 h-16" />}
                    title="No custom groups found"
                    description="No groups match your current filters"
                  />
                )}
              </>
            )}

            {/* Flying Zone API Tab */}
            {activeTab === "flyingzone" && (
              <>
                {filteredFlyingZone.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-visible">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Booking ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Group Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Flight Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Passengers
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredFlyingZone.slice(0, entriesPerPage).map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.id}</div>
                                {booking.pnr && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">PNR: {booking.pnr}</div>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.sector}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{getAirlineName(booking.airline)}</div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="text-xs text-gray-900 dark:text-white">
                                  {booking.dept_date && (
                                    <div>Departure: {formatDate(booking.dept_date)}</div>
                                  )}
                                  {booking.arv_date && (
                                    <div>Arrival: {formatDate(booking.arv_date)}</div>
                                  )}
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-900 dark:text-white">Available: {booking.available_no_of_pax || 0}</div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-900 dark:text-white">
                                  {booking.childPrice && <div>Child: {booking.childPrice}</div>}
                                  {booking.infantPrice && <div>Infant: {booking.infantPrice}</div>}
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                  From API
                                </span>
                                {booking.createdAt && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(booking.createdAt)}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Users className="w-16 h-16" />}
                    title="No Flying Zone bookings found"
                    description="No bookings match your current filters"
                  />
                )}
              </>
            )}
          </>
        )}
      </PageLayout>
    </>
  );
};

export default GroupTicketing;
