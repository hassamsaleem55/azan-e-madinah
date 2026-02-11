import { useState, useEffect } from 'react';
import { Check, X, Star, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Testimonial } from '../types';
import {
  PageMeta,
  PageLayout,
  PageHeader,
  FilterBar,
  Button,
  Badge,
  Modal,
  LoadingState,
  EmptyState,
  FormField,
  Select,
  Textarea,
} from '../components';

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
            <PageMeta title="Testimonial Management | Admin" description="Review and manage customer feedback" />
            
            <PageLayout>
                <PageHeader
                    title="Customer Testimonials"
                    description="Review and manage customer feedback"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Testimonial Management' },
                    ]}
                />

                <FilterBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search testimonials..."
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Status">
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'Approved', label: 'Approved' },
                                        { value: 'Rejected', label: 'Rejected' },
                                    ]}
                                    placeholder="All Status"
                                />
                            </FormField>
                            <FormField label="Service Type">
                                <Select
                                    value={filters.serviceType}
                                    onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                                    options={[
                                        { value: 'Umrah Package', label: 'Umrah Package' },
                                        { value: 'Hajj Package', label: 'Hajj Package' },
                                        { value: 'Hotel Booking', label: 'Hotel Booking' },
                                        { value: 'Visa Service', label: 'Visa Service' },
                                        { value: 'Tour Package', label: 'Tour Package' },
                                    ]}
                                    placeholder="All Services"
                                />
                            </FormField>
                        </div>
                    }
                />

                {loading ? (
                    <LoadingState />
                ) : filteredTestimonials.length === 0 ? (
                    <EmptyState
                        title="No testimonials found"
                        description="No customer feedback matches your filters"
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredTestimonials.map((testimonial) => (
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
                                        <Badge 
                                            color={
                                                testimonial.status === 'Pending' ? 'warning' :
                                                testimonial.status === 'Approved' ? 'success' : 'error'
                                            }
                                        >
                                            {testimonial.status}
                                        </Badge>
                                        {testimonial.isFeatured && (
                                            <Badge color="info">Featured</Badge>
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
                        ))}
                    </div>
                )}

                {/* Response Modal */}
                <Modal
                    isOpen={showResponseModal}
                    onClose={() => {
                        setShowResponseModal(false);
                        setResponse('');
                        setSelectedTestimonial(null);
                    }}
                    title="Add Response"
                    size="md"
                >
                    <div className="p-6">
                        <Textarea
                            rows={4}
                            placeholder="Write your response..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 px-6 pb-6">
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
                </Modal>
            </PageLayout>
        </>
    );
};

export default Testimonials;
