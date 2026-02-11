import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Star, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Hotel } from '../types';
import HotelForm from './HotelForm';
import {
  PageMeta,
  PageLayout,
  PageHeader,
  PageContent,
  PageContentSection,
  FilterBar,
  Button,
  Badge,
  Modal,
  DataTable,
  LoadingState,
  EmptyState,
  FormField,
  Select,
} from '../components';
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
            <PageMeta title="Hotel Management | Admin" description="Manage hotels in Makkah and Madinah" />
            
            <PageLayout>
                <PageHeader
                    title="Hotels"
                    description="Manage hotels in Makkah and Madinah"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Hotels' },
                    ]}
                    actions={
                        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                            Add Hotel
                        </Button>
                    }
                />

                <FilterBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search hotels by name or city..."
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Filter by City">
                                <Select
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    options={[
                                        { value: 'Makkah', label: 'Makkah' },
                                        { value: 'Madinah', label: 'Madinah' },
                                    ]}
                                    placeholder="All Cities"
                                />
                            </FormField>
                            <FormField label="Filter by Rating">
                                <Select
                                    value={filters.starRating}
                                    onChange={(e) => setFilters({ ...filters, starRating: e.target.value })}
                                    options={[
                                        { value: '5', label: '5 Star' },
                                        { value: '4', label: '4 Star' },
                                        { value: '3', label: '3 Star' },
                                        { value: '2', label: '2 Star' },
                                    ]}
                                    placeholder="All Ratings"
                                />
                            </FormField>
                        </div>
                    }
                    showFilters={true}
                />

                <PageContent>
                    <PageContentSection noPadding>
                        {loading ? (
                            <LoadingState message="Loading hotels..." />
                        ) : filteredHotels.length === 0 ? (
                            <EmptyState
                                icon={<Building2 className="w-16 h-16" />}
                                title="No hotels found"
                                description="Try adjusting your search or filters, or add a new hotel."
                                action={
                                    <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                                        Add First Hotel
                                    </Button>
                                }
                            />
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        key: 'hotel',
                                        header: 'Hotel',
                                        render: (hotel: Hotel) => (
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {hotel.name}
                                                </div>
                                                {hotel.nameArabic && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400" dir="rtl">
                                                        {hotel.nameArabic}
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    },
                                    {
                                        key: 'location',
                                        header: 'Location',
                                        render: (hotel: Hotel) => (
                                            <span className="text-sm">{hotel.location?.city}</span>
                                        ),
                                    },
                                    {
                                        key: 'category',
                                        header: 'Category',
                                        render: (hotel: Hotel) => (
                                            <Badge
                                                color={
                                                    hotel.category === 'Economy' ? 'light' :
                                                    hotel.category === 'Standard' ? 'info' :
                                                    hotel.category === 'Deluxe' ? 'primary' :
                                                    hotel.category === 'Premium' ? 'success' : 'warning'
                                                }
                                            >
                                                {hotel.category || 'Standard'}
                                            </Badge>
                                        ),
                                    },
                                    {
                                        key: 'rating',
                                        header: 'Rating',
                                        render: (hotel: Hotel) => (
                                            <div className="flex items-center gap-1">
                                                {[...Array(hotel.starRating)].map((_, i) => (
                                                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        ),
                                    },
                                    {
                                        key: 'distance',
                                        header: 'Distance from Haram',
                                        render: (hotel: Hotel) => (
                                            <span className="text-sm">{hotel.location?.distanceFromHaram}m</span>
                                        ),
                                    },
                                    {
                                        key: 'actions',
                                        header: 'Actions',
                                        align: 'center',
                                        render: (hotel: Hotel) => (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(hotel)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(hotel._id)}
                                                    className="p-2 text-warning-600 hover:bg-warning-50 dark:text-warning-400 dark:hover:bg-warning-900/20 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(hotel._id)}
                                                    className="p-2 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ),
                                    },
                                ]}
                                data={filteredHotels}
                                keyExtractor={(hotel) => hotel._id}
                                hover
                            />
                        )}
                    </PageContentSection>
                </PageContent>

                {/* Create/Edit Modal */}
                {showModal && (
                    <HotelForm
                        onClose={handleModalClose}
                        onSuccess={handleModalSuccess}
                        editId={editingId}
                    />
                )}

                {/* View Modal */}
                {selectedHotel && (
                    <Modal
                        isOpen={showViewModal}
                        onClose={() => setShowViewModal(false)}
                        title="Hotel Details"
                        size="xl"
                    >
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedHotel.name}</h3>
                                {selectedHotel.nameArabic && (
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1" dir="rtl">{selectedHotel.nameArabic}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1">
                                        {[...Array(selectedHotel.starRating)].map((_, i) => (
                                            <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <Badge color={selectedHotel.category === 'Premium' ? 'success' : 'info'}>
                                        {selectedHotel.category || 'Standard'}
                                    </Badge>
                                    {selectedHotel.isFeatured && (
                                        <Badge color="warning">⭐ Featured</Badge>
                                    )}
                                    {selectedHotel.services?.shuttleService && (
                                        <Badge color="info">🚌 Shuttle Service</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">City</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                        {selectedHotel.location?.city}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Distance from Haram</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
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
                                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                                        {selectedHotel.location?.address || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedHotel.description && (
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedHotel.description}</p>
                                </div>
                            )}

                            {/* Services */}
                            {selectedHotel.services && (
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Services & Facilities</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {Object.entries(selectedHotel.services)
                                            .filter(([_, value]) => value === true)
                                            .map(([key]) => (
                                                <div key={key} className="flex items-center gap-2 p-2 bg-success-50 dark:bg-success-900/20 rounded-lg">
                                                    <span className="text-success-600 dark:text-success-400">✓</span>
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
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Amenities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHotel.amenities.map((amenity: any, index: number) => {
                                            const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                                            return (
                                                <Badge key={index} color="light">
                                                    {amenityName}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Contact Information */}
                            {selectedHotel.contact && (selectedHotel.contact.phone || selectedHotel.contact.email || selectedHotel.contact.website) && (
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {selectedHotel.contact.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span>📞</span>
                                                <span className="text-gray-700 dark:text-gray-300">{selectedHotel.contact.phone}</span>
                                            </div>
                                        )}
                                        {selectedHotel.contact.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span>✉️</span>
                                                <span className="text-gray-700 dark:text-gray-300">{selectedHotel.contact.email}</span>
                                            </div>
                                        )}
                                        {selectedHotel.contact.website && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span>🌐</span>
                                                <a href={selectedHotel.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    Website
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Policies */}
                            {selectedHotel.policies && (
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Hotel Policies</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex gap-4">
                                            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">Check-in:</span>
                                            <span className="text-gray-600 dark:text-gray-400">{selectedHotel.policies.checkInTime || '14:00'}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">Check-out:</span>
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
                    </Modal>
                )}
            </PageLayout>
        </>
    );
};

export default Hotels;
