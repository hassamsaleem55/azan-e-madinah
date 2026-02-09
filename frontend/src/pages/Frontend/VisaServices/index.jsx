import { useState, useEffect } from 'react';
import { Globe, Search, FileText, Clock, CheckCircle } from 'lucide-react';
import visaApi from '../../../api/visaApi';
import './VisaServices.css';

const VisaServices = () => {
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        visaType: '',
        region: ''
    });

    useEffect(() => {
        fetchVisas();
    }, [filters]);

    const fetchVisas = async () => {
        try {
            setLoading(true);
            const data = await visaApi.getVisas(filters);
            setVisas(data.visas || []);
        } catch (error) {
            console.error('Failed to fetch visas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVisas = visas.filter(visa =>
        visa.country?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group visas by region
    const groupedVisas = filteredVisas.reduce((acc, visa) => {
        const region = visa.country?.region || 'Other';
        if (!acc[region]) acc[region] = [];
        acc[region].push(visa);
        return acc;
    }, {});

    return (
        <div className="visa-services-page">
            {/* Hero Section */}
            <div className="hero-section" style={{
                background: 'linear-gradient(135deg, #6B1B3D 0%, #C9A536 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Visa Services</h1>
                    <p className="text-xl mb-8">Get visa assistance for over 40 countries worldwide</p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by country..."
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
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visa Type
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={filters.visaType}
                                onChange={(e) => setFilters({ ...filters, visaType: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="Tourist">Tourist</option>
                                <option value="Business">Business</option>
                                <option value="Student">Student</option>
                                <option value="Work">Work</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Region
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={filters.region}
                                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                            >
                                <option value="">All Regions</option>
                                <option value="Middle East">Middle East</option>
                                <option value="Europe">Europe</option>
                                <option value="Asia">Asia</option>
                                <option value="Africa">Africa</option>
                                <option value="Americas">Americas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedVisas).map(([region, regionVisas]) => (
                            <div key={region}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{region}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {regionVisas.map((visa) => (
                                        <div
                                            key={visa._id}
                                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
                                            onClick={() => setSelectedCountry(visa)}
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <Globe size={24} className="text-primary-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {visa.country?.name}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">{visa.visaType}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock size={16} />
                                                    <span>
                                                        {visa.processingTime?.min}-{visa.processingTime?.max || visa.processingTime?.min}{' '}
                                                        {visa.processingTime?.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FileText size={16} />
                                                    <span>{visa.documentRequirements?.length || 0} documents required</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-bold text-primary-600">
                                                        PKR {visa.pricing?.adult?.toLocaleString()}
                                                    </span>
                                                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                                                        Apply Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Country Detail Modal */}
            {selectedCountry && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setSelectedCountry(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {selectedCountry.country?.name} Visa
                                </h2>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                    {selectedCountry.visaType}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedCountry(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Processing Time */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Time</h3>
                                <p className="text-gray-600">
                                    {selectedCountry.processingTime?.min}-{selectedCountry.processingTime?.max || selectedCountry.processingTime?.min}{' '}
                                    {selectedCountry.processingTime?.unit}
                                </p>
                            </div>

                            {/* Document Requirements */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Documents</h3>
                                <div className="space-y-2">
                                    {selectedCountry.documentRequirements?.map((doc, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <CheckCircle size={20} className="text-green-600 mt-1 shrink-0" />
                                            <div>
                                                <div className="font-medium text-gray-900">{doc.documentName}</div>
                                                {doc.description && (
                                                    <div className="text-sm text-gray-600">{doc.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-sm text-gray-600">Adult</div>
                                        <div className="text-2xl font-bold text-primary-600">
                                            PKR {selectedCountry.pricing?.adult?.toLocaleString()}
                                        </div>
                                    </div>
                                    {selectedCountry.pricing?.child && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-sm text-gray-600">Child</div>
                                            <div className="text-2xl font-bold text-primary-600">
                                                PKR {selectedCountry.pricing.child.toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <a
                                href={`/visa-application/${selectedCountry.slug || selectedCountry._id}`}
                                className="block w-full px-6 py-3 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition font-semibold"
                            >
                                Apply for Visa
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisaServices;
