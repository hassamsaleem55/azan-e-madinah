import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Star, Search } from 'lucide-react';
import tourApi from '../../../api/tourApi';
import './TourPackages.css';

const TourPackages = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        destination: ''
    });

    useEffect(() => {
        fetchTours();
    }, [filters]);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const data = await tourApi.getTours(filters);
            setTours(data.tours || []);
        } catch (error) {
            console.error('Failed to fetch tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTours = tours.filter(tour =>
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.destination?.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tour-packages-page">
            {/* Hero Section */}
            <div className="hero-section" style={{
                background: 'linear-gradient(135deg, #6B1B3D 0%, #C9A536 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">International Tour Packages</h1>
                    <p className="text-xl mb-8">Explore the world with our curated tour packages</p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search tours..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-6">Filters</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tour Type
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    >
                                        <option value="">All Types</option>
                                        <option value="Group Tour">Group Tour</option>
                                        <option value="Private Tour">Private Tour</option>
                                        <option value="Honeymoon">Honeymoon</option>
                                        <option value="Family Tour">Family Tour</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    >
                                        <option value="">All Categories</option>
                                        <option value="Budget">Budget</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Luxury">Luxury</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => setFilters({ type: '', category: '', destination: '' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tour Listing */}
                    <div className="lg:w-3/4">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                            </div>
                        ) : filteredTours.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">No tours found matching your criteria</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredTours.map((tour) => (
                                    <div key={tour._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="md:flex">
                                            <div className="md:w-2/5">
                                                <img
                                                    src={tour.images?.[0] || '/default-tour.jpg'}
                                                    alt={tour.name}
                                                    className="w-full h-64 md:h-full object-cover"
                                                />
                                            </div>
                                            <div className="md:w-3/5 p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tour.name}</h3>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={16} />
                                                                {tour.destination?.country}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={16} />
                                                                {tour.duration?.days}D / {tour.duration?.nights}N
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                        {tour.category}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 mb-4 line-clamp-3">{tour.description}</p>

                                                {/* Highlights */}
                                                {tour.highlights?.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Highlights:</h4>
                                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                            {tour.highlights.slice(0, 3).map((highlight, idx) => (
                                                                <li key={idx}>{highlight}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mt-4">
                                                    <div>
                                                        <div className="text-sm text-gray-500">Starting from</div>
                                                        <div className="text-2xl font-bold text-primary-600">
                                                            PKR {tour.pricing?.basePrice?.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-gray-500">per person</div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        {tour.groupSize?.max && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <Users size={16} />
                                                                <span>Max {tour.groupSize.max} people</span>
                                                            </div>
                                                        )}
                                                        <a
                                                            href={`/tours/${tour.slug || tour._id}`}
                                                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center"
                                                        >
                                                            View Details
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourPackages;
