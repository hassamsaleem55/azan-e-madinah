import { useState, useEffect } from 'react';
import { Check, X, Star, Search, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import PageMeta from '../components/common/PageMeta';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Testimonial } from '../types';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'Pending',
        serviceType: ''
    });
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [response, setResponse] = useState('');

    useEffect(() => {
        fetchTestimonials();
    }, [filters]);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/testimonials', {
                params: filters
            });
            setTestimonials(response.data.testimonials || []);
        } catch (error) {
            toast.error('Failed to fetch testimonials');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await axiosInstance.put(`/testimonials/${id}/approve`);
            toast.success('Testimonial approved successfully');
            fetchTestimonials();
        } catch (error) {
            toast.error('Failed to approve testimonial');
            console.error(error);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Rejection reason:');
        if (!reason) return;

        try {
            await axiosInstance.put(`/testimonials/${id}/reject`, { reason });
            toast.success('Testimonial rejected');
            fetchTestimonials();
        } catch (error) {
            toast.error('Failed to reject testimonial');
            console.error(error);
        }
    };

    const handleToggleFeatured = async (id: string) => {
        try {
            await axiosInstance.put(`/testimonials/${id}/toggle-featured`);
            toast.success('Featured status updated');
            fetchTestimonials();
        } catch (error) {
            toast.error('Failed to update status');
            console.error(error);
        }
    };

    const handleAddResponse = async () => {
        if (!response.trim()) return;

        try {
            await axiosInstance.put(`/testimonials/${selectedTestimonial!._id}/response`, { response });
            toast.success('Response added successfully');
            setShowResponseModal(false);
            setResponse('');
            setSelectedTestimonial(null);
            fetchTestimonials();
        } catch (error) {
            toast.error('Failed to add response');
            console.error(error);
        }
    };

    const filteredTestimonials = testimonials.filter(t =>
        t.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Testimonial Management | Admin" description="" />
            
            <div className="space-y-6">
                <PageBreadCrumb pageTitle="Testimonial Management" />

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Testimonials</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Review and manage customer feedback
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Search testimonials..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.serviceType}
                                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                            >
                                <option value="">All Services</option>
                                <option value="Umrah Package">Umrah Package</option>
                                <option value="Hajj Package">Hajj Package</option>
                                <option value="Hotel Booking">Hotel Booking</option>
                                <option value="Visa Service">Visa Service</option>
                                <option value="Tour Package">Tour Package</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredTestimonials.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500">
                            No testimonials found
                        </div>
                    ) : (
                        filteredTestimonials.map((testimonial) => (
                            <div key={testimonial._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                                            {testimonial.customer?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {testimonial.customer?.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">•</span>
                                                <span className="text-sm text-gray-500">{testimonial.serviceType}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            testimonial.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            testimonial.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {testimonial.status}
                                        </span>
                                        {testimonial.isFeatured && (
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {testimonial.title && (
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                                        {testimonial.title}
                                    </h4>
                                )}

                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    {testimonial.content}
                                </p>

                                {testimonial.response?.content && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare size={16} className="text-primary-600" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Company Response
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {testimonial.response.content}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2 flex-wrap">
                                    {testimonial.status === 'Pending' && (
                                        <>
                                            <Button
                                                onClick={() => handleApprove(testimonial._id)}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                                size="sm"
                                            >
                                                <Check size={16} />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(testimonial._id)}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                                                size="sm"
                                            >
                                                <X size={16} />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {testimonial.status === 'Approved' && (
                                        <>
                                            <Button
                                                onClick={() => handleToggleFeatured(testimonial._id)}
                                                className="flex items-center gap-2"
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Star size={16} />
                                                {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                                            </Button>
                                            {!testimonial.response?.content && (
                                                <Button
                                                    onClick={() => {
                                                        setSelectedTestimonial(testimonial);
                                                        setShowResponseModal(true);
                                                    }}
                                                    className="flex items-center gap-2"
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <MessageSquare size={16} />
                                                    Add Response
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Response Modal */}
            {showResponseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Add Response
                        </h3>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            rows={4}
                            placeholder="Write your response..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                        />
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleAddResponse}>Submit Response</Button>
                            <Button
                                onClick={() => {
                                    setShowResponseModal(false);
                                    setResponse('');
                                    setSelectedTestimonial(null);
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Testimonials;
