import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';

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
        inclusions: [] as string[],
        exclusions: [] as string[],
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
                inclusions: pkg.inclusions || [],
                exclusions: pkg.exclusions || [],
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
                nights: 0
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

    const addInclusion = (inclusion: string) => {
        if (inclusion && !formData.inclusions.includes(inclusion)) {
            setFormData({
                ...formData,
                inclusions: [...formData.inclusions, inclusion]
            });
        }
    };

    const removeInclusion = (inclusion: string) => {
        setFormData({
            ...formData,
            inclusions: formData.inclusions.filter(i => i !== inclusion)
        });
    };

    const addExclusion = (exclusion: string) => {
        if (exclusion && !formData.exclusions.includes(exclusion)) {
            setFormData({
                ...formData,
                exclusions: [...formData.exclusions, exclusion]
            });
        }
    };

    const removeExclusion = (exclusion: string) => {
        setFormData({
            ...formData,
            exclusions: formData.exclusions.filter(e => e !== exclusion)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
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
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Package Name *
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type *
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Umrah">Umrah</option>
                                    <option value="Hajj">Hajj</option>
                                    <option value="Combined">Combined</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Days *
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
                                    Nights *
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Sold Out">Sold Out</option>
                                    <option value="Upcoming">Upcoming</option>
                                </select>
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

                    {/* Accommodation */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Accommodation</h2>
                            <Button type="button" onClick={addAccommodation} className="flex items-center gap-2" size="sm">
                                <Plus size={16} />
                                Add Accommodation
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.accommodation.map((acc, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            City
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                                            value={acc.city}
                                            onChange={(e) => updateAccommodation(index, 'city', e.target.value)}
                                        >
                                            <option value="Makkah">Makkah</option>
                                            <option value="Madinah">Madinah</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Hotel
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                                            value={acc.hotel}
                                            onChange={(e) => updateAccommodation(index, 'hotel', e.target.value)}
                                        >
                                            <option value="">Select Hotel</option>
                                            {hotels
                                                .filter(h => h.location.city === acc.city)
                                                .map(hotel => (
                                                    <option key={hotel._id} value={hotel._id}>
                                                        {hotel.name}
                                                    </option>
                                                ))}
                                        </select>
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
                                    <div className="flex items-end">
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

                    {/* Pricing Tiers */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pricing Tiers</h2>
                            <Button type="button" onClick={addPricing} className="flex items-center gap-2" size="sm">
                                <Plus size={16} />
                                Add Tier
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.pricing.map((pricing, index) => (
                                <div key={index} className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tier Type
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            value={pricing.tierType}
                                            onChange={(e) => {
                                                const newPricing = [...formData.pricing];
                                                newPricing[index].tierType = e.target.value;
                                                setFormData({ ...formData, pricing: newPricing });
                                            }}
                                        >
                                            <option value="Sharing">Sharing</option>
                                            <option value="Quad">Quad</option>
                                            <option value="Triple">Triple</option>
                                            <option value="Double">Double</option>
                                        </select>
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

                    {/* Inclusions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Package Inclusions</h2>
                        
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add inclusion (e.g., Visa, Return Flights)"
                                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            addInclusion(input.value);
                                            input.value = '';
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                {formData.inclusions.map((inclusion, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                    >
                                        <span className="text-gray-900 dark:text-white">{inclusion}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeInclusion(inclusion)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Exclusions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Package Exclusions</h2>
                        
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add exclusion (e.g., Personal expenses)"
                                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            addExclusion(input.value);
                                            input.value = '';
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                {formData.exclusions.map((exclusion, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                    >
                                        <span className="text-gray-900 dark:text-white">{exclusion}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeExclusion(exclusion)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
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
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {editId ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {editId ? 'Update Package' : 'Add Package'}
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
