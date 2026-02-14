import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Input } from '../components';

interface SectorFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const SectorForm = ({ onClose, onSuccess, editId }: SectorFormProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sectorTitle: '',
        fullSector: ''
    });

    useEffect(() => {
        if (editId) {
            fetchSector();
        }
    }, [editId]);

    const fetchSector = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/sector/${editId}`);
            const sector = response.data.data;
            setFormData({
                sectorTitle: sector.sectorTitle || '',
                fullSector: sector.fullSector || ''
            });
        } catch (error) {
            toast.error('Failed to fetch sector details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.sectorTitle || !formData.fullSector) {
            toast.error('All fields are required');
            return;
        }

        try {
            setLoading(true);
            if (editId) {
                await axiosInstance.put(`/sector/${editId}`, formData);
                toast.success('Sector updated successfully');
            } else {
                await axiosInstance.post('/sector/add', formData);
                toast.success('Sector added successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save sector');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MapPin className="w-6 h-6" />
                        {editId ? 'Edit Sector' : 'Add New Sector'}
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
                            <MapPin className="w-5 h-5" />
                            Sector Details
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sector Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.sectorTitle}
                                    onChange={(e) => {
                                        const input = e.target.value.replace(/-/g, '').toUpperCase();
                                        const formatted = input.length > 3 ? `${input.slice(0, 3)}-${input.slice(3, 6)}` : input;
                                        setFormData({ ...formData, sectorTitle: formatted });
                                    }}
                                    placeholder="e.g., DXB-JED"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Sector <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.fullSector}
                                    onChange={(e) => setFormData({ ...formData, fullSector: e.target.value })}
                                    placeholder="e.g., Dubai-Jeddah"
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
                                    <MapPin className="w-5 h-5" />
                                    <span>{editId ? 'Update Sector' : 'Add Sector'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SectorForm;
