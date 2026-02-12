import { useState, useEffect } from 'react';
import { X, Save, Upload, MapPin, Star, Building2, Phone, Mail, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';

interface HotelFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const HotelForm = ({ onClose, onSuccess, editId }: HotelFormProps) => {
    const [loading, setLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        nameArabic: '',
        description: '',
        location: {
            address: '',
            city: 'Makkah',
            distanceFromHaram: 0,
            walkingTime: 0,
            coordinates: {
                latitude: 0,
                longitude: 0
            }
        },
        starRating: 3,
        category: 'Standard',
        amenities: [] as any[],
        services: {
            shuttleService: false,
            frontDesk24h: false,
            conciergeService: false,
            currencyExchange: false,
            tourDesk: false,
            luggageStorage: false,
            prayerFacilities: false,
            businessCenter: false,
            gym: false,
            swimmingPool: false,
            restaurant: false,
            roomService: false,
            laundryService: false,
            parking: false,
            elevator: false,
            breakfast: false
        },
        contact: {
            phone: '',
            email: '',
            website: ''
        },
        policies: {
            checkInTime: '14:00',
            checkOutTime: '12:00',
            cancellationPolicy: '',
            childPolicy: '',
            petPolicy: ''
        },
        images: [] as any[],
        isFeatured: false
    });

    useEffect(() => {
        if (editId) {
            fetchHotel();
        }
    }, [editId]);

    const fetchHotel = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/hotels/${editId}`);

            if (!response.data.success) {
                toast.error('Failed to load hotel details');
                onClose();
                return;
            }

            const hotel = response.data.hotel;

            if (!hotel) {
                toast.error('Hotel not found');
                onClose();
                return;
            }

            setFormData({
                name: hotel.name || '',
                nameArabic: hotel.nameArabic || '',
                description: hotel.description || '',
                location: hotel.location || {
                    address: '',
                    city: 'Makkah',
                    distanceFromHaram: 0,
                    walkingTime: 0,
                    coordinates: { latitude: 0, longitude: 0 }
                },
                starRating: hotel.starRating || 3,
                category: hotel.category || 'Standard',
                amenities: hotel.amenities || [],
                services: hotel.services || {
                    shuttleService: false,
                    frontDesk24h: false,
                    conciergeService: false,
                    currencyExchange: false,
                    tourDesk: false,
                    luggageStorage: false,
                    prayerFacilities: false,
                    businessCenter: false,
                    gym: false,
                    swimmingPool: false,
                    restaurant: false,
                    roomService: false,
                    laundryService: false,
                    parking: false,
                    elevator: false,
                    breakfast: false
                },
                contact: hotel.contact || { phone: '', email: '', website: '' },
                policies: hotel.policies || {
                    checkInTime: '14:00',
                    checkOutTime: '12:00',
                    cancellationPolicy: '',
                    childPolicy: '',
                    petPolicy: ''
                },
                images: hotel.images || [],
                isFeatured: hotel.isFeatured || false
            });

            // Set existing images and previews if editing
            if (hotel.images && hotel.images.length > 0) {
                setExistingImages(hotel.images);
                setImagePreview(hotel.images.map((img: any) => img.url));
            }
        } catch (error: any) {
            console.error('Error fetching hotel:', error);

            if (error.response?.status === 404) {
                toast.error('Hotel not found');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to view this hotel');
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch hotel details');
            }
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            toast.error('Please upload only image files (JPG, PNG, GIF, WEBP)');
            return;
        }

        // Validate file sizes (max 5MB each)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            toast.error('Each image must be less than 5MB');
            return;
        }

        // Check total number of images
        if (imageFiles.length + files.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }

        setImageFiles([...imageFiles, ...files]);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreview([...imagePreview, ...newPreviews]);

        toast.success(`${files.length} image(s) added`);
    };

    const removeImage = (index: number) => {
        // Check if this is an existing image or a new upload
        if (index < existingImages.length) {
            // Removing an existing image
            const newExisting = existingImages.filter((_, i) => i !== index);
            setExistingImages(newExisting);
        } else {
            // Removing a new image
            const newFileIndex = index - existingImages.length;
            const newFiles = imageFiles.filter((_, i) => i !== newFileIndex);
            setImageFiles(newFiles);
        }

        // Update preview
        const newPreviews = imagePreview.filter((_, i) => i !== index);
        setImagePreview(newPreviews);

        toast.success('Image removed');
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        // Validation
        if (!formData.name || !formData.name.trim()) {
            toast.error('Hotel name is required');
            return;
        }

        if (!formData.location.city) {
            toast.error('City is required');
            return;
        }

        if (!formData.location.address || !formData.location.address.trim()) {
            toast.error('Hotel address is required');
            return;
        }

        if (formData.location.distanceFromHaram < 0) {
            toast.error('Please enter a valid distance from Haram');
            return;
        }
        try {
            setLoading(true);

            // Prepare form data with images
            const submitData = new FormData();

            // For updates, include existing images that weren't removed
            const dataToSubmit = {
                ...formData,
                images: editId ? existingImages : [] // Include existing images only for updates
            };

            submitData.append('data', JSON.stringify(dataToSubmit));

            // Append new image files if any
            imageFiles.forEach(file => {
                submitData.append('images', file);
            });

            if (editId) {
                const response = await axiosInstance.put(`/hotels/${editId}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    toast.success('✓ Hotel updated successfully!');
                    onSuccess();
                    onClose();
                } else {
                    toast.error(response.data.message || 'Failed to update hotel');
                }
            } else {
                const response = await axiosInstance.post('/hotels', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    toast.success('✓ Hotel created successfully!');
                    onSuccess();
                    onClose();
                } else {
                    toast.error(response.data.message || 'Failed to create hotel');
                }
            }
        } catch (error: any) {
            console.error('Hotel submission error:', error);

            if (error.response) {
                // Server responded with error
                const message = error.response.data?.message || 'Server error occurred';
                toast.error(`Error: ${message}`);
            } else if (error.request) {
                // Request made but no response
                toast.error('Network error: Unable to reach server');
            } else {
                // Other errors
                toast.error('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const addAmenity = (name: string, category: string = 'General') => {
        if (name && !formData.amenities.find((a: any) => a.name === name)) {
            setFormData({
                ...formData,
                amenities: [...formData.amenities, { name, category }]
            });
        }
    };

    const removeAmenity = (name: string) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.filter((a: any) => a.name !== name)
        });
    };

    const commonAmenities = [
        { name: 'Free WiFi', category: 'Room' },
        { name: 'Air Conditioning', category: 'Room' },
        { name: 'TV', category: 'Room' },
        { name: 'Mini Fridge', category: 'Room' },
        { name: 'Safe', category: 'Room' },
        { name: 'Kettle/Coffee Maker', category: 'Room' },
        { name: 'Work Desk', category: 'Room' },
        { name: 'Sofa/Seating Area', category: 'Room' },
        { name: 'Private Bathroom', category: 'Bathroom' },
        { name: 'Shower', category: 'Bathroom' },
        { name: 'Bathtub', category: 'Bathroom' },
        { name: 'Hot Water', category: 'Bathroom' },
        { name: 'Toiletries', category: 'Bathroom' },
        { name: 'Hairdryer', category: 'Bathroom' },
        { name: 'Bathrobe & Slippers', category: 'Bathroom' },
        { name: 'Towels', category: 'Bathroom' },
        { name: 'Iron/Ironing Board', category: 'Room' },
        { name: 'Telephone', category: 'Room' },
        { name: 'Alarm Clock', category: 'Room' },
        { name: 'Blackout Curtains', category: 'Room' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6" />
                        {editId ? 'Edit Hotel' : 'Add New Hotel'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hotel Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g., Al Rayyan International"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hotel Name (Arabic)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.nameArabic}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({ ...formData, nameArabic: e.target.value })
                                    }
                                    placeholder="الاسم بالعربية"
                                    dir="rtl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 appearance-none rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-900 px-4 py-3 pr-10 text-sm font-semibold shadow-sm hover:border-brand-300 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:border-brand-700 dark:hover:from-gray-900 dark:hover:to-gray-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:shadow-lg focus:shadow-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-400 transition-all duration-300 cursor-pointer"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Economy">Economy</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Luxury">Luxury</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500 dark:text-brand-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Star Rating <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 appearance-none rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-900 px-4 py-3 pr-10 text-sm font-semibold shadow-sm hover:border-brand-300 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:border-brand-700 dark:hover:from-gray-900 dark:hover:to-gray-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:shadow-lg focus:shadow-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-400 transition-all duration-300 cursor-pointer"
                                        value={formData.starRating}
                                        onChange={(e) => setFormData({ ...formData, starRating: parseInt(e.target.value) })}
                                    >
                                        <option value="1">1 Star</option>
                                        <option value="2">2 Star</option>
                                        <option value="3">3 Star</option>
                                        <option value="4">4 Star</option>
                                        <option value="5">5 Star</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500 dark:text-brand-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center pt-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Featured Hotel
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the hotel facilities, location highlights, and unique features..."
                            />
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Location Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 appearance-none rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-900 px-4 py-3 pr-10 text-sm font-semibold shadow-sm hover:border-brand-300 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:border-brand-700 dark:hover:from-gray-900 dark:hover:to-gray-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:shadow-lg focus:shadow-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-400 transition-all duration-300 cursor-pointer"
                                        value={formData.location.city}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            location: { ...formData.location, city: e.target.value }
                                        })}
                                    >
                                        <option value="Makkah">Makkah</option>
                                        <option value="Madinah">Madinah</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500 dark:text-brand-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.location.address}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            location: { ...formData.location, address: e.target.value }
                                        })
                                    }
                                    placeholder="Full address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Distance from Haram (meters) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.location.distanceFromHaram?.toString() || '0'}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                distanceFromHaram: parseInt(e.target.value) || 0
                                            }
                                        })
                                    }
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Walking Time (minutes)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.location.walkingTime?.toString() || '0'}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                walkingTime: parseInt(e.target.value) || 0
                                            }
                                        })
                                    }
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.location.coordinates.latitude?.toString() || '0'}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                coordinates: {
                                                    ...formData.location.coordinates,
                                                    latitude: parseFloat(e.target.value) || 0
                                                }
                                            }
                                        })
                                    }
                                    placeholder="21.4225"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.location.coordinates.longitude?.toString() || '0'}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                coordinates: {
                                                    ...formData.location.coordinates,
                                                    longitude: parseFloat(e.target.value) || 0
                                                }
                                            }
                                        })
                                    }
                                    placeholder="39.8262"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hotel Services & Facilities</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select hotel-wide services and facilities available to guests</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(formData.services).map(([key, value]) => (
                                <label key={key} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={value as boolean}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            services: { ...formData.services, [key]: e.target.checked }
                                        })}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/24h/, '24/7').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Room Amenities</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select in-room amenities and features</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Quick Add Common Amenities
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {commonAmenities.map((amenity) => {
                                        const isAdded = formData.amenities.some((a: any) => a.name === amenity.name);
                                        return (
                                            <button
                                                key={amenity.name}
                                                type="button"
                                                onClick={() => isAdded ? removeAmenity(amenity.name) : addAmenity(amenity.name, amenity.category)}
                                                className={`px-3 py-1 text-sm rounded-full transition-all ${isAdded
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                    }`}
                                            >
                                                {amenity.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {formData.amenities.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Selected Amenities
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.amenities.map((amenity: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full"
                                            >
                                                <span className="text-sm">{amenity.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAmenity(amenity.name)}
                                                    className="text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.contact.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            contact: { ...formData.contact, phone: e.target.value }
                                        })
                                    }
                                    placeholder="+966 12 345 6789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.contact.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            contact: { ...formData.contact, email: e.target.value }
                                        })
                                    }
                                    placeholder="hotel@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Globe className="w-4 h-4 inline mr-1" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.contact.website}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            contact: { ...formData.contact, website: e.target.value }
                                        })
                                    }
                                    placeholder="https://hotel-website.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hotel Policies */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hotel Policies</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Check-in Time
                                </label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.policies.checkInTime}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            policies: { ...formData.policies, checkInTime: e.target.value }
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Check-out Time
                                </label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.policies.checkOutTime}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            policies: { ...formData.policies, checkOutTime: e.target.value }
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cancellation Policy
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    rows={3}
                                    value={formData.policies.cancellationPolicy}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        policies: { ...formData.policies, cancellationPolicy: e.target.value }
                                    })}
                                    placeholder="Free cancellation up to 24 hours before check-in..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Child Policy
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.policies.childPolicy}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            policies: { ...formData.policies, childPolicy: e.target.value }
                                        })
                                    }
                                    placeholder="Children under 12 stay free..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pet Policy
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={formData.policies.petPolicy}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({
                                            ...formData,
                                            policies: { ...formData.policies, petPolicy: e.target.value }
                                        })
                                    }
                                    placeholder="Pets not allowed..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hotel Images */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Hotel Images
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Upload Images
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Upload hotel images (exterior, rooms, facilities, etc.)
                                </p>
                            </div>

                            {imagePreview.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {imagePreview.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{editId ? 'Update Hotel' : 'Create Hotel'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HotelForm;
