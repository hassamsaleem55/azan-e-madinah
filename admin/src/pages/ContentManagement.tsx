import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import PageMeta from '../components/common/PageMeta';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Select } from '../components';
import { Content, ContentSection, ContentStatistic, ContentCoreValue } from '../types';

const ContentManagement = () => {
    const [selectedPage, setSelectedPage] = useState('ABOUT_US');
    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        sections: ContentSection[];
        statistics: ContentStatistic[];
        coreValues: ContentCoreValue[];
        companyNetwork: any[];
        metaTitle: string;
        metaDescription: string;
    }>({
        title: '',
        sections: [],
        statistics: [],
        coreValues: [],
        companyNetwork: [],
        metaTitle: '',
        metaDescription: ''
    });

    const pageOptions = [
        { value: 'ABOUT_US', label: 'About Us' },
        { value: 'HOMEPAGE', label: 'Homepage' },
        { value: 'CONTACT', label: 'Contact Us' },
        { value: 'SERVICES', label: 'Services' }
    ];

    useEffect(() => {
        fetchContent();
    }, [selectedPage]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/content/page/${selectedPage}`);
            if (response.data.content) {
                setContent(response.data.content);
                setFormData({
                    title: response.data.content.title || '',
                    sections: response.data.content.sections || [],
                    statistics: response.data.content.statistics || [],
                    coreValues: response.data.content.coreValues || [],
                    companyNetwork: response.data.content.companyNetwork || [],
                    metaTitle: response.data.content.seo?.metaTitle || '',
                    metaDescription: response.data.content.seo?.metaDescription || ''
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                pageKey: selectedPage,
                title: formData.title,
                sections: formData.sections,
                statistics: formData.statistics,
                coreValues: formData.coreValues,
                companyNetwork: formData.companyNetwork,
                seo: {
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription
                }
            };

            if (content?._id) {
                await axiosInstance.put(`/content/${content._id}`, payload);
            } else {
                await axiosInstance.post('/content', payload);
            }
            toast.success('Content saved successfully');
            fetchContent();
        } catch (error) {
            toast.error('Failed to save content');
            console.error(error);
        }
    };

    const handlePublish = async () => {
        if (!content?._id) {
            toast.error('Please save content first');
            return;
        }

        try {
            await axiosInstance.put(`/content/${content._id}/publish`);
            toast.success('Content published successfully');
            fetchContent();
        } catch (error) {
            toast.error('Failed to publish content');
            console.error(error);
        }
    };

    const addSection = () => {
        setFormData({
            ...formData,
            sections: [...formData.sections, { heading: '', content: '', order: formData.sections.length + 1 }]
        });
    };

    const updateSection = (index: number, field: keyof ContentSection, value: string | number) => {
        const newSections = [...formData.sections];
        if (field === 'heading' || field === 'content') {
            newSections[index][field] = value as string;
        } else if (field === 'order' || field === 'imageUrl') {
            newSections[index][field] = value as never;
        }
        setFormData({ ...formData, sections: newSections });
    };

    const removeSection = (index: number) => {
        setFormData({
            ...formData,
            sections: formData.sections.filter((_, i) => i !== index)
        });
    };

    const addStatistic = () => {
        setFormData({
            ...formData,
            statistics: [...formData.statistics, { label: '', value: '', icon: '' }]
        });
    };

    const updateStatistic = (index: number, field: keyof ContentStatistic, value: string) => {
        const newStats = [...formData.statistics];
        newStats[index][field] = value;
        setFormData({ ...formData, statistics: newStats });
    };

    const removeStatistic = (index: number) => {
        setFormData({
            ...formData,
            statistics: formData.statistics.filter((_, i) => i !== index)
        });
    };

    const addCoreValue = () => {
        setFormData({
            ...formData,
            coreValues: [...formData.coreValues, { title: '', description: '', icon: '' }]
        });
    };

    const updateCoreValue = (index: number, field: keyof ContentCoreValue, value: string) => {
        const newValues = [...formData.coreValues];
        newValues[index][field] = value;
        setFormData({ ...formData, coreValues: newValues });
    };

    const removeCoreValue = (index: number) => {
        setFormData({
            ...formData,
            coreValues: formData.coreValues.filter((_, i) => i !== index)
        });
    };

    return (
        <>
            <PageMeta title="Content Management | Admin" description="" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Content Management"
                    description="Manage website content and pages"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Content Management' },
                    ]}
                    actions={
                        <div className="flex gap-2">
                            <Button onClick={handleSave} className="flex items-center gap-2">
                                <Save size={18} />
                                Save
                            </Button>
                            {content?.isPublished === false && (
                                <Button onClick={handlePublish} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                    Publish
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <label className="text-lg font-semibold text-gray-900 dark:text-white">
                            Select Page
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose which page to edit</p>
                    </div>
                    <div className="p-6">
                        <Select
                        value={selectedPage}
                        onChange={(e) => setSelectedPage(e.target.value)}
                        options={pageOptions.map(opt => ({
                            value: opt.value,
                            label: opt.label
                        }))}
                    />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {/* Basic Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Page title and metadata</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Page Title
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter page title"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Sections</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Add and manage page sections</p>
                                    </div>
                                    <Button onClick={addSection} size="sm" className="flex items-center gap-2">
                                        <Plus size={16} />
                                        Add Section
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {formData.sections.map((section, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Section {index + 1}
                                            </span>
                                            <button
                                                onClick={() => removeSection(index)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <Input
                                                type="text"
                                                placeholder="Section Heading"
                                                value={section.heading}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSection(index, 'heading', e.target.value)}
                                            />
                                            <textarea
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                                rows={4}
                                                placeholder="Section Content"
                                                value={section.content}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSection(index, 'content', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Statistics</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Add statistical data</p>
                                    </div>
                                    <Button onClick={addStatistic} size="sm" className="flex items-center gap-2">
                                        <Plus size={16} />
                                        Add Statistic
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.statistics.map((stat, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-end mb-2">
                                            <button
                                                onClick={() => removeStatistic(index)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <Input
                                                type="text"
                                                placeholder="Label"
                                                value={stat.label}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStatistic(index, 'label', e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Value"
                                                value={stat.value}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStatistic(index, 'value', e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Icon (optional)"
                                                value={stat.icon}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStatistic(index, 'icon', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Core Values */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Core Values</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Define company values</p>
                                    </div>
                                    <Button onClick={addCoreValue} size="sm" className="flex items-center gap-2">
                                        <Plus size={16} />
                                        Add Value
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {formData.coreValues.map((value, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Value {index + 1}
                                            </span>
                                            <button
                                                onClick={() => removeCoreValue(index)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <Input
                                                type="text"
                                                placeholder="Title"
                                                value={value.title}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoreValue(index, 'title', e.target.value)}
                                            />
                                            <textarea
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                                rows={3}
                                                placeholder="Description"
                                                value={value.description}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCoreValue(index, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Meta tags for search engines</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meta Title
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.metaTitle}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        placeholder="Enter meta title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                        placeholder="Enter meta description"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ContentManagement;
