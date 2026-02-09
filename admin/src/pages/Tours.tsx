import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import PageMeta from '../components/common/PageMeta';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Tour } from '../types';

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
            <PageMeta title="Tour Management | Admin" description="" />
            
            <div className="space-y-6">
                <PageBreadCrumb pageTitle="Tour Management" />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Packages</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage international tour packages
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Tour
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Search tours..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="Group Tour">Group Tour</option>
                                <option value="Private Tour">Private Tour</option>
                                <option value="Honeymoon">Honeymoon</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                <option value="Budget">Budget</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredTours.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No tours found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tour</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destination</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredTours.map((tour) => (
                                        <tr key={tour._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {tour.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {tour.type} • {tour.category}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {tour.destination?.country}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {tour.duration?.days} Days / {tour.duration?.nights} Nights
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                PKR {tour.pricing?.basePrice?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    tour.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {tour.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleView(tour)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(tour)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tour._id)}
                                                        className="text-red-600 hover:text-red-900"
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
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {editingTour ? 'Edit Tour' : 'Add New Tour'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                                    Tour form implementation pending - API integration required
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Modal */}
                {showViewModal && selectedTour && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Tour Details
                                </h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
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
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Tours;
