import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Package, MapPin, DollarSign, CheckCircle, XCircle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Select } from '../components';

interface Hotel {
    _id: string;
    name: string;
    location: { city: string };
}

interface PackageFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const PackageForm = ({ onClose, onSuccess, editId }: PackageFormProps) => {
    const [loading, setLoading] = useState(false);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    
    const [formData, setFormData] = useState({
        name: '',
        type: 'Umrah',
        description: '',
        duration: {
            days: 0,
            nights: 0
        },
        accommodation: [] as any[],
        pricing: [] as any[],
        inclusions: {
            visa: true,
            insurance: false,
            transport: true,
            accommodation: true,
            ziayarahWithGuide: false,
            returnFlights: true
        },
        status: 'Active',
        featured: false
    });

    useEffect(() => {
        fetchHotels();
        if (editId) {
            fetchPackage();
        }
    }, [editId]);

    const fetchHotels = async () => {
        try {
            const response = await axiosInstance.get('/hotels');
            setHotels(response.data.hotels || []);
        } catch (error) {
            console.error('Failed to fetch hotels');
        }
    };

    const fetchPackage = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/packages/${editId}`);
            const pkg = response.data.package;
            setFormData({
                name: pkg.name || '',
                type: pkg.type || 'Umrah',
                description: pkg.description || '',
                duration: pkg.duration || { days: 0, nights: 0 },
                accommodation: pkg.accommodation || [],
                pricing: pkg.pricing || [],
                inclusions: pkg.inclusions || {
                    visa: true,
                    insurance: false,
                    transport: true,
                    accommodation: true,
                    ziayarahWithGuide: false,
                    returnFlights: true
                },
                status: pkg.status || 'Active',
                featured: pkg.featured || false
            });
        } catch (error) {
            toast.error('Failed to fetch package details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.type || formData.duration.days === 0) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            if (editId) {
                await axiosInstance.put(`/packages/${editId}`, formData);
                toast.success('Package updated successfully');
            } else {
                await axiosInstance.post('/packages', formData);
                toast.success('Package created successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save package');
        } finally {
            setLoading(false);
        }
    };

    const addAccommodation = () => {
        setFormData({
            ...formData,
            accommodation: [...formData.accommodation, {
                city: 'Makkah',
                hotel: '',
                nights: 0,
                shuttleService: false,
                distanceFromHaram: 0
            }]
        });
    };

    const addPricing = () => {
        setFormData({
            ...formData,
            pricing: [...formData.pricing, {
                tierType: 'Quad',
                price: 0
            }]
        });
    };

    const removeAccommodation = (index: number) => {
        setFormData({
            ...formData,
            accommodation: formData.accommodation.filter((_, i) => i !== index)
        });
    };

    const updateAccommodation = (index: number, field: string, value: any) => {
        const newAccommodation = [...formData.accommodation];
        newAccommodation[index] = { ...newAccommodation[index], [field]: value };
        setFormData({ ...formData, accommodation: newAccommodation });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1050] p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {editId ? 'Edit Package' : 'Add New Package'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Basic Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Package Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g., 15 Days Umrah Package"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    options={[
                                        { value: "Umrah", label: "Umrah" },
                                        { value: "Hajj", label: "Hajj" },
                                        { value: "Combined", label: "Combined" }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Days <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    value={formData.duration.days.toString()}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ 
                                            ...formData, 
                                            duration: { ...formData.duration, days: parseInt(e.target.value) || 0 }
                                        })
                                    }
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nights <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    value={formData.duration.nights.toString()}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({ 
                                            ...formData, 
                                            duration: { ...formData.duration, nights: parseInt(e.target.value) || 0 }
                                        })
                                    }
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    options={[
                                        { value: "Active", label: "Active" },
                                        { value: "Inactive", label: "Inactive" },
                                        { value: "Sold Out", label: "Sold Out" },
                                        { value: "Upcoming", label: "Upcoming" }
                                    ]}
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    Featured Package
                                </label>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Package description..."
                            />
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Accommodation
                            </h3>
                            <Button type="button" onClick={addAccommodation} className="flex items-center gap-2" size="sm">
                                <Plus size={16} />
                                Add Accommodation
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.accommodation.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No accommodation added yet</p>
                                </div>
                            )}
                            {formData.accommodation.map((acc, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            City
                                        </label>
                                        <Select
                                            value={acc.city}
                                            onChange={(e) => updateAccommodation(index, 'city', e.target.value)}
                                            options={[
                                                { value: "Makkah", label: "Makkah" },
                                                { value: "Madinah", label: "Madinah" }
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Hotel
                                        </label>
                                        <Select
                                            value={acc.hotel}
                                            onChange={(e) => updateAccommodation(index, 'hotel', e.target.value)}
                                            placeholder="Select Hotel"
                                            options={[
                                                { value: "", label: "Select Hotel" },
                                                ...hotels
                                                    .filter(h => h.location.city === acc.city)
                                                    .map(hotel => ({
                                                        value: hotel._id,
                                                        label: hotel.name
                                                    }))
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nights
                                        </label>
                                        <Input
                                            type="number"
                                            value={acc.nights?.toString() || '0'}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                updateAccommodation(index, 'nights', parseInt(e.target.value) || 0)
                                            }
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Distance (meters)
                                        </label>
                                        <Input
                                            type="number"
                                            value={acc.distanceFromHaram?.toString() || '0'}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                updateAccommodation(index, 'distanceFromHaram', parseInt(e.target.value) || 0)
                                            }
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={acc.shuttleService || false}
                                                onChange={(e) => updateAccommodation(index, 'shuttleService', e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            Shuttle Service
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => removeAccommodation(index)}
                                            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} className="mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Pricing Tiers
                            </h3>
                            <Button type="button" onClick={addPricing} className="flex items-center gap-2" size="sm">
                                <Plus size={16} />
                                Add Tier
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.pricing.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No pricing tiers added yet</p>
                                </div>
                            )}
                            {formData.pricing.map((pricing, index) => (
                                <div key={index} className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tier Type
                                        </label>
                                        <Select
                                            value={pricing.tierType}
                                            onChange={(e) => {
                                                const newPricing = [...formData.pricing];
                                                newPricing[index].tierType = e.target.value;
                                                setFormData({ ...formData, pricing: newPricing });
                                            }}
                                            options={[
                                                { value: "Sharing", label: "Sharing" },
                                                { value: "Quad", label: "Quad" },
                                                { value: "Triple", label: "Triple" },
                                                { value: "Double", label: "Double" }
                                            ]}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Price (PKR)
                                        </label>
                                        <Input
                                            type="number"
                                            value={pricing.price.toString()}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const newPricing = [...formData.pricing];
                                                newPricing[index].price = parseInt(e.target.value) || 0;
                                                setFormData({ ...formData, pricing: newPricing });
                                            }}
                                            min="0"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                pricing: formData.pricing.filter((_, i) => i !== index)
                                            });
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Package Inclusions
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select what's included in this package</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.inclusions.visa}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        inclusions: { ...formData.inclusions, visa: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.inclusions.insurance}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        inclusions: { ...formData.inclusions, insurance: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.inclusions.transport}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        inclusions: { ...formData.inclusions, transport: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transport</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.inclusions.accommodation}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        inclusions: { ...formData.inclusions, accommodation: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Accommodation</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.inclusions.ziayarahWithGuide}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        inclusions: { ...formData.inclusions, ziayarahWithGuide: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ziarah with Guide</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.inclusions.returnFlights}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        inclusions: { ...formData.inclusions, returnFlights: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Return Flights</span>
                            </label>
                        </div>
                    </div>

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
                            className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>{editId ? 'Updating...' : 'Creating...'}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{editId ? 'Update Package' : 'Create Package'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PackageForm;
