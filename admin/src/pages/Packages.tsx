import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import PageMeta from '../components/common/PageMeta';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Package } from '../types';
import PackageForm from './PackageForm';

const Packages = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        city: ''
    });

    useEffect(() => {
        fetchPackages();
    }, [filters]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/packages', {
                params: filters
            });
            setPackages(response.data.packages || []);
        } catch (error) {
            toast.error('Failed to fetch packages');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this package?')) return;

        try {
            await axiosInstance.delete(`/packages/${id}`);
            toast.success('Package deleted successfully');
            fetchPackages();
        } catch (error) {
            toast.error('Failed to delete package');
            console.error(error);
        }
    };

    const handleView = (pkg: Package) => {
        setSelectedPackage(pkg);
        setShowViewModal(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setShowModal(true);
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        setEditingId(null);
        fetchPackages();
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Package Management | Admin" description={''} />
            
            <div className="space-y-6">
                <PageBreadCrumb pageTitle="Package Management" />

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Umrah & Hajj Packages
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage all travel packages
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Package
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Search packages..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="Umrah">Umrah</option>
                                <option value="Hajj">Hajj</option>
                                <option value="Combined">Combined</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Sold Out">Sold Out</option>
                                <option value="Upcoming">Upcoming</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            >
                                <option value="">All Cities</option>
                                <option value="Lahore">Lahore</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Peshawar">Peshawar</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredPackages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No packages found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Package
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Price Range
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredPackages.map((pkg) => (
                                        <tr key={pkg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {pkg.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                    {pkg.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {pkg.duration?.days} Days / {pkg.duration?.nights} Nights
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                PKR {Math.min(...(pkg.pricing?.map((p: any) => p.price) || [0])).toLocaleString()} - 
                                                PKR {Math.max(...(pkg.pricing?.map((p: any) => p.price) || [0])).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    pkg.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    pkg.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                    pkg.status === 'Sold Out' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                }`}>
                                                    {pkg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleView(pkg)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(pkg._id)}
                                                        className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pkg._id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}  
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <PackageForm
                        onClose={handleModalClose}
                        onSuccess={handleModalSuccess}
                        editId={editingId}
                    />
                )}

                {/* View Modal */}
                {showViewModal && selectedPackage && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Package Details
                                </h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Header */}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPackage.name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {selectedPackage.type}
                                        </span>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                            selectedPackage.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            selectedPackage.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                            selectedPackage.status === 'Sold Out' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        }`}>
                                            {selectedPackage.status}
                                        </span>
                                        {selectedPackage.featured && (
                                            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {selectedPackage.duration?.days} Days / {selectedPackage.duration?.nights} Nights
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedPackage.type}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedPackage.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                                        <p className="text-gray-600 dark:text-gray-400">{selectedPackage.description}</p>
                                    </div>
                                )}

                                {/* Accommodation */}
                                {selectedPackage.accommodation && selectedPackage.accommodation.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Accommodation</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedPackage.accommodation.map((acc: any, index: number) => (
                                                <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{acc.city}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {acc.hotel?.name || 'Hotel TBD'} - {acc.nights} nights
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pricing */}
                                {selectedPackage.pricing && selectedPackage.pricing.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pricing Tiers</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {selectedPackage.pricing.map((price: any, index: number) => (
                                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{price.tierType}</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                        PKR {price.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Inclusions */}
                                {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Package Includes</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {selectedPackage.inclusions.map((inclusion: string, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                                    <span className="text-green-600 dark:text-green-500">✓</span>
                                                    <span>{inclusion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Exclusions */}
                                {selectedPackage.exclusions && selectedPackage.exclusions.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Not Included</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {selectedPackage.exclusions.map((exclusion: string, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                                    <span className="text-red-600 dark:text-red-500">✗</span>
                                                    <span>{exclusion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Packages;
