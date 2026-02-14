import { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Input } from '../components';

interface VisaFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const VisaForm = ({ onClose, onSuccess, editId }: VisaFormProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        country: '',
        visaType: '',
        processingTime: '',
        fee: '',
        requirements: ''
    });

    useEffect(() => {
        if (editId) {
            fetchVisa();
        }
    }, [editId]);

    const fetchVisa = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/visa/${editId}`);
            const visa = response.data.data;
            setFormData({
                country: visa.country || '',
                visaType: visa.visaType || '',
                processingTime: visa.processingTime || '',
                fee: visa.fee || '',
                requirements: visa.requirements || ''
            });
        } catch (error) {
            toast.error('Failed to fetch visa details');
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
                await axiosInstance.put(`/visa/${editId}`, formData);
                toast.success('Visa updated successfully');
            } else {
                await axiosInstance.post('/visa/add', formData);
                toast.success('Visa added successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save visa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Globe className="w-6 h-6" />
                        {editId ? 'Edit Visa' : 'Add New Visa'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 p-2 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Visa Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="country"
                                    required
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="Enter country name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Visa Type <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="visaType"
                                    required
                                    value={formData.visaType}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Tourist, Business, Student"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Processing Time <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="processingTime"
                                    required
                                    value={formData.processingTime}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 7-10 business days"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fee <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    name="fee"
                                    required
                                    value={formData.fee}
                                    onChange={handleInputChange}
                                    placeholder="Enter visa fee"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Requirements
                                </label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    placeholder="Enter visa requirements"
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
                            className="w-full sm:w-auto px-5 py-3 sm:px-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Globe className="w-5 h-5" />
                                    <span>{editId ? 'Update Visa' : 'Add Visa'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VisaForm;
