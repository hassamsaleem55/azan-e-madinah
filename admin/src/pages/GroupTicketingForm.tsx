import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AsyncSelect from "react-select/async";
import { Plane, Calendar, Users, DollarSign, Mail, Phone, FileText, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
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

  // Custom select styles
  const getCustomSelectStyles = (hasError: boolean = false) => ({
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "36px",
      height: "36px",
      fontSize: "0.75rem",
      borderColor: hasError ? "red" : provided.borderColor,
      boxShadow: hasError ? "0 0 0 1px red" : state.isFocused ? provided.boxShadow : "none",
      borderRadius: ".375rem",
      "&:hover": {
        borderColor: hasError ? "red" : provided.borderColor,
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
    input: (provided: any) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
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
          // {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //     "Content-Type": "application/json",
          //   },
          // }
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
        <div className="flex items-center justify-between mb-6">
          <PageHeader
            title={editMode ? "Edit Group Booking" : "Create Group Booking"}
            description={editMode ? "Update group ticketing details" : "Add new airline group booking"}
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Group Ticketing", path: "/group-ticketing" },
              { label: editMode ? "Edit" : "Create" }
            ]}
          />
          <Button
            variant="outline"
            onClick={() => navigate("/group-ticketing")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Basic Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <select
                  value={formData.sector}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      sector: e.target.value
                    });
                  }}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Select Sector</option>
                  {sectors.map((sector) => (
                    <option key={sector._id} value={sector.sectorTitle}>
                      {sector.sectorTitle} - {sector.fullSector}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Group Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Airline">
                <select
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
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Select Airline</option>
                  {airlines.map((airline) => (
                    <option key={airline._id} value={airline.airlineName}>
                      {airline.airlineName} ({airline.shortCode})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Group Category" required>
                <select
                  required
                  value={formData.groupCategory}
                  onChange={(e) => setFormData({ ...formData, groupCategory: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Select Group Category</option>
                  <option value="UAE Groups">UAE Groups</option>
                  <option value="KSA Groups">KSA Groups</option>
                  <option value="Bahrain Groups">Bahrain Groups</option>
                  <option value="Mascat Groups">Mascat Groups</option>
                  <option value="Qatar Groups">Qatar Groups</option>
                  <option value="UK Groups">UK Groups</option>
                  <option value="Umrah Groups">Umrah Groups</option>
                </select>
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

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showSeat}
                  onChange={(e) => setFormData({ ...formData, showSeat: e.target.checked })}
                  className="w-10 h-6 appearance-none bg-gray-300 rounded-full relative cursor-pointer transition-colors checked:bg-blue-600 before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-4 before:shadow-md"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Show Available Seats</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Flight Details</h4>
              </div>
              <button
                type="button"
                onClick={addFlight}
                className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-green-500/30 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Flight
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Flight#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Dep Date</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Dep Time</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Sector From</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">From Terminal</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Sector To</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">To Terminal</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Class</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Arr Date</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Arr Time</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Baggage</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Meal</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {formData.flights.map((flight, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        required
                        value={flight.flightNo}
                        onChange={(e) => updateFlight(index, "flightNo", e.target.value)}
                        className="w-full min-w-[80px] h-9 rounded-lg border border-gray-300 px-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="date"
                        required
                        value={flight.depDate}
                        onChange={(e) => updateFlight(index, "depDate", e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className="w-full min-w-[140px] h-9 px-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="time"
                        required
                        value={flight.depTime}
                        onChange={(e) => updateFlight(index, "depTime", e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className="w-full min-w-[120px] h-9 px-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={cityOptions}
                        loadOptions={loadCityOptions}
                        styles={getCustomSelectStyles()}
                        value={cityOptions.find((opt) => opt.value === flight.sectorFrom) || null}
                        onChange={(option: any) => updateFlight(index, "sectorFrom", option?.value || "")}
                        placeholder="Select city"
                        className="min-w-[150px]"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={flight.fromTerminal}
                        onChange={(e) => updateFlight(index, "fromTerminal", e.target.value)}
                        placeholder="Terminal"
                        className="w-full min-w-[80px] h-9 rounded-lg border border-gray-300 px-2 text-xs outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={cityOptions}
                        loadOptions={loadCityOptions}
                        styles={getCustomSelectStyles()}
                        value={cityOptions.find((opt) => opt.value === flight.sectorTo) || null}
                        onChange={(option: any) => updateFlight(index, "sectorTo", option?.value || "")}
                        placeholder="Select city"
                        className="min-w-[150px]"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={flight.toTerminal}
                        onChange={(e) => updateFlight(index, "toTerminal", e.target.value)}
                        placeholder="Terminal"
                        className="w-full min-w-[80px] h-9 rounded-lg border border-gray-300 px-2 text-xs outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={flight.flightClass}
                        onChange={(e) => updateFlight(index, "flightClass", e.target.value)}
                        className="w-full min-w-[100px] h-9 rounded-lg border border-gray-300 px-2 text-xs outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="">Select</option>
                        <option value="Economy">Economy</option>
                        <option value="Business">Business</option>
                        <option value="First">First</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="date"
                        required
                        value={flight.arrDate}
                        onChange={(e) => updateFlight(index, "arrDate", e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className="w-full min-w-[140px] h-9 px-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="time"
                        required
                        value={flight.arrTime}
                        onChange={(e) => updateFlight(index, "arrTime", e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className="w-full min-w-[120px] h-9 px-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={flight.baggage}
                        onChange={(e) => updateFlight(index, "baggage", e.target.value)}
                        placeholder="e.g., 30kg"
                        className="w-full min-w-[80px] h-9 rounded-lg border border-gray-300 px-2 text-xs outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={flight.meal}
                        onChange={(e) => updateFlight(index, "meal", e.target.value)}
                        className="w-full min-w-[100px] h-9 rounded-lg border border-gray-300 px-2 text-xs outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                      <td className="px-3 py-3">
                        {formData.flights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFlight(index)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Buying Prices</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Currency">
                <select
                  value={formData.price.buyingCurrency}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, buyingCurrency: e.target.value }
                  })}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="PKR">PKR</option>
                </select>
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

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Selling Prices (B2B)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Currency">
                <select
                  value={formData.price.sellingCurrencyB2B}
                  onChange={(e) => setFormData({
                    ...formData,
                    price: { ...formData.price, sellingCurrencyB2B: e.target.value }
                  })}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="PKR">PKR</option>
                </select>
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

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Booking & Contact Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <select
                  value={formData.internalStatus}
                  onChange={(e) => setFormData({ ...formData, internalStatus: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </FormField>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/group-ticketing")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
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
