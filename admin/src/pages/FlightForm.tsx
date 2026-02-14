import { useState, useEffect } from 'react';
import { X, Plane, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Input, Select } from '../components';

interface FlightFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const FlightForm = ({ onClose, onSuccess, editId }: FlightFormProps) => {
    const [loading, setLoading] = useState(false);
    const [airlines, setAirlines] = useState<any[]>([]);
    const [sectors, setSectors] = useState<any[]>([]);

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
        fetchAirlines();
        fetchSectors();
        if (editId) {
            fetchFlight();
        }
    }, [editId]);

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

    const fetchFlight = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/flights/${editId}`);
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
        } catch (error) {
            toast.error('Failed to fetch flight details');
        } finally {
            setLoading(false);
        }
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
            setLoading(true);
            if (editId) {
                await axiosInstance.put(`/flights/${editId}`, formData);
                toast.success('Flight updated successfully');
            } else {
                await axiosInstance.post('/flights', formData);
                toast.success('Flight created successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save flight');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Plane className="w-6 h-6" />
                        {editId ? 'Edit Flight' : 'Add New Flight'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Flight Information */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            Flight Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Flight Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.flightNumber}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })
                                    }
                                    placeholder="e.g., PK-725"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Airline <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.airline}
                                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                                    options={airlines.map(a => ({ value: a._id, label: a.airlineName }))}
                                    placeholder="Select Airline"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sector <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.sector}
                                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                    options={sectors.map(s => ({ value: s._id, label: `${s.sectorTitle} - ${s.fullSector}` }))}
                                    placeholder="Select Sector"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Departure Details */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Departure Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Departure City <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.departureCity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ ...formData, departureCity: e.target.value })
                                    }
                                    placeholder="e.g., Lahore"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Departure Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.departureDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            setFormData({ ...formData, departureDate: e.target.value })
                                        }
                                        required
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Departure Time <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="time"
                                        value={formData.departureTime}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            setFormData({ ...formData, departureTime: e.target.value })
                                        }
                                        required
                                    />
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Arrival Details */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Arrival Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Arrival City <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.arrivalCity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ ...formData, arrivalCity: e.target.value })
                                    }
                                    placeholder="e.g., Jeddah"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Arrival Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.arrivalDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            setFormData({ ...formData, arrivalDate: e.target.value })
                                        }
                                        required
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Arrival Time <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="time"
                                        value={formData.arrivalTime}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            setFormData({ ...formData, arrivalTime: e.target.value })
                                        }
                                        required
                                    />
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-3 sm:px-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all touch-manipulation"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-5 py-3 sm:px-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Plane className="w-5 h-5" />
                                    <span>{editId ? 'Update Flight' : 'Add Flight'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FlightForm;
