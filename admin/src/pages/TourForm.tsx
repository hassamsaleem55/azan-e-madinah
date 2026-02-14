import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, MapPin, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import axiosInstance from '../Api/axios';
import { Tour } from '../types';
import {
    PageMeta,
    PageLayout,
    PageHeader,
    PageContent,
    PageContentSection,
    Button,
    Select,
} from '../components';
import Input from '../components/form/input/InputField';

interface TourFormProps {}

interface ItineraryDay {
    dayNumber: number;
    title: string;
    description: string;
    activities: Array<{ time?: string; activity: string; location?: string }>;
    meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
    accommodation: string;
}

interface Inclusion {
    category: string;
    description: string;
    icon?: string;
}

const TourForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        destination: {
            country: '',
            cities: [] as string[],
            region: ''
        },
        duration: {
            days: 1,
            nights: 0
        },
        type: 'Group Tour',
        category: 'Standard',
        seasonalCategory: '',
        pricing: {
            basePrice: 0,
            currency: 'PKR',
            pricePerPerson: true,
            discountedPrice: 0,
            childPrice: 0
        },
        features: {
            returnTickets: false,
            visa: false,
            hotel: true,
            hotelRating: 3,
            meals: 'Breakfast Only',
            transport: true,
            guide: false,
            insurance: false
        },
        status: 'Active',
        isFeatured: false,
        isBestSeller: false
    });

    const [cityInput, setCityInput] = useState('');
    const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
    const [inclusions, setInclusions] = useState<Inclusion[]>([]);
    const [exclusions, setExclusions] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<Array<{ url: string; caption?: string; isPrimary: boolean }>>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');

    useEffect(() => {
        if (id) {
            fetchTour();
        }
    }, [id]);

    const fetchTour = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/tours/${id}`);
            const tour: Tour = response.data.data;

            setFormData({
                name: tour.name || '',
                description: tour.description || '',
                shortDescription: tour.shortDescription || '',
                destination: {
                    country: tour.destination?.country || '',
                    cities: tour.destination?.cities || [],
                    region: tour.destination?.region || ''
                },
                duration: tour.duration || { days: 1, nights: 0 },
                type: tour.type || 'Group Tour',
                category: tour.category || 'Standard',
                seasonalCategory: tour.seasonalCategory || '',
                pricing: {
                    basePrice: tour.pricing?.basePrice || 0,
                    currency: tour.pricing?.currency || 'PKR',
                    pricePerPerson: tour.pricing?.pricePerPerson ?? true,
                    discountedPrice: tour.pricing?.discountedPrice || 0,
                    childPrice: tour.pricing?.childPrice || 0
                },
                features: {
                    returnTickets: tour.features?.returnTickets || false,
                    visa: tour.features?.visa || false,
                    hotel: tour.features?.hotel ?? true,
                    hotelRating: tour.features?.hotelRating || 3,
                    meals: tour.features?.meals || 'Breakfast Only',
                    transport: tour.features?.transport ?? true,
                    guide: tour.features?.guide || false,
                    insurance: tour.features?.insurance || false
                },
                status: tour.status || 'Active',
                isFeatured: tour.isFeatured || false,
                isBestSeller: tour.isBestSeller || false
            });

            if (tour.itinerary) setItinerary(tour.itinerary as any);
            if (tour.inclusions) setInclusions(tour.inclusions);
            if (tour.exclusions) setExclusions(tour.exclusions);
            if (tour.images) setImageUrls(tour.images.map(img => ({
                ...img,
                isPrimary: img.isPrimary ?? false
            })));
        } catch (error) {
            toast.error('Failed to fetch tour details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, action: 'save' | 'saveAndView' = 'save') => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.destination.country) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                itinerary,
                inclusions,
                exclusions,
                images: imageUrls
            };

            if (id) {
                await axiosInstance.put(`/tours/${id}`, payload);
                toast.success('Tour updated successfully');
                if (action === 'saveAndView') {
                    navigate(`/tours/${id}`);
                } else {
                    navigate('/tours');
                }
            } else {
                const response = await axiosInstance.post('/tours', payload);
                const newTourId = response.data.data?._id || response.data.tour?._id;
                toast.success('Tour created successfully');
                if (action === 'saveAndView' && newTourId) {
                    navigate(`/tours/${newTourId}`);
                } else {
                    navigate('/tours');
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save tour');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
            }));
        }
    };

    const addCity = () => {
        if (cityInput.trim() && !formData.destination.cities.includes(cityInput.trim())) {
            setFormData(prev => ({
                ...prev,
                destination: {
                    ...prev.destination,
                    cities: [...prev.destination.cities, cityInput.trim()]
                }
            }));
            setCityInput('');
        }
    };

    const removeCity = (city: string) => {
        setFormData(prev => ({
            ...prev,
            destination: {
                ...prev.destination,
                cities: prev.destination.cities.filter(c => c !== city)
            }
        }));
    };

    const addItineraryDay = () => {
        setItinerary(prev => [...prev, {
            dayNumber: prev.length + 1,
            title: '',
            description: '',
            activities: [],
            meals: { breakfast: false, lunch: false, dinner: false },
            accommodation: ''
        }]);
    };

    const updateItineraryDay = (index: number, field: string, value: any) => {
        setItinerary(prev => {
            const updated = [...prev];
            (updated[index] as any)[field] = value;
            return updated;
        });
    };

    const removeItineraryDay = (index: number) => {
        setItinerary(prev => prev.filter((_, i) => i !== index).map((day, i) => ({ ...day, dayNumber: i + 1 })));
    };

    const addInclusion = () => {
        setInclusions(prev => [...prev, { category: 'Other', description: '', icon: '' }]);
    };

    const updateInclusion = (index: number, field: keyof Inclusion, value: string) => {
        setInclusions(prev => {
            const updated = [...prev];
            updated[index][field] = value as any;
            return updated;
        });
    };

    const removeInclusion = (index: number) => {
        setInclusions(prev => prev.filter((_, i) => i !== index));
    };

    const addExclusion = () => {
        setExclusions(prev => [...prev, '']);
    };

    const updateExclusion = (index: number, value: string) => {
        setExclusions(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const removeExclusion = (index: number) => {
        setExclusions(prev => prev.filter((_, i) => i !== index));
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            setImageUrls(prev => [...prev, {
                url: newImageUrl.trim(),
                caption: newImageCaption.trim(),
                isPrimary: prev.length === 0
            }]);
            setNewImageUrl('');
            setNewImageCaption('');
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const setPrimaryImage = (index: number) => {
        setImageUrls(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
    };

    return (
        <>
            <PageMeta title={`${id ? 'Edit' : 'Add'} Tour | Admin`} description="Manage tour packages" />
            
            <PageLayout>
                <PageHeader
                    title={id ? 'Edit Tour' : 'Add New Tour'}
                    description="Manage international tour packages"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Tours', path: '/tours' },
                        { label: id ? 'Edit Tour' : 'Add Tour' },
                    ]}
                />

                <PageContent>
                    <PageContentSection>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tour Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter tour name"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Short Description
                                        </label>
                                        <Input
                                            type="text"
                                            name="shortDescription"
                                            value={formData.shortDescription}
                                            onChange={handleInputChange}
                                            placeholder="Brief tour description"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Detailed tour description"
                                            rows={5}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Destination & Duration */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Destination */}
                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Destination
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                name="destination.country"
                                                value={formData.destination.country}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Azerbaijan"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Region
                                            </label>
                                            <Input
                                                type="text"
                                                name="destination.region"
                                                value={formData.destination.region}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Caucasus"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Cities
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <Input
                                                    type="text"
                                                    value={cityInput}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCityInput(e.target.value)}
                                                    placeholder="Add city"
                                                    className="flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addCity}
                                                    className="px-4 py-2 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors shadow-sm"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.destination.cities.map((city, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-800 dark:text-brand-200 rounded-full text-sm">
                                                        {city}
                                                        <button type="button" onClick={() => removeCity(city)} className="hover:text-error-600">
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Duration & Type */}
                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Duration & Type</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Days <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="number"
                                                    name="duration.days"
                                                    min="1"
                                                    value={formData.duration.days.toString()}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Nights <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="number"
                                                    name="duration.nights"
                                                    min="0"
                                                    value={formData.duration.nights.toString()}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tour Type <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: "Group Tour", label: "Group Tour" },
                                                    { value: "Private Tour", label: "Private Tour" },
                                                    { value: "Custom Tour", label: "Custom Tour" },
                                                    { value: "Family Tour", label: "Family Tour" },
                                                    { value: "Honeymoon", label: "Honeymoon" },
                                                    { value: "Adventure", label: "Adventure" },
                                                    { value: "Cultural", label: "Cultural" },
                                                    { value: "Religious", label: "Religious" }
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: "Budget", label: "Budget" },
                                                    { value: "Standard", label: "Standard" },
                                                    { value: "Deluxe", label: "Deluxe" },
                                                    { value: "Luxury", label: "Luxury" },
                                                    { value: "Premium", label: "Premium" }
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Seasonal Category
                                            </label>
                                            <Select
                                                name="seasonalCategory"
                                                value={formData.seasonalCategory}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: "", label: "Select Season" },
                                                    { value: "Summer Special", label: "Summer Special" },
                                                    { value: "Winter Special", label: "Winter Special" },
                                                    { value: "Spring Special", label: "Spring Special" },
                                                    { value: "Autumn Special", label: "Autumn Special" },
                                                    { value: "All Year", label: "All Year" }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Status */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pricing & Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Base Price (PKR) <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            name="pricing.basePrice"
                                            min="0"
                                            value={formData.pricing.basePrice.toString()}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Discounted Price (PKR)
                                        </label>
                                        <Input
                                            type="number"
                                            name="pricing.discountedPrice"
                                            min="0"
                                            value={formData.pricing.discountedPrice.toString()}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Child Price (PKR)
                                        </label>
                                        <Input
                                            type="number"
                                            name="pricing.childPrice"
                                            min="0"
                                            value={formData.pricing.childPrice.toString()}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: "Active", label: "Active" },
                                                { value: "Inactive", label: "Inactive" },
                                                { value: "Sold Out", label: "Sold Out" },
                                                { value: "Coming Soon", label: "Coming Soon" }
                                            ]}
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-wrap gap-6 items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isFeatured"
                                                checked={formData.isFeatured}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Tour</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isBestSeller"
                                                checked={formData.isBestSeller}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Best Seller</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="pricing.pricePerPerson"
                                                checked={formData.pricing.pricePerPerson}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Per Person</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Tour Features */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tour Features</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" name="features.returnTickets" checked={formData.features.returnTickets} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Return Tickets</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" name="features.visa" checked={formData.features.visa} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Visa</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" name="features.hotel" checked={formData.features.hotel} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Hotel</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" name="features.transport" checked={formData.features.transport} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Transport</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" name="features.guide" checked={formData.features.guide} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Guide</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" name="features.insurance" checked={formData.features.insurance} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Insurance</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hotel Rating</label>
                                            <Input type="number" name="features.hotelRating" min="1" max="5" value={formData.features.hotelRating.toString()} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meals</label>
                                            <Select name="features.meals" value={formData.features.meals} onChange={handleInputChange} options={[
                                                { value: "None", label: "None" },
                                                { value: "Breakfast Only", label: "Breakfast Only" },
                                                { value: "Half Board", label: "Half Board" },
                                                { value: "Full Board", label: "Full Board" },
                                                { value: "All Inclusive", label: "All Inclusive" }
                                            ]} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Itinerary */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Day-by-Day Itinerary</h3>
                                    <button
                                        type="button"
                                        onClick={addItineraryDay}
                                        className="px-4 py-2 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <Plus size={18} /> Add Day
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {itinerary.map((day, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">Day {day.dayNumber}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItineraryDay(index)}
                                                    className="text-error-600 hover:text-error-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="md:col-span-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Day title"
                                                        value={day.title}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItineraryDay(index, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <textarea
                                                        placeholder="Day description"
                                                        value={day.description}
                                                        onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Accommodation"
                                                        value={day.accommodation}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItineraryDay(index, 'accommodation', e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-2 flex gap-4">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={day.meals.breakfast}
                                                            onChange={(e) => updateItineraryDay(index, 'meals', { ...day.meals, breakfast: e.target.checked })}
                                                            className="w-4 h-4 text-brand-600 rounded"
                                                        />
                                                        <span className="text-sm text-gray-900 dark:text-white">Breakfast</span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={day.meals.lunch}
                                                            onChange={(e) => updateItineraryDay(index, 'meals', { ...day.meals, lunch: e.target.checked })}
                                                            className="w-4 h-4 text-brand-600 rounded"
                                                        />
                                                        <span className="text-sm text-gray-900 dark:text-white">Lunch</span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={day.meals.dinner}
                                                            onChange={(e) => updateItineraryDay(index, 'meals', { ...day.meals, dinner: e.target.checked })}
                                                            className="w-4 h-4 text-brand-600 rounded"
                                                        />
                                                        <span className="text-sm text-gray-900 dark:text-white">Dinner</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Inclusions & Exclusions */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Inclusions */}
                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inclusions</h3>
                                        <button
                                            type="button"
                                            onClick={addInclusion}
                                            className="px-3 py-1.5 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors flex items-center gap-1 text-sm shadow-sm"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {inclusions.map((inclusion, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Select
                                                    value={inclusion.category}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateInclusion(index, 'category', e.target.value)}
                                                    options={[
                                                        { value: "Flights", label: "Flights" },
                                                        { value: "Accommodation", label: "Accommodation" },
                                                        { value: "Meals", label: "Meals" },
                                                        { value: "Transport", label: "Transport" },
                                                        { value: "Activities", label: "Activities" },
                                                        { value: "Visa", label: "Visa" },
                                                        { value: "Insurance", label: "Insurance" },
                                                        { value: "Guide", label: "Guide" },
                                                        { value: "Other", label: "Other" }
                                                    ]}
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={inclusion.description}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateInclusion(index, 'description', e.target.value)}
                                                    className="flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeInclusion(index)}
                                                    className="px-3 py-2 text-error-600 hover:text-error-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Exclusions */}
                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exclusions</h3>
                                        <button
                                            type="button"
                                            onClick={addExclusion}
                                            className="px-3 py-1.5 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors flex items-center gap-1 text-sm shadow-sm"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {exclusions.map((exclusion, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Exclusion description"
                                                    value={exclusion}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExclusion(index, e.target.value)}
                                                    className="flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExclusion(index)}
                                                    className="px-3 py-2 text-error-600 hover:text-error-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" />
                                    Tour Images
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Image URL"
                                            value={newImageUrl}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImageUrl(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="text"
                                            placeholder="Caption (optional)"
                                            value={newImageCaption}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImageCaption(e.target.value)}
                                            className="flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={addImage}
                                            className="px-4 py-2 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <Plus size={20} /> Add
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {imageUrls.map((image, index) => (
                                            <div key={index} className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden group">
                                                <img src={image.url} alt={image.caption || 'Tour'} className="w-full h-48 object-cover" />
                                                {image.isPrimary && (
                                                    <div className="absolute top-2 left-2 bg-brand-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                                        Primary
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    {!image.isPrimary && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPrimaryImage(index)}
                                                            className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm"
                                                        >
                                                            Set Primary
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                {image.caption && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1">
                                                        {image.caption}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                                <Button
                                    type="button"
                                    onClick={() => navigate('/tours')}
                                    variant="outline"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit({} as React.FormEvent, 'save')}
                                    disabled={loading}
                                    variant="outline"
                                >
                                    {loading ? 'Saving...' : id ? 'Update & Close' : 'Save & Close'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit({} as React.FormEvent, 'saveAndView')}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : id ? 'Update & View' : 'Save & View'}
                                </Button>
                            </div>
                        </form>
                    </PageContentSection>
                </PageContent>
            </PageLayout>
        </>
    );
};

export default TourForm;
