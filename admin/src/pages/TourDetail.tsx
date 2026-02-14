import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Star, Check, Edit } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
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
} from '../components';

const TourDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTour();
        }
    }, [id]);

    const fetchTour = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/tours/${id}`);
            setTour(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch tour details');
            navigate('/tours');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <LoadingState />
            </PageLayout>
        );
    }

    if (!tour) {
        return null;
    }
    const primaryImage = tour.images?.find(img => img.isPrimary)?.url || tour.images?.[0]?.url || '/placeholder-tour.jpg';

    return (
        <>
            <PageMeta title={`${tour.name} | Admin`} description={tour.shortDescription || tour.description} />
            
            <PageLayout>
                <PageHeader
                    title={tour.name}
                    description={tour.shortDescription || ''}
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Tours', path: '/tours' },
                        { label: tour.name },
                    ]}
                    actions={
                        <div className="flex items-center gap-3">
                            <Button onClick={() => navigate('/tours')} variant="outline">
                                ← Back to Tours
                            </Button>
                            <Button onClick={() => navigate(`/tours/edit/${tour._id}`)} startIcon={<Edit className="w-4 h-4" />}>
                                Edit Tour
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <PageContentSection noPadding>
                        {/* Hero Banner */}
                        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-xl">
                            <img
                                src={primaryImage}
                                alt={tour.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} />
                                        <span>{tour.destination?.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} />
                                        <span>{tour.duration?.days} Days {tour.duration?.nights} Nights</span>
                                    </div>
                                    {tour.reviews && tour.reviews.averageRating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold">{tour.reviews.averageRating.toFixed(1)}</span>
                                            <span className="text-sm opacity-90">({tour.reviews.totalReviews} reviews)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </PageContentSection>

                    <PageContentSection>
                        {/* Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Tour Meta Info */}
                            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{tour.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{tour.category}</span>
                                </div>
                                {tour.seasonalCategory && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Season:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{tour.seasonalCategory}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {tour.description && (
                                <div className="mb-8">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {tour.description}
                                    </p>
                                </div>
                            )}

                            {/* Day-wise Itinerary */}
                            {tour.itinerary && tour.itinerary.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        Day-wise Itinerary
                                    </h2>
                                    <div className="space-y-4">
                                        {tour.itinerary.map((day) => (
                                            <details
                                                key={day.dayNumber}
                                                className="group bg-brand-600 text-white rounded-lg overflow-hidden"
                                            >
                                                <summary className="cursor-pointer px-6 py-4 font-semibold text-lg hover:bg-brand-700 transition-colors list-none flex justify-between items-center">
                                                    <span>▼ Day {day.dayNumber} - {day.title}</span>
                                                </summary>
                                                <div className="px-6 py-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                    <p className="mb-4">{day.description}</p>
                                                    
                                                    {day.activities && day.activities.length > 0 && (
                                                        <div className="mb-4">
                                                            <h4 className="font-semibold mb-2">Activities:</h4>
                                                            <ul className="space-y-2">
                                                                {day.activities.map((activity, idx) => (
                                                                    <li key={idx} className="flex gap-2">
                                                                        <span className="text-gray-500">•</span>
                                                                        <div>
                                                                            {activity.time && (
                                                                                <span className="font-medium">{activity.time}: </span>
                                                                            )}
                                                                            {activity.activity}
                                                                            {activity.location && (
                                                                                <span className="text-sm text-gray-600 dark:text-gray-400"> ({activity.location})</span>
                                                                            )}
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {day.meals && (
                                                        <div className="mb-2">
                                                            <span className="font-semibold">Meals: </span>
                                                            <span>
                                                                {[
                                                                    day.meals.breakfast && 'Breakfast',
                                                                    day.meals.lunch && 'Lunch',
                                                                    day.meals.dinner && 'Dinner'
                                                                ].filter(Boolean).join(', ') || 'Not included'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {day.accommodation && (
                                                        <div>
                                                            <span className="font-semibold">Accommodation: </span>
                                                            <span>{day.accommodation}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* What's Included */}
                            {tour.inclusions && tour.inclusions.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        ✓ What's Included
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {tour.inclusions.map((inclusion, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <Check size={18} className="text-success-600 dark:text-success-400 mt-1 shrink-0" />
                                                <div>
                                                    <span className="font-medium">{inclusion.category}: </span>
                                                    <span className="text-gray-700 dark:text-gray-300">{inclusion.description}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Exclusions */}
                            {tour.exclusions && tour.exclusions.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        What's Not Included
                                    </h3>
                                    <ul className="space-y-2">
                                        {tour.exclusions.map((exclusion, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                                <span className="text-red-500">✗</span>
                                                <span>{exclusion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md">
                                <div className="mb-6">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Starting From</div>
                                    <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                                        PKR {tour.pricing?.basePrice?.toLocaleString()}
                                    </div>
                                    {tour.pricing?.discountedPrice && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                            PKR {tour.pricing.discountedPrice.toLocaleString()}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        per person {tour.pricing?.pricePerPerson ? '(twin sharing)' : ''}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {tour.duration?.days} Days {tour.duration?.nights} Nights
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Tour Type:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{tour.type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Best Season:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {tour.seasonalCategory || 'All Year'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tour Features */}
                                {tour.features && (
                                    <div className="space-y-2 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tour Features</h4>
                                        {tour.features.returnTickets && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check size={16} className="text-success-600" />
                                                <span>Return Tickets</span>
                                            </div>
                                        )}
                                        {tour.features.visa && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check size={16} className="text-success-600" />
                                                <span>Visa Assistance</span>
                                            </div>
                                        )}
                                        {tour.features.hotel && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check size={16} className="text-success-600" />
                                                <span>
                                                    {tour.features.hotelRating ? `${tour.features.hotelRating} Star ` : ''}Hotel
                                                </span>
                                            </div>
                                        )}
                                        {tour.features.meals && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check size={16} className="text-success-600" />
                                                <span>{tour.features.meals}</span>
                                            </div>
                                        )}
                                        {tour.features.transport && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check size={16} className="text-success-600" />
                                                <span>Transport</span>
                                            </div>
                                        )}
                                        {tour.features.guide && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check size={16} className="text-success-600" />
                                                <span>Tour Guide</span>
                                            </div>
                                        )}
                                        {tour.features.insurance && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check size={16} className="text-success-600" />
                                                <span>Travel Insurance</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Status */}
                                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                                    Status: <span className={`font-semibold ${tour.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {tour.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    </PageContentSection>
                </PageContent>
            </PageLayout>
        </>
    );
};

export default TourDetail;
