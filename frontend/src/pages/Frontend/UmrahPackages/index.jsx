import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Users, Calendar, Star } from 'lucide-react';
import packageApi from '../../../api/packageApi';
import './UmrahPackages.css';

const UmrahPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        packageType: '',
        city: '',
        minPrice: '',
        maxPrice: '',
        duration: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPackages();
    }, [filters]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await packageApi.getPackages(filters);
            setPackages(data.packages || []);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="umrah-packages-page">
            {/* Hero Section */}
            <div className="hero-section" style={{ 
                background: 'linear-gradient(135deg, #6B1B3D 0%, #C9A536 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Umrah & Hajj Packages</h1>
                    <p className="text-xl mb-8">Choose from our carefully crafted packages for your spiritual journey</p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search packages..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <div className="flex items-center gap-2 mb-6">
                                <Filter size={20} className="text-primary-600" />
                                <h2 className="text-xl font-bold">Filters</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Package Type
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={filters.packageType}
                                        onChange={(e) => setFilters({ ...filters, packageType: e.target.value })}
                                    >
                                        <option value="">All Types</option>
                                        <option value="Umrah">Umrah</option>
                                        <option value="Hajj">Hajj</option>
                                        <option value="Ramadan Umrah">Ramadan Umrah</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={filters.city}
                                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    >
                                        <option value="">All Cities</option>
                                        <option value="Makkah">Makkah</option>
                                        <option value="Madinah">Madinah</option>
                                        <option value="Both">Both</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={filters.duration}
                                        onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                                    >
                                        <option value="">Any Duration</option>
                                        <option value="7">7 Days</option>
                                        <option value="10">10 Days</option>
                                        <option value="15">15 Days</option>
                                        <option value="21">21 Days</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setFilters({ packageType: '', city: '', minPrice: '', maxPrice: '', duration: '' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Package Listing */}
                    <div className="lg:w-3/4">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                            </div>
                        ) : filteredPackages.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">No packages found matching your criteria</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredPackages.map((pkg) => (
                                    <div key={pkg._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="md:flex">
                                            <div className="md:w-1/3">
                                                <img
                                                    src={pkg.images?.[0] || '/default-package.jpg'}
                                                    alt={pkg.name}
                                                    className="w-full h-64 md:h-full object-cover"
                                                />
                                            </div>
                                            <div className="md:w-2/3 p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={16} />
                                                                {pkg.duration?.nights} Nights / {pkg.duration?.days} Days
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={16} />
                                                                {pkg.city}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {pkg.isFeatured && (
                                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
                                                            <Star size={14} />
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>

                                                {/* Accommodations */}
                                                {pkg.accommodations?.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Accommodations:</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {pkg.accommodations.map((acc, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                                    {acc.hotel?.name} - {acc.nights}N
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pricing Tiers */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                    {pkg.pricingTiers?.sharing && (
                                                        <div className="bg-gray-50 rounded p-2">
                                                            <div className="text-xs text-gray-600">Sharing</div>
                                                            <div className="text-lg font-bold text-primary-600">
                                                                PKR {pkg.pricingTiers.sharing.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {pkg.pricingTiers?.quad && (
                                                        <div className="bg-gray-50 rounded p-2">
                                                            <div className="text-xs text-gray-600">Quad</div>
                                                            <div className="text-lg font-bold text-primary-600">
                                                                PKR {pkg.pricingTiers.quad.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {pkg.pricingTiers?.triple && (
                                                        <div className="bg-gray-50 rounded p-2">
                                                            <div className="text-xs text-gray-600">Triple</div>
                                                            <div className="text-lg font-bold text-primary-600">
                                                                PKR {pkg.pricingTiers.triple.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {pkg.pricingTiers?.double && (
                                                        <div className="bg-gray-50 rounded p-2">
                                                            <div className="text-xs text-gray-600">Double</div>
                                                            <div className="text-lg font-bold text-primary-600">
                                                                PKR {pkg.pricingTiers.double.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users size={16} className="text-gray-500" />
                                                        <span className="text-gray-600">
                                                            {pkg.availability?.remainingSeats || 0} seats available
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={`/packages/${pkg.slug || pkg._id}`}
                                                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                                                    >
                                                        View Details
                                                    </a>
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

export default UmrahPackages;
