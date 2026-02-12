import { useState, useEffect } from 'react';
import { X, Save, Plane, Package as PackageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Select } from '../components';

interface Flight {
    _id: string;
    flightNumber: string;
    airline: any;
    sector: any;
    departureCity: string;
    departureDate: string;
    arrivalCity: string;
}

interface Package {
    _id: string;
    name: string;
    type: string;
    duration: { days: number; nights: number };
}

interface FlightPackageFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const FlightPackageForm = ({ onClose, onSuccess, editId }: FlightPackageFormProps) => {
    const [loading, setLoading] = useState(false);
    const [flights, setFlights] = useState<Flight[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    
    const [formData, setFormData] = useState({
        flight: '',
        package: '',
        remainingSlots: 0,
        status: 'Active'
    });

    useEffect(() => {
        fetchFlights();
        fetchPackages();
        if (editId) {
            fetchFlightPackage();
        }
    }, [editId]);

    const fetchFlights = async () => {
        try {
            const response = await axiosInstance.get('/flights');
            setFlights(response.data.flights || []);
        } catch (error) {
            toast.error('Failed to fetch flights');
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await axiosInstance.get('/packages');
            setPackages(response.data.packages || []);
        } catch (error) {
            toast.error('Failed to fetch packages');
        }
    };

    const fetchFlightPackage = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/flight-packages/${editId}`);
            const fp = response.data.flightPackage;
            setFormData({
                flight: fp.flight?._id || fp.flight || '',
                package: fp.package?._id || fp.package || '',
                remainingSlots: fp.remainingSlots || 0,
                status: fp.status || 'Active'
            });
        } catch (error) {
            toast.error('Failed to fetch flight package details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.flight || !formData.package) {
            toast.error('Please select both flight and package');
            return;
        }

        if (formData.remainingSlots < 0) {
            toast.error('Remaining slots cannot be negative');
            return;
        }

        try {
            setLoading(true);
            if (editId) {
                await axiosInstance.put(`/flight-packages/${editId}`, formData);
                toast.success('Flight package link updated successfully');
            } else {
                await axiosInstance.post('/flight-packages', formData);
                toast.success('Flight package link created successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save flight package link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[--z-modal] p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Plane className="w-6 h-6" />
                        {editId ? 'Edit Flight Package Link' : 'Link Package to Flight'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Flight and Package Selection */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            Flight & Package Selection
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Select Flight <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.flight}
                                    onChange={(e) => setFormData({ ...formData, flight: e.target.value })}
                                    disabled={loading}
                                    placeholder="Choose a flight..."
                                    options={[
                                        { value: "", label: "Choose a flight..." },
                                        ...flights.map(flight => ({
                                            value: flight._id,
                                            label: `${flight.flightNumber} - ${flight.airline?.airlineName} • ${flight.sector?.sectorTitle || `${flight.departureCity} to ${flight.arrivalCity}`} • ${new Date(flight.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                        }))
                                    ]}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Select the flight this package will be associated with
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Select Package <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.package}
                                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                                    disabled={loading}
                                    placeholder="Choose a package..."
                                    options={[
                                        { value: "", label: "Choose a package..." },
                                        ...packages.map(pkg => ({
                                            value: pkg._id,
                                            label: `${pkg.name} • ${pkg.type} • ${pkg.duration.days}D/${pkg.duration.nights}N`
                                        }))
                                    ]}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Select the package to link with the flight
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Availability & Status */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <PackageIcon className="w-5 h-5" />
                            Availability & Status
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Remaining Slots <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    value={formData.remainingSlots.toString()}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ ...formData, remainingSlots: parseInt(e.target.value) || 0 })
                                    }
                                    min="0"
                                    placeholder="Number of available seats"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    How many seats are available for this package on this flight?
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    options={[
                                        { value: "Active", label: "Active" },
                                        { value: "Sold Out", label: "Sold Out" },
                                        { value: "Upcoming", label: "Upcoming" },
                                        { value: "Inactive", label: "Inactive" }
                                    ]}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Set the availability status for this flight-package combination
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex gap-3">
                            <div className="shrink-0">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">About Flight Packages</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    This link allows customers to book a specific package on a specific flight. The same package can be linked to multiple flights with different availability and pricing. This will be displayed on the frontend for customers to select their preferred departure.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>{editId ? 'Updating...' : 'Creating...'}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{editId ? 'Update Link' : 'Create Link'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FlightPackageForm;
