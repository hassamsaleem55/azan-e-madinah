import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Edit, Clock, Globe, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Visa } from '../types';
import {
  PageMeta,
  PageLayout,
  PageHeader,
  PageContent,
  PageContentSection,
  Button,
  LoadingState,
} from '../components';

const VisaDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [visa, setVisa] = useState<Visa | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
    const [expandedDocSections, setExpandedDocSections] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (id) {
            fetchVisa();
        }
    }, [id]);

    const fetchVisa = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/visas/${id}`);
            setVisa(response.data.data || response.data.visa);
        } catch (error) {
            toast.error('Failed to fetch visa details');
            navigate('/visas');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const toggleDocSection = (key: string) => {
        setExpandedDocSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <PageLayout>
                <LoadingState />
            </PageLayout>
        );
    }

    if (!visa) {
        return null;
    }

    return (
        <>
            <PageMeta title={`${visa.country.name} ${visa.visaType} | Visa Details`} description={visa.metaDescription || `Visa details for ${visa.country.name}`} />
            
            <PageLayout>
                <PageHeader
                    title={`${visa.country.name} Visa`}
                    description={visa.visaType}
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Visas', path: '/visas' },
                        { label: visa.country.name },
                    ]}
                    actions={
                        <div className="flex items-center gap-3">
                            <Button onClick={() => navigate('/visas')} variant="outline">
                                ← Back to Visas
                            </Button>
                            <Button onClick={() => navigate(`/visas/edit/${visa._id}`)} startIcon={<Edit className="w-4 h-4" />}>
                                Edit Visa
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    {/* Hero Image */}
                    {visa.images && visa.images.length > 0 && (
                        <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src={visa.images[0].url}
                                alt={visa.country.name}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <PageContentSection>
                                <div className="flex items-center gap-3 mb-4">
                                    {visa.country.flagUrl ? (
                                        <img src={visa.country.flagUrl} alt={visa.country.name} className="w-16 h-16 object-contain rounded shadow" />
                                    ) : (
                                        <Globe className="w-12 h-12 text-brand-500" />
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-600 dark:text-brand-400">{visa.country.name} Visa</h2>
                                        <p className="text-gray-600 dark:text-gray-400">{visa.visaType}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Visa Type</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{visa.visaType}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Entry Type</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{visa.entryType || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Processing Time</p>
                                        <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Clock size={16} />
                                            {visa.processingTime.min}{visa.processingTime.max && `-${visa.processingTime.max}`} {visa.processingTime.unit}
                                        </p>
                                    </div>
                                </div>
                            </PageContentSection>

                            {/* Document Requirements */}
                            {visa.documentRequirements && visa.documentRequirements.length > 0 && (
                                <PageContentSection>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Required Documents & Eligibility</h3>
                                    <div className="space-y-3">
                                        {visa.documentRequirements.map((requirement, index) => (
                                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => toggleCategory(requirement.category)}
                                                    className="w-full flex items-center justify-between px-6 py-4 bg-linear-to-r from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 hover:from-brand-100 hover:to-brand-200/50 transition-all"
                                                >
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{requirement.category}</h4>
                                                    {expandedCategories[requirement.category] ? (
                                                        <ChevronDown className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>

                                                {expandedCategories[requirement.category] && (
                                                    <div className="px-6 py-4 bg-white dark:bg-gray-800">
                                                        {/* Identification Documents */}
                                                        <div className="mb-4">
                                                            <button
                                                                onClick={() => toggleDocSection(`${requirement.category}-identification`)}
                                                                className="w-full flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                                                            >
                                                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Identification Documents</h5>
                                                                {expandedDocSections[`${requirement.category}-identification`] ? (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            {expandedDocSections[`${requirement.category}-identification`] && (
                                                                <ul className="mt-3 space-y-2 ml-4">
                                                                    {requirement.documents.filter(doc => doc.name.toLowerCase().includes('passport') || doc.name.toLowerCase().includes('cnic') || doc.name.toLowerCase().includes('id')).map((doc, idx) => (
                                                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                            <span className="text-brand-600 mt-0.5">•</span>
                                                                            <div>
                                                                                <span className="font-medium">{doc.name}</span>
                                                                                {doc.description && <span className="text-gray-500 dark:text-gray-400 ml-1">- {doc.description}</span>}
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>

                                                        {/* Financial Documents */}
                                                        <div className="mb-4">
                                                            <button
                                                                onClick={() => toggleDocSection(`${requirement.category}-financial`)}
                                                                className="w-full flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                                                            >
                                                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Financial Documents</h5>
                                                                {expandedDocSections[`${requirement.category}-financial`] ? (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            {expandedDocSections[`${requirement.category}-financial`] && (
                                                                <ul className="mt-3 space-y-2 ml-4">
                                                                    {requirement.documents.filter(doc => doc.name.toLowerCase().includes('bank') || doc.name.toLowerCase().includes('tax') || doc.name.toLowerCase().includes('income')).map((doc, idx) => (
                                                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                            <span className="text-brand-600 mt-0.5">•</span>
                                                                            <div>
                                                                                <span className="font-medium">{doc.name}</span>
                                                                                {doc.description && <span className="text-gray-500 dark:text-gray-400 ml-1">- {doc.description}</span>}
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>

                                                        {/* Supporting Documents */}
                                                        <div className="mb-4">
                                                            <button
                                                                onClick={() => toggleDocSection(`${requirement.category}-supporting`)}
                                                                className="w-full flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                                                            >
                                                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Supporting Documents</h5>
                                                                {expandedDocSections[`${requirement.category}-supporting`] ? (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            {expandedDocSections[`${requirement.category}-supporting`] && (
                                                                <ul className="mt-3 space-y-2 ml-4">
                                                                    {requirement.documents.filter(doc => 
                                                                        !doc.name.toLowerCase().includes('passport') && 
                                                                        !doc.name.toLowerCase().includes('cnic') &&
                                                                        !doc.name.toLowerCase().includes('id') &&
                                                                        !doc.name.toLowerCase().includes('bank') &&
                                                                        !doc.name.toLowerCase().includes('tax') &&
                                                                        !doc.name.toLowerCase().includes('income')
                                                                    ).map((doc, idx) => (
                                                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                            <span className="text-brand-600 mt-0.5">•</span>
                                                                            <div>
                                                                                <span className="font-medium">{doc.name}</span>
                                                                                {doc.description && <span className="text-gray-500 dark:text-gray-400 ml-1">- {doc.description}</span>}
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>

                                                        {/* All Documents */}
                                                        {requirement.documents.length === 0 && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">No specific documents listed for this category.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </PageContentSection>
                            )}

                            {/* Important Notes */}
                            {visa.importantNotes && visa.importantNotes.length > 0 && (
                                <PageContentSection>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Important Notes</h3>
                                    <ul className="space-y-2">
                                        {visa.importantNotes.map((note, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                                <span className="text-warning-600 mt-1">⚠</span>
                                                <span>{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </PageContentSection>
                            )}

                            {/* Services Included */}
                            {visa.servicesIncluded && visa.servicesIncluded.length > 0 && (
                                <PageContentSection>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Services Included</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {visa.servicesIncluded.map((service, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-success-50 dark:bg-success-900/20 px-3 py-2 rounded">
                                                <span className="text-success-600">✓</span>
                                                <span>{service}</span>
                                            </div>
                                        ))}
                                    </div>
                                </PageContentSection>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Pricing Card */}
                            <PageContentSection>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Visa Assistance Fee</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Adult</span>
                                        <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                                            PKR {visa.pricing.adult.toLocaleString()}
                                        </span>
                                    </div>
                                    {visa.pricing.child && visa.pricing.child > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Child (2-12 yrs)</span>
                                            <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                                                PKR {visa.pricing.child.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Button className="w-full mt-6 py-3 bg-linear-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700">
                                    Apply Online Now
                                </Button>

                                {visa.successRate && visa.successRate > 0 && (
                                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold">{visa.successRate}%</span>
                                        </div>
                                        <span>Success Rate</span>
                                    </div>
                                )}
                            </PageContentSection>

                            {/* Additional Info */}
                            <PageContentSection>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                                        <span className={`font-semibold ${visa.status === 'Active' ? 'text-success-600' : 'text-gray-600'}`}>
                                            {visa.status}
                                        </span>
                                    </div>
                                    {visa.validityDuration && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Validity</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {visa.validityDuration.value} {visa.validityDuration.unit}
                                            </span>
                                        </div>
                                    )}
                                    {visa.interviewRequired !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Interview</span>
                                            <span className={`font-semibold ${visa.interviewRequired ? 'text-warning-600' : 'text-success-600'}`}>
                                                {visa.interviewRequired ? 'Required' : 'Not Required'}
                                            </span>
                                        </div>
                                    )}
                                    {visa.bankStatementRequired !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Bank Statement</span>
                                            <span className={`font-semibold ${visa.bankStatementRequired ? 'text-warning-600' : 'text-success-600'}`}>
                                                {visa.bankStatementRequired ? 'Required' : 'Not Required'}
                                            </span>
                                        </div>
                                    )}
                                    {visa.applicationCount && visa.applicationCount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Applications</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {visa.applicationCount}+
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </PageContentSection>
                        </div>
                    </div>
                </PageContent>
            </PageLayout>
        </>
    );
};

export default VisaDetail;
