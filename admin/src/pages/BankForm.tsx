import { useState, useEffect } from 'react';
import { X, Building2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Input } from '../components';

interface BankFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

const BankForm = ({ onClose, onSuccess, editId }: BankFormProps) => {
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<File | null>(null);
    const [existingLogo, setExistingLogo] = useState<string>('');

    const [formData, setFormData] = useState({
        bankName: '',
        accountTitle: '',
        accountNo: '',
        ibn: '',
        bankAddress: ''
    });

    useEffect(() => {
        if (editId) {
            fetchBank();
        }
    }, [editId]);

    const fetchBank = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/bank/${editId}`);
            const bank = response.data.data;
            setFormData({
                bankName: bank.bankName || '',
                accountTitle: bank.accountTitle || '',
                accountNo: bank.accountNo || '',
                ibn: bank.ibn || '',
                bankAddress: bank.bankAddress || ''
            });
            setExistingLogo(bank.logo || '');
        } catch (error) {
            toast.error('Failed to fetch bank details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.bankName || !formData.accountTitle || !formData.accountNo || !formData.ibn || !formData.bankAddress) {
            toast.error('All fields are required');
            return;
        }

        if (!editId && !logo) {
            toast.error('Bank logo is required');
            return;
        }

        try {
            setLoading(true);
            const submitData = new FormData();
            submitData.append('bankName', formData.bankName);
            submitData.append('accountTitle', formData.accountTitle);
            submitData.append('accountNo', formData.accountNo);
            submitData.append('ibn', formData.ibn);
            submitData.append('bankAddress', formData.bankAddress);

            if (logo) {
                submitData.append('logo', logo);
            }

            if (editId) {
                await axiosInstance.put(`/bank/${editId}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Bank updated successfully');
            } else {
                await axiosInstance.post('/bank/add', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Bank added successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save bank');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6" />
                        {editId ? 'Edit Bank' : 'Add New Bank'}
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
                            <Building2 className="w-5 h-5" />
                            Bank Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="bankName"
                                    required
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    placeholder="Enter bank name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Account Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="accountTitle"
                                    required
                                    value={formData.accountTitle}
                                    onChange={handleInputChange}
                                    placeholder="Enter account title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="accountNo"
                                    required
                                    value={formData.accountNo}
                                    onChange={handleInputChange}
                                    placeholder="Enter account number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    IBAN <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="ibn"
                                    required
                                    value={formData.ibn}
                                    onChange={handleInputChange}
                                    placeholder="Enter IBAN"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bank Address <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="bankAddress"
                                    required
                                    value={formData.bankAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter bank address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Logo {!editId && <span className="text-red-500">*</span>}
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg cursor-pointer transition-all">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {logo ? logo.name : 'Choose bank logo'}
                                        </span>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            required={!editId}
                                            className="hidden"
                                        />
                                    </label>
                                    {existingLogo && !logo && (
                                        <img
                                            src={existingLogo}
                                            alt="Current logo"
                                            className="h-12 w-auto object-contain"
                                        />
                                    )}
                                </div>
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
                                    <Building2 className="w-5 h-5" />
                                    <span>{editId ? 'Update Bank' : 'Add Bank'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BankForm;
