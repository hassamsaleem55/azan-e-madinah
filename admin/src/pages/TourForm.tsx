import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Input } from '../components';

interface TourFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const TourForm = ({ onClose, onSuccess, editId }: TourFormProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        duration: '',
        price: '',
        description: ''
    });

    useEffect(() => {
        if (editId) {
            fetchTour();
        }
    }, [editId]);

    const fetchTour = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/tour/${editId}`);
            const tour = response.data.data;
            setFormData({
                name: tour.name || '',
                destination: tour.destination || '',
                duration: tour.duration || '',
                price: tour.price || '',
                description: tour.description || ''
            });
        } catch (error) {
            toast.error('Failed to fetch tour details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            if (editId) {
                await axiosInstance.put(`/tour/${editId}`, formData);
                toast.success('Tour updated successfully');
            } else {
                await axiosInstance.post('/tour/add', formData);
                toast.success('Tour added successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save tour');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MapPin className="w-6 h-6" />
                        {editId ? 'Edit Tour' : 'Add New Tour'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Tour Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tour Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter tour name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Destination <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="destination"
                                    required
                                    value={formData.destination}
                                    onChange={handleInputChange}
                                    placeholder="Enter destination"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duration <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="duration"
                                    required
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 7 Days / 6 Nights"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    name="price"
                                    required
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="Enter price"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter tour description"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-3 sm:px-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all touch-manipulation"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-5 py-3 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5" />
                                    <span>{editId ? 'Update Tour' : 'Add Tour'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TourForm;
