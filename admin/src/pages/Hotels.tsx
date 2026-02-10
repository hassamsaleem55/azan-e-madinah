import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import PageMeta from '../components/common/PageMeta';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Hotel } from '../types';import HotelForm from './HotelForm';
const Hotels = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
    const [filters, setFilters] = useState({
        city: '',
        starRating: ''
    });

    useEffect(() => {
        fetchHotels();
    }, [filters]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/hotels', {
                params: filters
            });
            setHotels(response.data.hotels || []);
        } catch (error) {
            toast.error('Failed to fetch hotels');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this hotel?')) return;

        try {
            await axiosInstance.delete(`/hotels/${id}`);
            toast.success('Hotel deleted successfully');
            fetchHotels();
        } catch (error) {
            toast.error('Failed to delete hotel');
            console.error(error);
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        setShowModal(true);
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
        setShowModal(true);
    };

    const handleView = (hotel: Hotel) => {
        setSelectedHotel(hotel);
        setShowViewModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        setEditingId(null);
        fetchHotels();
    };

    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location?.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Hotel Management | Admin" description="" />
            
            <div className="space-y-6">
                <PageBreadCrumb pageTitle="Hotel Management" />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotels</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage hotels in Makkah and Madinah
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Hotel
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Search hotels..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            >
                                <option value="">All Cities</option>
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.starRating}
                                onChange={(e) => setFilters({ ...filters, starRating: e.target.value })}
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Star</option>
                                <option value="4">4 Star</option>
                                <option value="3">3 Star</option>
                                <option value="2">2 Star</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredHotels.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No hotels found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hotel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Distance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredHotels.map((hotel) => (
                                        <tr key={hotel._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {hotel.name}
                                                    </div>
                                                    {hotel.nameArabic && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400" dir="rtl">
                                                            {hotel.nameArabic}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {hotel.location?.city}
                                                </div>
                                                {hotel.location?.district && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {hotel.location.district}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    hotel.category === 'Economy' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                    hotel.category === 'Standard' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    hotel.category === 'Deluxe' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                    hotel.category === 'Premium' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {hotel.category || 'Standard'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(hotel.starRating)].map((_, i) => (
                                                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {hotel.location?.distanceFromHaram}m
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleView(hotel)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(hotel._id)}
                                                        className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(hotel._id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                    <HotelForm
                        onClose={handleModalClose}
                        onSuccess={handleModalSuccess}
                        editId={editingId}
                    />
                )}

                {/* View Modal */}
                {showViewModal && selectedHotel && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Hotel Details
                                </h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Header */}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedHotel.name}</h3>
                                    {selectedHotel.nameArabic && (
                                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1" dir="rtl">{selectedHotel.nameArabic}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1">
                                            {[...Array(selectedHotel.starRating)].map((_, i) => (
                                                <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                            selectedHotel.category === 'Economy' ? 'bg-gray-100 text-gray-800' :
                                            selectedHotel.category === 'Standard' ? 'bg-blue-100 text-blue-800' :
                                            selectedHotel.category === 'Deluxe' ? 'bg-purple-100 text-purple-800' :
                                            selectedHotel.category === 'Premium' ? 'bg-indigo-100 text-indigo-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {selectedHotel.category || 'Standard'}
                                        </span>
                                        {selectedHotel.isFeatured && (
                                            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                ⭐ Featured
                                            </span>
                                        )}
                                        {selectedHotel.services?.shuttleService && (
                                            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                                🚌 Shuttle Service
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">City</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {selectedHotel.location?.city}
                                        </p>
                                        {selectedHotel.location?.district && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedHotel.location.district}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Distance from Haram</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {selectedHotel.location?.distanceFromHaram || 0}m
                                        </p>
                                        {selectedHotel.location?.walkingTime > 0 && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                ~{selectedHotel.location.walkingTime} min walk
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {selectedHotel.location?.address || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedHotel.description && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                                        <p className="text-gray-600 dark:text-gray-400">{selectedHotel.description}</p>
                                    </div>
                                )}

                                {/* Services */}
                                {selectedHotel.services && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Services & Facilities</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {Object.entries(selectedHotel.services)
                                                .filter(([_, value]) => value === true)
                                                .map(([key]) => (
                                                    <div key={key} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900 rounded-lg">
                                                        <span className="text-green-600 dark:text-green-300">✓</span>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Amenities */}
                                {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedHotel.amenities.map((amenity: any, index: number) => {
                                                const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                                                return (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                                    >
                                                        {amenityName}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                {selectedHotel.contact && (selectedHotel.contact.phone || selectedHotel.contact.email || selectedHotel.contact.website) && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedHotel.contact.phone && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">📞</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedHotel.contact.phone}</span>
                                                </div>
                                            )}
                                            {selectedHotel.contact.email && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">✉️</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedHotel.contact.email}</span>
                                                </div>
                                            )}
                                            {selectedHotel.contact.website && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">🌐</span>
                                                    <a href={selectedHotel.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                                        {selectedHotel.contact.website}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Policies */}
                                {selectedHotel.policies && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Hotel Policies</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex gap-4">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Check-in:</span>
                                                <span className="text-gray-600 dark:text-gray-400">{selectedHotel.policies.checkInTime || '14:00'}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Check-out:</span>
                                                <span className="text-gray-600 dark:text-gray-400">{selectedHotel.policies.checkOutTime || '12:00'}</span>
                                            </div>
                                            {selectedHotel.policies.cancellationPolicy && (
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Cancellation Policy:</span>
                                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedHotel.policies.cancellationPolicy}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Hotels;
