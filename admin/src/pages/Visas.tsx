import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import axiosInstance from '../Api/axios';
import { Visa } from '../types';
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

const Visas = () => {
    const navigate = useNavigate();
    const [visas, setVisas] = useState<Visa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState<string>('All Visas');

    const visaTypes = [
        'All Visas',
        'Tourist',
        'E-Visa',
        'Easy Sticker Visa',
        'Business',
        'Student',
        'Work'
    ];

    useEffect(() => {
        fetchVisas();
    }, []);

    const fetchVisas = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/visas');
            setVisas(response.data.visas || []);
        } catch (error) {
            toast.error('Failed to fetch visas');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this visa?')) return;

        try {
            await axiosInstance.delete(`/visas/${id}`);
            toast.success('Visa deleted successfully');
            fetchVisas();
        } catch (error) {
            toast.error('Failed to delete visa');
            console.error(error);
        }
    };

    const handleCreate = () => {
        navigate('/visas/new');
    };

    const handleEdit = (visa: Visa, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/visas/edit/${visa._id}`);
    };

    const handleCardClick = (visa: Visa) => {
        navigate(`/visas/${visa._id}`);
    };

    const filteredVisas = visas.filter(visa => {
        const matchesSearch = visa.country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visa.visaType.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = activeType === 'All Visas' || visa.visaType === activeType;

        return matchesSearch && matchesType;
    });

    return (
        <>
            <PageMeta title="Visa Management | Admin" description="Worldwide visa assistance services" />
            
            <PageLayout>
                <PageHeader
                    title="Worldwide Visa Assistance"
                    description="Manage visa services for all countries"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Visa Management' },
                    ]}
                    actions={
                        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                            Add Visa
                        </Button>
                    }
                />

                <PageContent>
                    <PageContentSection>
                        {/* Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search visas by country or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Visa Type Filter Tabs */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-3">
                                {visaTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveType(type)}
                                        className={`px-6 py-2 rounded-full font-medium transition-all ${
                                            activeType === type
                                                ? 'bg-linear-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Visa Cards Grid */}
                        {loading ? (
                            <LoadingState />
                        ) : filteredVisas.length === 0 ? (
                            <EmptyState
                                title="No visas found"
                                description="Get started by adding your first visa service"
                                action={
                                    <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                                        Add Visa
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredVisas.map((visa) => (
                                    <div
                                        key={visa._id}
                                        onClick={() => handleCardClick(visa)}
                                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer hover:border-brand-500 dark:hover:border-brand-400"
                                    >
                                        {/* Country Flag/Image */}
                                        <div className="relative h-32 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 flex items-center justify-center overflow-hidden">
                                            {visa.images && visa.images.length > 0 ? (
                                                <img
                                                    src={visa.images[0].url}
                                                    alt={visa.country.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : visa.country.flagUrl ? (
                                                <img
                                                    src={visa.country.flagUrl}
                                                    alt={visa.country.name}
                                                    className="w-20 h-20 object-contain rounded shadow-lg"
                                                />
                                            ) : (
                                                <Globe className="w-16 h-16 text-brand-500" />
                                            )}
                                            <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-semibold text-brand-600 dark:text-brand-400">
                                                {visa.country.code}
                                            </div>
                                        </div>

                                        {/* Visa Content */}
                                        <div className="p-4">
                                            {/* Country Name */}
                                            <h3 className="text-lg font-bold text-brand-600 dark:text-brand-400 mb-1">
                                                {visa.country.name}
                                            </h3>

                                            {/* Visa Type */}
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                                                {visa.visaType}
                                                {visa.entryType && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        • {visa.entryType}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Processing Time */}
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                                                <Clock size={16} />
                                                <span className="text-sm">
                                                    {visa.processingTime.min}
                                                    {visa.processingTime.max && `-${visa.processingTime.max}`}
                                                    {' '}{visa.processingTime.unit}
                                                </span>
                                            </div>

                                            {/* Price & Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">From</div>
                                                    <div className="text-lg font-bold text-brand-600 dark:text-brand-400">
                                                        PKR {visa.pricing.adult.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => handleEdit(visa, e)}
                                                        className="p-2 text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(visa._id); }}
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

export default Visas;
