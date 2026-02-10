import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, Plane, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import PageMeta from '../components/common/PageMeta';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './flights-datepicker.css';

interface Flight {
    _id: string;
    flightNumber: string;
    airline: any;
    sector: any;
    departureCity: string;
    departureDate: string;
    departureTime: string;
    arrivalCity: string;
    arrivalDate: string;
    arrivalTime: string;
    createdAt: string;
}

const Flights = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [airlines, setAirlines] = useState<any[]>([]);
    const [sectors, setSectors] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        airline: '',
        date: ''
    });

    const [formData, setFormData] = useState({
        flightNumber: '',
        airline: '',
        sector: '',
        departureCity: '',
        departureDate: '',
        departureTime: '',
        arrivalCity: '',
        arrivalDate: '',
        arrivalTime: ''
    });

    useEffect(() => {
        fetchFlights();
        fetchAirlines();
        fetchSectors();
    }, [filters]);

    const fetchFlights = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/flights', {
                params: filters
            });
            setFlights(response.data.flights || []);
        } catch (error) {
            toast.error('Failed to fetch flights');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAirlines = async () => {
        try {
            const response = await axiosInstance.get('/airline');
            setAirlines(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch airlines');
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await axiosInstance.get('/sector');
            setSectors(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch sectors');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this flight?')) return;

        try {
            await axiosInstance.delete(`/flights/${id}`);
            toast.success('Flight deleted successfully');
            fetchFlights();
        } catch (error) {
            toast.error('Failed to delete flight');
            console.error(error);
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            flightNumber: '',
            airline: '',
            sector: '',
            departureCity: '',
            departureDate: '',
            departureTime: '',
            arrivalCity: '',
            arrivalDate: '',
            arrivalTime: ''
        });
        setShowModal(true);
    };

    const handleEdit = async (id: string) => {
        try {
            const response = await axiosInstance.get(`/flights/${id}`);
            const flight = response.data.flight;
            setFormData({
                flightNumber: flight.flightNumber || '',
                airline: flight.airline?._id || '',
                sector: flight.sector?._id || '',
                departureCity: flight.departureCity || '',
                departureDate: flight.departureDate?.split('T')[0] || '',
                departureTime: flight.departureTime || '',
                arrivalCity: flight.arrivalCity || '',
                arrivalDate: flight.arrivalDate?.split('T')[0] || '',
                arrivalTime: flight.arrivalTime || ''
            });
            setEditingId(id);
            setShowModal(true);
        } catch (error) {
            toast.error('Failed to fetch flight details');
        }
    };

    const handleView = (flight: Flight) => {
        setSelectedFlight(flight);
        setShowViewModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.flightNumber || !formData.airline || !formData.sector || 
            !formData.departureCity || !formData.departureDate || !formData.departureTime ||
            !formData.arrivalCity || !formData.arrivalDate || !formData.arrivalTime) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            if (editingId) {
                await axiosInstance.put(`/flights/${editingId}`, formData);
                toast.success('Flight updated successfully');
            } else {
                await axiosInstance.post('/flights', formData);
                toast.success('Flight created successfully');
            }
            setShowModal(false);
            fetchFlights();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save flight');
        }
    };

    const filteredFlights = flights.filter(flight =>
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.airline?.airlineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.sector?.sectorTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Flight Management | Admin" description="" />
            
            <div className="space-y-6">
                <PageBreadCrumb pageTitle="Flight Management" />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Plane size={24} />
                            Flights
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage flight schedules and availability
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Flight
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Search flights..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.airline}
                                onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
                            >
                                <option value="">All Airlines</option>
                                {airlines.map(airline => (
                                    <option key={airline._id} value={airline._id}>{airline.airlineName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <DatePicker
                                selected={filters.date ? new Date(filters.date) : null}
                                onChange={(date: Date | null) => {
                                    setFilters({ 
                                        ...filters, 
                                        date: date ? date.toISOString().split('T')[0] : '' 
                                    });
                                }}
                                dateFormat="MMMM d, yyyy"
                                placeholderText="Filter by date"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                wrapperClassName="w-full"
                                isClearable
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredFlights.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No flights found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Flight
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Sector
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Departure
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Arrival
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredFlights.map((flight) => (
                                        <tr key={flight._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {flight.flightNumber}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {flight.airline?.airlineName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {flight.sector?.sectorTitle}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {flight.departureCity}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(flight.departureDate).toLocaleDateString()} {flight.departureTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {flight.arrivalCity}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(flight.arrivalDate).toLocaleDateString()} {flight.arrivalTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleView(flight)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(flight._id)}
                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(flight._id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {editingId ? 'Edit Flight' : 'Add New Flight'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Flight Number *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.flightNumber}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                setFormData({ ...formData, flightNumber: e.target.value })
                                            }
                                            placeholder="e.g., PK-725"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Airline *
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            value={formData.airline}
                                            onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                                        >
                                            <option value="">Select Airline</option>
                                            {airlines.map(airline => (
                                                <option key={airline._id} value={airline._id}>{airline.airlineName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sector *
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            value={formData.sector}
                                            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                        >
                                            <option value="">Select Sector</option>
                                            {sectors.map(sector => (
                                                <option key={sector._id} value={sector._id}>
                                                    {sector.sectorTitle} - {sector.fullSector}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Departure City *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.departureCity}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                setFormData({ ...formData, departureCity: e.target.value })
                                            }
                                            placeholder="e.g., Lahore"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Departure Date *
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={formData.departureDate ? new Date(formData.departureDate) : null}
                                                onChange={(date: Date | null) => {
                                                    setFormData({ 
                                                        ...formData, 
                                                        departureDate: date ? date.toISOString().split('T')[0] : '' 
                                                    });
                                                }}
                                                dateFormat="MMMM d, yyyy"
                                                minDate={new Date()}
                                                placeholderText="Select departure date"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                                wrapperClassName="w-full"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Departure Time *
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={formData.departureTime ? new Date(`2000-01-01T${formData.departureTime}`) : null}
                                                onChange={(date: Date | null) => {
                                                    if (date) {
                                                        const hours = date.getHours().toString().padStart(2, '0');
                                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                                        setFormData({ ...formData, departureTime: `${hours}:${minutes}` });
                                                    } else {
                                                        setFormData({ ...formData, departureTime: '' });
                                                    }
                                                }}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                timeCaption="Time"
                                                dateFormat="h:mm aa"
                                                placeholderText="Select departure time"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                                wrapperClassName="w-full"
                                            />
                                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Arrival City *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.arrivalCity}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                setFormData({ ...formData, arrivalCity: e.target.value })
                                            }
                                            placeholder="e.g., Jeddah"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Arrival Date *
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={formData.arrivalDate ? new Date(formData.arrivalDate) : null}
                                                onChange={(date: Date | null) => {
                                                    setFormData({ 
                                                        ...formData, 
                                                        arrivalDate: date ? date.toISOString().split('T')[0] : '' 
                                                    });
                                                }}
                                                dateFormat="MMMM d, yyyy"
                                                minDate={formData.departureDate ? new Date(formData.departureDate) : new Date()}
                                                placeholderText="Select arrival date"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                                wrapperClassName="w-full"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Arrival Time *
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={formData.arrivalTime ? new Date(`2000-01-01T${formData.arrivalTime}`) : null}
                                                onChange={(date: Date | null) => {
                                                    if (date) {
                                                        const hours = date.getHours().toString().padStart(2, '0');
                                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                                        setFormData({ ...formData, arrivalTime: `${hours}:${minutes}` });
                                                    } else {
                                                        setFormData({ ...formData, arrivalTime: '' });
                                                    }
                                                }}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                timeCaption="Time"
                                                dateFormat="h:mm aa"
                                                placeholderText="Select arrival time"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                                wrapperClassName="w-full"
                                            />
                                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {editingId ? 'Update Flight' : 'Add Flight'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Modal */}
                {showViewModal && selectedFlight && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Flight Details
                                </h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedFlight.flightNumber}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {selectedFlight.airline?.airlineName}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sector</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedFlight.sector?.fullSector}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Plane className="w-5 h-5" />
                                            Departure
                                        </h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {selectedFlight.departureCity}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {new Date(selectedFlight.departureDate).toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {selectedFlight.departureTime}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Plane className="w-5 h-5 rotate-90" />
                                            Arrival
                                        </h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {selectedFlight.arrivalCity}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {new Date(selectedFlight.arrivalDate).toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {selectedFlight.arrivalTime}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Flights;
