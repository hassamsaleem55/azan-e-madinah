import { useState, useEffect } from 'react';
import { X, Plane, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Input } from '../components';
import { validateAirlineCode, validateTextLength, validateFile } from '../utils/validation';

interface AirlineFormProps {
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

interface FormErrors {
    airlineCode?: string;
    airlineName?: string;
    shortCode?: string;
    logo?: string;
}

const AirlineForm = ({ onClose, onSuccess, editId }: AirlineFormProps) => {
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [existingLogo, setExistingLogo] = useState<string>('');

    const [formData, setFormData] = useState({
        airlineCode: '',
        airlineName: '',
        shortCode: ''
    });

    useEffect(() => {
        if (editId) {
            fetchAirline();
        }
    }, [editId]);

    const fetchAirline = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/airline/${editId}`);
            const airline = response.data.data;
            setFormData({
                airlineCode: airline.airlineCode || '',
                airlineName: airline.airlineName || '',
                shortCode: airline.shortCode || ''
            });
            setExistingLogo(airline.logo || '');
        } catch (error) {
            toast.error('Failed to fetch airline details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileError = validateFile(file, ['image/jpeg', 'image/png', 'image/jpg'], 5);
            
            if (fileError) {
                setErrors((prev) => ({ ...prev, logo: fileError }));
                setLogo(null);
                toast.error(fileError);
            } else {
                setLogo(file);
                setErrors((prev) => ({ ...prev, logo: '' }));
            }
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        const codeError = validateAirlineCode(formData.airlineCode);
        if (codeError) newErrors.airlineCode = codeError;

        const nameError = validateTextLength(formData.airlineName, 'Airline name', 2, 100);
        if (nameError) newErrors.airlineName = nameError;

        const shortCodeError = validateTextLength(formData.shortCode, 'Short code', 2, 3);
        if (shortCodeError) newErrors.shortCode = shortCodeError;

        if (!editId && !logo) {
            newErrors.logo = 'Logo is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        try {
            setLoading(true);
            const submitData = new FormData();
            submitData.append('airlineCode', formData.airlineCode);
            submitData.append('airlineName', formData.airlineName);
            submitData.append('shortCode', formData.shortCode.toUpperCase());

            if (logo) {
                submitData.append('logo', logo);
            }

            if (editId) {
                await axiosInstance.put(`/airline/${editId}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Airline updated successfully');
            } else {
                await axiosInstance.post('/airline/add', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Airline added successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save airline');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Plane className="w-6 h-6" />
                        {editId ? 'Edit Airline' : 'Add New Airline'}
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
                            <Plane className="w-5 h-5" />
                            Airline Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Airline Code (Country) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="airlineCode"
                                    required
                                    value={formData.airlineCode}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Pakistan"
                                />
                                {errors.airlineCode && (
                                    <p className="mt-1 text-sm text-red-600">{errors.airlineCode}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Short Code (2-3 Letters) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="shortCode"
                                    required
                                    value={formData.shortCode}
                                    onChange={handleInputChange}
                                    placeholder="e.g., PK"
                                    className="uppercase"
                                />
                                {errors.shortCode && (
                                    <p className="mt-1 text-sm text-red-600">{errors.shortCode}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Airline Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="airlineName"
                                    required
                                    value={formData.airlineName}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Pakistan International Airlines"
                                />
                                {errors.airlineName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.airlineName}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Logo {!editId && <span className="text-red-500">*</span>}
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className={`flex-1 flex items-center gap-2 px-4 py-3 border-2 border-dashed ${
                                        errors.logo ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'
                                    } rounded-lg cursor-pointer transition-all`}>
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {logo ? logo.name : 'Choose airline logo (JPG, PNG, max 5MB)'}
                                        </span>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/jpeg,image/png,image/jpg"
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
                                {errors.logo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                                )}
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
                                    <Plane className="w-5 h-5" />
                                    <span>{editId ? 'Update Airline' : 'Add Airline'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AirlineForm;
