import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Tour } from '../types';
import {
  PageMeta,
  PageLayout,
  PageHeader,
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

const Tours = () => {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingTour, setEditingTour] = useState<Tour | null>(null);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        status: ''
    });

    useEffect(() => {
        fetchTours();
    }, [filters]);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/tours', {
                params: filters
            });
            setTours(response.data.tours || []);
        } catch (error) {
            toast.error('Failed to fetch tours');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this tour?')) return;

        try {
            await axiosInstance.delete(`/tours/${id}`);
            toast.success('Tour deleted successfully');
            fetchTours();
        } catch (error) {
            toast.error('Failed to delete tour');
            console.error(error);
        }
    };

    const handleCreate = () => {
        setEditingTour(null);
        setShowModal(true);
    };

    const handleEdit = (tour: Tour) => {
        setEditingTour(tour);
        setShowModal(true);
    };

    const handleView = (tour: Tour) => {
        setSelectedTour(tour);
        setShowViewModal(true);
    };

    const filteredTours = tours.filter(tour =>
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.destination?.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Tour Management | Admin" description="Manage international tour packages" />
            
            <PageLayout>
                <PageHeader
                    title="Tour Packages"
                    description="Manage international tour packages"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Tour Management' },
                    ]}
                    actions={
                        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                            Add Tour
                        </Button>
                    }
                />

                <FilterBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search tours..."
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Type">
                                <Select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    options={[
                                        { value: 'Group Tour', label: 'Group Tour' },
                                        { value: 'Private Tour', label: 'Private Tour' },
                                        { value: 'Honeymoon', label: 'Honeymoon' },
                                    ]}
                                    placeholder="All Types"
                                />
                            </FormField>
                            <FormField label="Category">
                                <Select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    options={[
                                        { value: 'Budget', label: 'Budget' },
                                        { value: 'Luxury', label: 'Luxury' },
                                        { value: 'Premium', label: 'Premium' },
                                    ]}
                                    placeholder="All Categories"
                                />
                            </FormField>
                            <FormField label="Status">
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    options={[
                                        { value: 'Active', label: 'Active' },
                                        { value: 'Inactive', label: 'Inactive' },
                                    ]}
                                    placeholder="All Status"
                                />
                            </FormField>
                        </div>
                    }
                />

                {loading ? (
                    <LoadingState />
                ) : filteredTours.length === 0 ? (
                    <EmptyState
                        title="No tours found"
                        description="Get started by adding your first tour package"
                        action={
                            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                                Add Tour
                            </Button>
                        }
                    />
                ) : (
                    <DataTable
                        columns={[
                            {
                                key: 'tour',
                                header: 'Tour',
                                render: (tour: Tour) => (
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {tour.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {tour.type} • {tour.category}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'destination',
                                header: 'Destination',
                                render: (tour: Tour) => (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {tour.destination?.country}
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                key: 'duration',
                                header: 'Duration',
                                render: (tour: Tour) => (
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {tour.duration?.days} Days / {tour.duration?.nights} Nights
                                    </span>
                                ),
                            },
                            {
                                key: 'price',
                                header: 'Price',
                                render: (tour: Tour) => (
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        PKR {tour.pricing?.basePrice?.toLocaleString()}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (tour: Tour) => (
                                    <Badge color={tour.status === 'Active' ? 'success' : 'light'}>
                                        {tour.status}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'actions',
                                header: 'Actions',
                                render: (tour: Tour) => (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleView(tour)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                                            title="View"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(tour)}
                                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tour._id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        data={filteredTours}
                        keyExtractor={(tour) => tour._id}
                    />
                )}

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingTour ? 'Edit Tour' : 'Add New Tour'}
                    size="lg"
                >
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                            Tour form implementation pending - API integration required
                        </p>
                    </div>
                </Modal>

                {/* View Modal */}
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="Tour Details"
                    size="lg"
                >
                    {selectedTour && (
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTour.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedTour.destination?.country || 'N/A'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                                    <p className="text-gray-900 dark:text-white">
                                        {selectedTour.duration?.days} Days / {selectedTour.duration?.nights} Nights
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                                    <p className="text-gray-900 dark:text-white">{selectedTour.status}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </PageLayout>
        </>
    );
};

export default Tours;
