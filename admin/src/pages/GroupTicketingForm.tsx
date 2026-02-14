import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { Plane, Calendar as CalendarIcon, Users, DollarSign, Mail, Phone, FileText, ArrowLeft, Plus, Trash2, Save, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Api/axios";
import { PageMeta, PageLayout, PageHeader, FormField, Input, Select, LoadingState, Button } from "../components";

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

interface Payment {
  amount: number;
  method: "Cash" | "Bank" | "Online";
  status: "Pending" | "Paid" | "Refunded";
  paymentDate?: string;
}

interface Sector {
  _id: string;
  sectorTitle: string;
  fullSector: string;
}

interface Airline {
  _id: string;
  airlineCode: string;
  airlineName: string;
  shortCode: string;
  logo: string;
}

const GroupTicketingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    user: "",
    evoucherAccount: "",
    sector: "",
    airline: "",
    groupCategory: "",
    groupName: "",
    totalSeats: 0,
    showSeat: false,
    flights: [{
      airline: "",
      flightNo: "",
      depDate: "",
      depTime: "",
      arrDate: "",
      arrTime: "",
      sectorFrom: "",
      sectorTo: "",
      fromTerminal: "",
      toTerminal: "",
      flightClass: "",
      baggage: "",
      meal: ""
    }],
    passengers: {
      adults: 0,
      children: 0,
      infants: 0
    },
    price: {
      buyingCurrency: "SAR",
      buyingAdultPrice: 0,
      buyingChildPrice: 0,
      buyingInfantPrice: 0,
      sellingCurrencyB2B: "SAR",
      sellingAdultPriceB2B: 0,
      sellingChildPriceB2B: 0,
      sellingInfantPriceB2B: 0
    },
    pnr: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    internalStatus: "Public",
    payments: [] as Payment[]
  });

  useEffect(() => {
    fetchSectors();
    fetchAirlines();
    if (id) {
      setEditMode(true);
      fetchBookingDetails(id);
    }

    // Fetch cities for sector from/to dropdowns
    fetch("/admin-portal/data/cities.json")
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((c: any) => ({
          value: c.airportCode,
          label: `${c.cityEn} (${c.airportCode})`,
        }));
        setCityOptions(options);
      })
      .catch(() => setCityOptions([]));
  }, [id]);

  const fetchSectors = async () => {
    try {
      const response = await axiosInstance.get("/sector");
      if (response.data.success) {
        setSectors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sectors:", error);
    }
  };

  const fetchAirlines = async () => {
    try {
      const response = await axiosInstance.get("/airline");
      if (response.data.success) {
        setAirlines(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching airlines:", error);
    }
  };

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("admin_token");
      const response = await axiosInstance.get(`/group-ticketing/${bookingId}`, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });
      if (response.data.success) {
        const booking = response.data.data;
        setFormData({
          user: booking.user || "",
          evoucherAccount: booking.evoucherAccount || "",
          sector: booking.sector || "",
          airline: booking.airline || "",
          groupCategory: booking.groupCategory || "",
          groupName: booking.groupName || "",
          totalSeats: booking.totalSeats || 0,
          showSeat: booking.showSeat || false,
          flights: booking.flights.map((f: Flight) => ({
            ...f,
            airline: f.airline || booking.airline,
            depDate: f.depDate.slice(0, 10),
            arrDate: f.arrDate.slice(0, 10),
            fromTerminal: f.fromTerminal || "",
            toTerminal: f.toTerminal || "",
            flightClass: f.flightClass || "",
            baggage: f.baggage || "",
            meal: f.meal || ""
          })),
          passengers: booking.passengers,
          price: {
            buyingCurrency: booking.price.buyingCurrency,
            buyingAdultPrice: booking.price.buyingAdultPrice,
            buyingChildPrice: booking.price.buyingChildPrice,
            buyingInfantPrice: booking.price.buyingInfantPrice,
            sellingCurrencyB2B: booking.price.sellingCurrencyB2B,
            sellingAdultPriceB2B: booking.price.sellingAdultPriceB2B,
            sellingChildPriceB2B: booking.price.sellingChildPriceB2B,
            sellingInfantPriceB2B: booking.price.sellingInfantPriceB2B
          },
          pnr: booking.pnr || "",
          contactPersonPhone: booking.contactPersonPhone || "",
          contactPersonEmail: booking.contactPersonEmail || "",
          internalStatus: booking.internalStatus || "Public",
          payments: booking.payments
        });
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  // Custom select styles with premium design
  const getCustomSelectStyles = (hasError: boolean = false) => ({
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "36px",
      height: "36px",
      fontSize: "0.75rem",
      fontWeight: "600",
      borderWidth: "2px",
      borderColor: hasError 
        ? "#ef4444" 
        : state.isFocused 
          ? "#6366f1" 
          : state.menuIsOpen
            ? "#6366f1"
            : "#e5e7eb",
      borderRadius: "0.75rem",
      backgroundColor: document.documentElement.classList.contains('dark') ? "#111827" : "#ffffff",
      boxShadow: state.isFocused 
        ? "0 0 0 4px rgba(99, 102, 241, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" 
        : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        borderColor: hasError ? "#ef4444" : "#c7d2fe",
        backgroundColor: document.documentElement.classList.contains('dark') ? "#1f2937" : "linear-gradient(to bottom right, #ffffff, #f9fafb)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0 0.5rem",
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: "36px",
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      color: state.isFocused ? "#6366f1" : "#9ca3af",
      transition: "all 0.2s",
      "&:hover": {
        color: "#6366f1",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0",
      padding: "0",
      color: document.documentElement.classList.contains('dark') ? "#f9fafb" : "#111827",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
      fontWeight: "500",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: document.documentElement.classList.contains('dark') ? "#f9fafb" : "#111827",
      fontWeight: "600",
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "0.75rem",
      border: "2px solid #e5e7eb",
      backgroundColor: document.documentElement.classList.contains('dark') ? "#1f2937" : "#ffffff",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
      marginTop: "4px",
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: "4px",
      maxHeight: "240px",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "0.75rem",
      fontWeight: "500",
      padding: "8px 12px",
      borderRadius: "0.5rem",
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
          ? document.documentElement.classList.contains('dark') ? "#374151" : "#eef2ff"
          : "transparent",
      color: state.isSelected ? "#ffffff" : document.documentElement.classList.contains('dark') ? "#f9fafb" : "#111827",
      cursor: "pointer",
      transition: "all 0.2s",
      "&:active": {
        backgroundColor: "#6366f1",
        color: "#ffffff",
      },
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 1060, // --z-popover
    }),
  });

  // Async loadOptions function to filter cities.json
  const loadCityOptions = (inputValue: string, callback: (options: any[]) => void) => {
    fetch("/admin-portal/data/cities.json")
      .then((res) => res.json())
      .then((data) => {
        const input = inputValue.toLowerCase();
        const filtered = data
          .filter((c: any) => {
            const city = (c.cityEn || "").toLowerCase();
            const code = (c.airportCode || "").toLowerCase();
            const searchTerm = (c.titleKey || "").toLowerCase();
            return (
              !inputValue ||
              city.includes(input) ||
              code.includes(input) ||
              searchTerm.includes(input)
            );
          })
          .map((c: any) => ({
            value: c.airportCode,
            label: `${c.cityEn} (${c.airportCode})`,
          }))
          .slice(0, 50);
        callback(filtered);
      })
      .catch(() => callback([]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // const token = localStorage.getItem("admin_token");

      if (editMode && id) {
        const response = await axiosInstance.put(
          `/group-ticketing/${id}`,
          formData,
          // {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //     "Content-Type": "application/json",
          //   },
          // }
        );
        if (response.data.success) {
          toast.success("Booking updated successfully!");
          navigate("/group-ticketing");
        }
      } else {
        const response = await axiosInstance.post(
          "/group-ticketing",
          formData,
        );
        if (response.data.success) {
          toast.success("Booking created successfully!");
          navigate("/group-ticketing");
        }
      }
    } catch (error: any) {
      console.error("Error saving booking:", error);
      toast.error(error.response?.data?.message || "Failed to save booking");
    } finally {
      setLoading(false);
    }
  };

  const addFlight = () => {
    setFormData({
      ...formData,
      flights: [
        ...formData.flights,
        {
          airline: formData.airline,
          flightNo: "",
          depDate: "",
          depTime: "",
          arrDate: "",
          arrTime: "",
          sectorFrom: "",
          sectorTo: "",
          fromTerminal: "",
          toTerminal: "",
          flightClass: "",
          baggage: "",
          meal: ""
        }
      ]
    });
  };

  const removeFlight = (index: number) => {
    setFormData({
      ...formData,
      flights: formData.flights.filter((_, i) => i !== index)
    });
  };

  const updateFlight = (index: number, field: string, value: string) => {
    const updatedFlights = [...formData.flights];
    updatedFlights[index] = { ...updatedFlights[index], [field]: value };
    setFormData({ ...formData, flights: updatedFlights });
  };

  if (loading) {
    return <LoadingState message="Loading booking details..." />;
  }

  return (
    <>
      <PageMeta 
        title={editMode ? "Edit Group Booking" : "Create Group Booking"} 
        description={editMode ? "Update group ticketing details" : "Add new airline group booking"}
      />
      <PageLayout>
        <PageHeader
          title={editMode ? "Edit Group Booking" : "Create Group Booking"}
          description={editMode ? "Update group ticketing details" : "Add new airline group booking"}
          breadcrumbs={[
            { label: "Home", path: "/" },
            { label: "Group Ticketing", path: "/group-ticketing" },
            { label: editMode ? "Edit" : "Create" }
          ]}
        />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 overflow-visible">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-5 rounded-t-2xl border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Booking Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete all required fields</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Supplier Account" required>
                <Input
                  type="text"
                  required
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  placeholder="Enter Supplier Account"
                />
              </FormField>
              <FormField label="Sector">
                <Select
                  value={formData.sector}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      sector: e.target.value
                    });
                  }}
                  options={[
                    { value: "", label: "Select Sector" },
                    ...sectors.map((sector) => ({
                      value: sector.sectorTitle,
                      label: `${sector.sectorTitle} - ${sector.fullSector}`
                    }))
                  ]}
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Group Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField label="Airline">
                <Select
                  value={formData.airline}
                  onChange={(e) => {
                    const selectedAirline = airlines.find(a => a.airlineName === e.target.value);
                    const updatedFlights = formData.flights.map(flight => ({
                      ...flight,
                      airline: e.target.value
                    }));
                    setFormData({
                      ...formData,
                      airline: e.target.value,
                      groupName: selectedAirline ? `${selectedAirline.airlineName}-${formData.sector || 'NULL'}` : formData.groupName,
                      flights: updatedFlights
                    });
                  }}
                  options={[
                    { value: "", label: "Select Airline" },
                    ...airlines.map((airline) => ({
                      value: airline.airlineName,
                      label: `${airline.airlineName} (${airline.shortCode})`
                    }))
                  ]}
                />
              </FormField>
              <FormField label="Group Category" required>
                <Select
                  value={formData.groupCategory}
                  onChange={(e) => setFormData({ ...formData, groupCategory: e.target.value })}
                  options={[
                    { value: "", label: "Select Group Category" },
                    { value: "UAE Groups", label: "UAE Groups" },
                    { value: "KSA Groups", label: "KSA Groups" },
                    { value: "Bahrain Groups", label: "Bahrain Groups" },
                    { value: "Mascat Groups", label: "Mascat Groups" },
                    { value: "Qatar Groups", label: "Qatar Groups" },
                    { value: "UK Groups", label: "UK Groups" },
                    { value: "Umrah Groups", label: "Umrah Groups" }
                  ]}
                />
              </FormField>
              <FormField label="Group Name">
                <Input
                  type="text"
                  value={formData.groupName}
                  readOnly
                  placeholder="e.g., AIR SIAL-NULL"
                  className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </FormField>
              <FormField label="Total Seats">
                <Input
                  type="text"
                  value={formData.totalSeats ? formData.totalSeats.toLocaleString() : ''}
                  onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value.replace(/,/g, '')) || 0 })}
                  placeholder="Enter total seats"
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3 p-5 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-blue-200 dark:border-gray-600">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.showSeat}
                  onChange={(e) => setFormData({ ...formData, showSeat: e.target.checked })}
                  className="w-11 h-6 appearance-none bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer transition-all duration-200 checked:bg-blue-600 dark:checked:bg-blue-500 before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform before:duration-200 checked:before:translate-x-5 before:shadow-md group-hover:before:shadow-lg"
                />
                <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Show Available Seats</span>
              </label>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between pb-4 border-b-2 border-gradient-to-r from-brand-200/50 to-brand-300/50 dark:from-brand-700/50 dark:to-brand-600/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-linear-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/20 rounded-xl shadow-md">
                  <CalendarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Flight Details</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add flight segments for this booking</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={addFlight}
                className="gap-2 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Add Flight
              </Button>
            </div>
            
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-200/80 dark:border-gray-700/80 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 backdrop-blur-sm relative z-0">
              <table className="w-full">
                <thead className="bg-linear-to-r from-brand-600 via-brand-500 to-indigo-600 dark:from-brand-700 dark:via-brand-600 dark:to-indigo-700">
                    <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Flight#</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Dep Date</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Dep Time</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Sector From</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">From Terminal</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Sector To</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">To Terminal</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Class</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Arr Date</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Arr Time</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Baggage</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Meal</th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide border-b-2 border-brand-400/30 dark:border-brand-500/30">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {formData.flights.map((flight, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-linear-to-r hover:from-brand-50/30 hover:to-brand-100/20 dark:hover:from-brand-900/10 dark:hover:to-brand-800/5 transition-all duration-300">
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        required
                        value={flight.flightNo}
                        onChange={(e) => updateFlight(index, "flightNo", e.target.value)}
                        placeholder="e.g., PK-340"
                        className="w-full min-w-25 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <DatePicker
                          selected={flight.depDate ? new Date(flight.depDate) : null}
                          onChange={(date: Date | null) => {
                            updateFlight(index, "depDate", date ? date.toISOString().split('T')[0] : "");
                          }}
                          dateFormat="MMMM d, yyyy"
                          placeholderText="Select departure date"
                          className="w-full min-w-37.5 h-10 pl-10 pr-3 text-xs font-semibold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                          wrapperClassName="w-full"
                          popperClassName="z-50"
                          portalId="root"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-brand-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <DatePicker
                          selected={flight.depTime ? new Date(`2000-01-01T${flight.depTime}`) : null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const hours = date.getHours().toString().padStart(2, '0');
                              const minutes = date.getMinutes().toString().padStart(2, '0');
                              updateFlight(index, "depTime", `${hours}:${minutes}`);
                            } else {
                              updateFlight(index, "depTime", "");
                            }
                          }}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          placeholderText="Select departure time"
                          className="w-full min-w-32.5 h-10 pl-10 pr-3 text-xs font-semibold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                          wrapperClassName="w-full"
                          popperClassName="z-50"
                          portalId="root"
                        />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-brand-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={cityOptions}
                        loadOptions={loadCityOptions}
                        styles={getCustomSelectStyles()}
                        value={cityOptions.find((opt) => opt.value === flight.sectorFrom) || null}
                        onChange={(option: any) => updateFlight(index, "sectorFrom", option?.value || "")}
                        placeholder="Select city"
                        className="min-w-37.5"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={flight.fromTerminal}
                        onChange={(e) => updateFlight(index, "fromTerminal", e.target.value)}
                        placeholder="T1, T2..."
                        className="w-full min-w-22.5 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={cityOptions}
                        loadOptions={loadCityOptions}
                        styles={getCustomSelectStyles()}
                        value={cityOptions.find((opt) => opt.value === flight.sectorTo) || null}
                        onChange={(option: any) => updateFlight(index, "sectorTo", option?.value || "")}
                        placeholder="Select city"
                        className="min-w-37.5"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={flight.toTerminal}
                        onChange={(e) => updateFlight(index, "toTerminal", e.target.value)}
                        placeholder="T1, T2..."
                        className="w-full min-w-22.5 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Select
                        value={flight.flightClass}
                        onChange={(e) => updateFlight(index, "flightClass", e.target.value)}
                        placeholder="Select Class"
                        className="h-10! w-40! text-xs! text-gray-400!"
                        menuPortalTarget={document.body}
                        options={[
                          { value: "Economy", label: "✈️ Economy" },
                          { value: "Business", label: "💼 Business" },
                          { value: "First", label: "👑 First Class" }
                        ]}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <DatePicker
                          selected={flight.arrDate ? new Date(flight.arrDate) : null}
                          onChange={(date: Date | null) => {
                            updateFlight(index, "arrDate", date ? date.toISOString().split('T')[0] : "");
                          }}
                          dateFormat="MMMM d, yyyy"
                          minDate={flight.depDate ? new Date(flight.depDate) : undefined}
                          placeholderText="Select arrival date"
                          className="w-full min-w-37.5 h-10 pl-10 pr-3 text-xs font-semibold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                          wrapperClassName="w-full"
                          popperClassName="z-50"
                          portalId="root"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-brand-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <DatePicker
                          selected={flight.arrTime ? new Date(`2000-01-01T${flight.arrTime}`) : null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const hours = date.getHours().toString().padStart(2, '0');
                              const minutes = date.getMinutes().toString().padStart(2, '0');
                              updateFlight(index, "arrTime", `${hours}:${minutes}`);
                            } else {
                              updateFlight(index, "arrTime", "");
                            }
                          }}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          placeholderText="Select arrival time"
                          className="w-full min-w-32.5 h-10 pl-10 pr-3 text-xs font-semibold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                          wrapperClassName="w-full"
                          popperClassName="z-50"
                          portalId="root"
                        />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-brand-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={flight.baggage}
                        onChange={(e) => updateFlight(index, "baggage", e.target.value)}
                        placeholder="30kg"
                        className="w-full min-w-22.5 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none hover:border-brand-300 dark:hover:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Select
                        value={flight.meal}
                        onChange={(e) => updateFlight(index, "meal", e.target.value)}
                        placeholder="Select"
                        className="h-10! w-30! text-xs! text-gray-400!"
                        menuPortalTarget={document.body}
                        options={[
                          { value: "Yes", label: "🍽️ Yes" },
                          { value: "No", label: "❌ No" }
                        ]}
                      />
                    </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          {formData.flights.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeFlight(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-2 border-red-300 hover:bg-linear-to-r hover:from-red-50 hover:to-red-100/50 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30 dark:hover:from-red-900/20 dark:hover:to-red-800/10 transition-all duration-300"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Buying Prices</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField label="Currency">
                <Select
                  value={formData.price.buyingCurrency}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, buyingCurrency: e.target.value }
                  })}
                  options={[
                    { value: "PKR", label: "PKR" }
                  ]}
                />
              </FormField>
              <FormField label="Adult Price">
                <Input
                  type="text"
                  value={formData.price.buyingAdultPrice ? formData.price.buyingAdultPrice.toLocaleString() : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, buyingAdultPrice: Number(e.target.value.replace(/,/g, '')) || 0 }
                  })}  placeholder="0"
                />
              </FormField>
              <FormField label="Child Price">
                <Input
                  type="text"
                  value={formData.price.buyingChildPrice ? formData.price.buyingChildPrice.toLocaleString() : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, buyingChildPrice: Number(e.target.value.replace(/,/g, '')) || 0 }
                  })}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Infant Price">
                <Input
                  type="text"
                  value={formData.price.buyingInfantPrice ? formData.price.buyingInfantPrice.toLocaleString() : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, buyingInfantPrice: Number(e.target.value.replace(/,/g, '')) || 0 }
                  })}
                  placeholder="0"
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Selling Prices (B2B)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField label="Currency">
                <Select
                  value={formData.price.sellingCurrencyB2B}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, sellingCurrencyB2B: e.target.value }
                  })}
                  options={[
                    { value: "PKR", label: "PKR" }
                  ]}
                />
              </FormField>
              <FormField label="Adult Price">
                <Input
                  type="text"
                  value={formData.price.sellingAdultPriceB2B ? formData.price.sellingAdultPriceB2B.toLocaleString() : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, sellingAdultPriceB2B: Number(e.target.value.replace(/,/g, '')) || 0 }
                  })}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Child Price">
                <Input
                  type="text"
                  value={formData.price.sellingChildPriceB2B ? formData.price.sellingChildPriceB2B.toLocaleString() : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, sellingChildPriceB2B: Number(e.target.value.replace(/,/g, '')) || 0 }
                  })}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Infant Price">
                <Input
                  type="text"
                  value={formData.price.sellingInfantPriceB2B ? formData.price.sellingInfantPriceB2B.toLocaleString() : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, sellingInfantPriceB2B: Number(e.target.value.replace(/,/g, '')) || 0 }
                  })}
                  placeholder="0"
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Booking & Contact Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField label="PNR">
                <Input
                  type="text"
                  value={formData.pnr}
                  onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                  placeholder="Enter PNR"
                />
              </FormField>
              <FormField label="Contact Phone">
                <Input
                  type="tel"
                  value={formData.contactPersonPhone}
                  onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                  placeholder="Phone Number"
                />
              </FormField>
              <FormField label="Contact Email">
                <Input
                  type="email"
                  value={formData.contactPersonEmail}
                  onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                  placeholder="Email Address"
                />
              </FormField>
              <FormField label="Internal Status">
                <Select
                  value={formData.internalStatus}
                  onChange={(e) => setFormData({ ...formData, internalStatus: e.target.value })}
                  options={[
                    { value: "Public", label: "Public" },
                    { value: "Private", label: "Private" }
                  ]}
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/group-ticketing")}
              className="gap-2 min-w-30"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2 min-w-35 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : editMode ? "Update Booking" : "Create Booking"}
            </Button>
          </div>
        </form>
      </div>
      </PageLayout>
    </>
  );
};

export default GroupTicketingForm;
