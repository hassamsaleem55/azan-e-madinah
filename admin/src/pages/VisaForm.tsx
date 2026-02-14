import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2, Globe, Image as ImageIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import axiosInstance from '../Api/axios';
import { Visa, DocumentRequirement } from '../types';
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

const VisaForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        country: {
            name: '',
            code: '',
            flagUrl: '' as string | undefined
        },
        visaType: 'Tourist',
        entryType: 'Single Entry',
        processingTime: {
            min: 1,
            max: 0 as number | undefined,
            unit: 'Days'
        },
        validityDuration: {
            value: 30,
            unit: 'Days'
        },
        pricing: {
            adult: 0,
            child: 0 as number | undefined,
            currency: 'PKR' as string | undefined
        },
        status: 'Active',
        processingStatus: 'Open',
        interviewRequired: false,
        bankStatementRequired: false,
        invitationRequired: false,
        isFeatured: false
    });

    const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
    const [requirements, setRequirements] = useState<string[]>([]);
    const [importantNotes, setImportantNotes] = useState<string[]>([]);
    const [servicesIncluded, setServicesIncluded] = useState<string[]>(['Document Review', 'Application Submission', 'Tracking']);
    const [imageUrls, setImageUrls] = useState<Array<{ url: string; caption?: string; isPrimary: boolean }>>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');

    useEffect(() => {
        if (id) {
            fetchVisa();
        }
    }, [id]);

    const fetchVisa = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/visas/${id}`);
            const visa: Visa = response.data.data || response.data.visa;

            setFormData({
                country: visa.country ? { ...visa.country, flagUrl: visa.country.flagUrl || '' } : { name: '', code: '', flagUrl: '' },
                visaType: visa.visaType || 'Tourist',
                entryType: visa.entryType || 'Single Entry',
                processingTime: visa.processingTime ? { ...visa.processingTime, max: visa.processingTime.max || 0 } : { min: 1, max: 0, unit: 'Days' },
                validityDuration: visa.validityDuration || { value: 30, unit: 'Days' },
                pricing: visa.pricing ? { ...visa.pricing, child: visa.pricing.child || 0, currency: visa.pricing.currency || 'PKR' } : { adult: 0, child: 0, currency: 'PKR' },
                status: visa.status || 'Active',
                processingStatus: visa.processingStatus || 'Open',
                interviewRequired: visa.interviewRequired || false,
                bankStatementRequired: visa.bankStatementRequired || false,
                invitationRequired: visa.invitationRequired || false,
                isFeatured: visa.isFeatured || false
            });

            if (visa.documentRequirements) setDocumentRequirements(visa.documentRequirements);
            if (visa.requirements) setRequirements(visa.requirements);
            if (visa.importantNotes) setImportantNotes(visa.importantNotes);
            if (visa.servicesIncluded) setServicesIncluded(visa.servicesIncluded);
            if (visa.images) setImageUrls(visa.images.map(img => ({ ...img, isPrimary: img.isPrimary ?? false })));
        } catch (error) {
            toast.error('Failed to fetch visa details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, action: 'save' | 'saveAndView' = 'save') => {
        e.preventDefault();

        if (!formData.country.name || !formData.country.code || !formData.visaType) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                documentRequirements,
                requirements,
                importantNotes,
                servicesIncluded,
                images: imageUrls
            };

            if (id) {
                await axiosInstance.put(`/visas/${id}`, payload);
                toast.success('Visa updated successfully');
                if (action === 'saveAndView') {
                    navigate(`/visas/${id}`);
                } else {
                    navigate('/visas');
                }
            } else {
                const response = await axiosInstance.post('/visas', payload);
                const newVisaId = response.data.data?._id || response.data.visa?._id;
                toast.success('Visa created successfully');
                if (action === 'saveAndView' && newVisaId) {
                    navigate(`/visas/${newVisaId}`);
                } else {
                    navigate('/visas');
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save visa');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name.includes('.')) {
            const parts = name.split('.');
            if (parts.length === 2) {
                const [parent, child] = parts;
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...(prev as any)[parent],
                        [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
                    }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
            }));
        }
    };

    // Document Requirement Functions
    const addDocumentCategory = () => {
        setDocumentRequirements(prev => [...prev, {
            category: 'All',
            documents: []
        }]);
    };

    const updateDocumentCategory = (index: number, category: string) => {
        setDocumentRequirements(prev => {
            const updated = [...prev];
            updated[index].category = category as any;
            return updated;
        });
    };

    const removeDocumentCategory = (index: number) => {
        setDocumentRequirements(prev => prev.filter((_, i) => i !== index));
    };

    const addDocument = (categoryIndex: number) => {
        setDocumentRequirements(prev => {
            const updated = [...prev];
            updated[categoryIndex].documents.push({
                name: '',
                description: '',
                isMandatory: true
            });
            return updated;
        });
    };

    const updateDocument = (categoryIndex: number, docIndex: number, field: string, value: any) => {
        setDocumentRequirements(prev => {
            const updated = [...prev];
            (updated[categoryIndex].documents[docIndex] as any)[field] = value;
            return updated;
        });
    };

    const removeDocument = (categoryIndex: number, docIndex: number) => {
        setDocumentRequirements(prev => {
            const updated = [...prev];
            updated[categoryIndex].documents = updated[categoryIndex].documents.filter((_, i) => i !== docIndex);
            return updated;
        });
    };

    // Requirement Functions
    const addRequirement = () => {
        setRequirements(prev => [...prev, '']);
    };

    const updateRequirement = (index: number, value: string) => {
        setRequirements(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const removeRequirement = (index: number) => {
        setRequirements(prev => prev.filter((_, i) => i !== index));
    };

    // Important Notes Functions
    const addImportantNote = () => {
        setImportantNotes(prev => [...prev, '']);
    };

    const updateImportantNote = (index: number, value: string) => {
        setImportantNotes(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const removeImportantNote = (index: number) => {
        setImportantNotes(prev => prev.filter((_, i) => i !== index));
    };

    // Service Functions
    const toggleService = (service: string) => {
        setServicesIncluded(prev => {
            if (prev.includes(service)) {
                return prev.filter(s => s !== service);
            } else {
                return [...prev, service];
            }
        });
    };

    // Image Functions
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

    const availableServices = [
        'Document Review',
        'Application Submission',
        'Tracking',
        'Courier Service',
        'Translation',
        'Attestation'
    ];

    return (
        <>
            <PageMeta title={`${id ? 'Edit' : 'Add'} Visa | Admin`} description="Manage visa services" />
            
            <PageLayout>
                <PageHeader
                    title={id ? 'Edit Visa' : 'Add New Visa'}
                    description="Manage visa services for all countries"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Visas', path: '/visas' },
                        { label: id ? 'Edit Visa' : 'Add Visa' },
                    ]}
                />

                <PageContent>
                    <PageContentSection>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Country Information */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Country Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Country Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="country.name"
                                            value={formData.country.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., United Kingdom"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Country Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="country.code"
                                            value={formData.country.code}
                                            onChange={handleInputChange}
                                            placeholder="e.g., UK"
                                            maxLength={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Flag URL
                                        </label>
                                        <Input
                                            type="text"
                                            name="country.flagUrl"
                                            value={formData.country.flagUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Visa Type & Entry */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Visa Type</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Type <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                name="visaType"
                                                value={formData.visaType}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: 'Tourist', label: 'Tourist' },
                                                    { value: 'Business', label: 'Business' },
                                                    { value: 'Student', label: 'Student' },
                                                    { value: 'Work', label: 'Work' },
                                                    { value: 'Family Visit', label: 'Family Visit' },
                                                    { value: 'Transit', label: 'Transit' },
                                                    { value: 'Sticker Visa', label: 'Sticker Visa' },
                                                    { value: 'E-Visa', label: 'E-Visa' },
                                                    { value: 'Easy Sticker Visa', label: 'Easy Sticker Visa' }
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Entry Type
                                            </label>
                                            <Select
                                                name="entryType"
                                                value={formData.entryType}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: 'Single Entry', label: 'Single Entry' },
                                                    { value: 'Multiple Entry', label: 'Multiple Entry' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Processing Time</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Min <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                name="processingTime.min"
                                                min="1"
                                                value={formData.processingTime.min.toString()}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Max
                                            </label>
                                            <Input
                                                type="number"
                                                name="processingTime.max"
                                                min="0"
                                                value={formData.processingTime.max?.toString() || '0'}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Unit
                                            </label>
                                            <Select
                                                name="processingTime.unit"
                                                value={formData.processingTime.unit}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: 'Days', label: 'Days' },
                                                    { value: 'Weeks', label: 'Weeks' },
                                                    { value: 'Months', label: 'Months' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Validity & Pricing */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Validity & Pricing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Validity Value
                                        </label>
                                        <Input
                                            type="number"
                                            name="validityDuration.value"
                                            min="1"
                                            value={formData.validityDuration.value.toString()}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Validity Unit
                                        </label>
                                        <Select
                                            name="validityDuration.unit"
                                            value={formData.validityDuration.unit}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: 'Days', label: 'Days' },
                                                { value: 'Months', label: 'Months' },
                                                { value: 'Years', label: 'Years' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Adult Price (PKR) <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            name="pricing.adult"
                                            min="0"
                                            value={formData.pricing.adult.toString()}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Child Price (PKR)
                                        </label>
                                        <Input
                                            type="number"
                                            name="pricing.child"
                                            min="0"
                                            value={formData.pricing.child?.toString() || '0'}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status & Requirements */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status & Requirements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' },
                                                { value: 'Suspended', label: 'Suspended' },
                                                { value: 'Coming Soon', label: 'Coming Soon' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Processing Status
                                        </label>
                                        <Select
                                            name="processingStatus"
                                            value={formData.processingStatus}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: 'Open', label: 'Open' },
                                                { value: 'Limited', label: 'Limited' },
                                                { value: 'Closed', label: 'Closed' },
                                                { value: 'By Appointment', label: 'By Appointment' }
                                            ]}
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-wrap gap-6 items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="interviewRequired"
                                                checked={formData.interviewRequired}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interview Required</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="bankStatementRequired"
                                                checked={formData.bankStatementRequired}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Statement Required</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="invitationRequired"
                                                checked={formData.invitationRequired}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invitation Required</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isFeatured"
                                                checked={formData.isFeatured}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Visa</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Document Requirements */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Document Requirements by Category</h3>
                                    <button
                                        type="button"
                                        onClick={addDocumentCategory}
                                        className="px-4 py-2 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <Plus size={18} /> Add Category
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {documentRequirements.map((requirement, catIndex) => (
                                        <div key={catIndex} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <Select
                                                    value={requirement.category}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateDocumentCategory(catIndex, e.target.value)}
                                                    options={[
                                                        { value: 'All', label: 'All' },
                                                        { value: 'Business Owner', label: 'Business Owner' },
                                                        { value: 'Job Holder', label: 'Job Holder' },
                                                        { value: 'Retired Person', label: 'Retired Person' },
                                                        { value: 'Student', label: 'Student' },
                                                        { value: 'Dependent', label: 'Dependent' }
                                                    ]}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocumentCategory(catIndex)}
                                                    className="text-error-600 hover:text-error-700 ml-2"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="space-y-2 ml-4">
                                                {requirement.documents.map((doc, docIndex) => (
                                                    <div key={docIndex} className="flex gap-2">
                                                        <Input
                                                            type="text"
                                                            placeholder="Document name"
                                                            value={doc.name}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDocument(catIndex, docIndex, 'name', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="text"
                                                            placeholder="Description (optional)"
                                                            value={doc.description || ''}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDocument(catIndex, docIndex, 'description', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDocument(catIndex, docIndex)}
                                                            className="px-3 py-2 text-error-600 hover:text-error-700"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addDocument(catIndex)}
                                                    className="text-brand-600 hover:text-brand-700 text-sm flex items-center gap-1"
                                                >
                                                    <Plus size={16} /> Add Document
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* General Requirements & Notes */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Requirements */}
                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">General Requirements</h3>
                                        <button
                                            type="button"
                                            onClick={addRequirement}
                                            className="px-3 py-1.5 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors flex items-center gap-1 text-sm shadow-sm"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {requirements.map((req, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Requirement"
                                                    value={req}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRequirement(index, e.target.value)}
                                                    className="flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeRequirement(index)}
                                                    className="px-3 py-2 text-error-600 hover:text-error-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Important Notes */}
                                <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Important Notes</h3>
                                        <button
                                            type="button"
                                            onClick={addImportantNote}
                                            className="px-3 py-1.5 bg-linear-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors flex items-center gap-1 text-sm shadow-sm"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {importantNotes.map((note, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Important note"
                                                    value={note}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateImportantNote(index, e.target.value)}
                                                    className="flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImportantNote(index)}
                                                    className="px-3 py-2 text-error-600 hover:text-error-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Services Included */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Services Included</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {availableServices.map((service) => (
                                        <label key={service} className="flex items-center gap-2 cursor-pointer p-3 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={servicesIncluded.includes(service)}
                                                onChange={() => toggleService(service)}
                                                className="w-4 h-4 text-brand-600 rounded"
                                            />
                                            <span className="text-sm font-medium">{service}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" />
                                    Visa Images
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
                                                <img src={image.url} alt={image.caption || 'Visa'} className="w-full h-48 object-cover" />
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
                                                            className="px-3 py-1 bg-white text-gray-900 rounded text-sm"
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
                                    onClick={() => navigate('/visas')}
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

export default VisaForm;
