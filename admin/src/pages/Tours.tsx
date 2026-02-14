import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import axiosInstance from '../Api/axios';
import { Tour } from '../types';
import {
  PageMeta,
  PageLayout,
  PageHeader,
  PageContent,
  PageContentSection,
  Button,
  LoadingState,
  EmptyState,
} from '../components';

const Tours = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const categories = [
        'All',
        'Summer Special',
        'Winter Special',
        'Honeymoon Special',
        'Budget',
        'Luxury'
    ];

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/tours');
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
        navigate('/tours/new');
    };

    const handleEdit = (tour: Tour, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/tours/edit/${tour._id}`);
    };

    const handleView = (tour: Tour) => {
        navigate(`/tours/${tour._id}`);
    };

    const handleCardClick = (tour: Tour) => {
        navigate(`/tours/${tour._id}`);
    };

    const filteredTours = tours.filter(tour => {
        const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.destination?.country.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = activeCategory === 'All' || 
            tour.seasonalCategory === activeCategory ||
            tour.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

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

                <PageContent>
                    <PageContentSection>
                        {/* Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search tours by name or destination..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-6 py-2 rounded-full font-medium transition-all ${
                                            activeCategory === category
                                                ? 'bg-linear-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tour Cards Grid */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTours.map((tour) => (
                                    <div
                                        key={tour._id}
                                        onClick={() => handleCardClick(tour)}
                                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer hover:border-brand-500 dark:hover:border-brand-400"
                                    >
                                {/* Tour Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={tour.images?.[0]?.url || '/placeholder-tour.jpg'}
                                        alt={tour.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {tour.category}
                                    </div>
                                </div>

                                {/* Tour Content */}
                                <div className="p-5">
                                    {/* Tour Name */}
                                    <h3 className="text-lg font-bold text-brand-600 dark:text-brand-400 mb-2 line-clamp-2">
                                        {tour.name}
                                    </h3>

                                    {/* Destination */}
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                                        <MapPin size={16} />
                                        <span className="text-sm font-medium">{tour.destination?.country}</span>
                                    </div>

                                    {/* Duration & Type */}
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                                        <Calendar size={16} />
                                        <span className="text-sm">
                                            {tour.duration?.days} Days • {tour.type}
                                        </span>
                                    </div>

                                    {/* Rating */}
                                    {tour.reviews && tour.reviews.averageRating > 0 && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {tour.reviews.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                ({tour.reviews.totalReviews})
                                            </span>
                                        </div>
                                    )}

                                    {/* Price & Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">From</div>
                                            <div className="text-xl font-bold text-brand-600 dark:text-brand-400">
                                                PKR {tour.pricing?.basePrice?.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleEdit(tour, e)}
                                                className="p-2 text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(tour._id); }}
                                                className="p-2 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                                ))}
                            </div>
                        )}
                    </PageContentSection>
                </PageContent>
            </PageLayout>
        </>
    );
};

export default Tours;
