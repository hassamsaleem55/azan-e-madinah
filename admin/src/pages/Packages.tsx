import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Package } from '../types';
import PackageForm from './PackageForm';
import {
    PageMeta,
    PageLayout,
    PageHeader,
    PageContent,
    PageContentSection,
    FilterBar,
    Button,
    Badge,
    Modal,
    DataTable,
    LoadingState,
    EmptyState,
    FormField,
    Select,
} from '../components';

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

    const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Upcoming':
                return 'info';
            case 'Sold Out':
                return 'error';
            default:
                return 'warning';
        }
    };

    return (
        <>
            <PageMeta title="Package Management | Admin" description="Manage Umrah & Hajj packages" />
            
            <PageLayout>
                <PageHeader
                    title="Umrah & Hajj Packages"
                    description="Manage all travel packages"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Packages' },
                    ]}
                    actions={
                        <Button
                            onClick={handleCreate}
                            startIcon={<Plus className="w-4 h-4" />}
                        >
                            Add Package
                        </Button>
                    }
                />

                <FilterBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search packages..."
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Type">
                                <Select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    options={[
                                        { value: 'Umrah', label: 'Umrah' },
                                        { value: 'Hajj', label: 'Hajj' },
                                        { value: 'Combined', label: 'Combined' },
                                    ]}
                                    placeholder="All Types"
                                />
                            </FormField>
                            <FormField label="Status">
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    options={[
                                        { value: 'Active', label: 'Active' },
                                        { value: 'Inactive', label: 'Inactive' },
                                        { value: 'Sold Out', label: 'Sold Out' },
                                        { value: 'Upcoming', label: 'Upcoming' },
                                    ]}
                                    placeholder="All Status"
                                />
                            </FormField>
                            <FormField label="City">
                                <Select
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    options={[
                                        { value: 'Lahore', label: 'Lahore' },
                                        { value: 'Mumbai', label: 'Mumbai' },
                                        { value: 'Peshawar', label: 'Peshawar' },
                                    ]}
                                    placeholder="All Cities"
                                />
                            </FormField>
                        </div>
                    }
                    showFilters={true}
                />

                <PageContent>
                    <PageContentSection noPadding>
                        {loading ? (
                            <LoadingState message="Loading packages..." />
                        ) : filteredPackages.length === 0 ? (
                            <EmptyState
                                icon={<Plus className="w-16 h-16" />}
                                title="No packages found"
                                description="Try adjusting your filters, or add a new package."
                                action={
                                    <Button
                                        onClick={handleCreate}
                                        startIcon={<Plus className="w-4 h-4" />}
                                    >
                                        Add First Package
                                    </Button>
                                }
                            />
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        key: 'name',
                                        header: 'Package',
                                        render: (pkg: Package) => (
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {pkg.name}
                                            </div>
                                        ),
                                    },
                                    {
                                        key: 'type',
                                        header: 'Type',
                                        render: (pkg: Package) => (
                                            <Badge color="info">{pkg.type}</Badge>
                                        ),
                                    },
                                    {
                                        key: 'duration',
                                        header: 'Duration',
                                        render: (pkg: Package) => (
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {pkg.duration?.days} Days / {pkg.duration?.nights} Nights
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'price',
                                        header: 'Price Range',
                                        render: (pkg: Package) => {
                                            const prices = pkg.pricing?.map((p: any) => p.price) || [0];
                                            const min = Math.min(...prices);
                                            const max = Math.max(...prices);
                                            return (
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    PKR {min.toLocaleString()} - {max.toLocaleString()}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        key: 'status',
                                        header: 'Status',
                                        render: (pkg: Package) => (
                                            <Badge color={getStatusColor(pkg.status)}>
                                                {pkg.status}
                                            </Badge>
                                        ),
                                    },
                                    {
                                        key: 'actions',
                                        header: 'Actions',
                                        align: 'center',
                                        render: (pkg: Package) => (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(pkg)}
                                                    className="p-2 sm:p-2.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors touch-manipulation"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(pkg._id)}
                                                    className="p-2 sm:p-2.5 text-warning-600 hover:bg-warning-50 dark:text-warning-400 dark:hover:bg-warning-900/20 rounded-lg transition-colors touch-manipulation"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg._id)}
                                                    className="p-2 sm:p-2.5 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 rounded-lg transition-colors touch-manipulation"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ),
                                    },
                                ]}
                                data={filteredPackages}
                                keyExtractor={(pkg) => pkg._id}
                                hover
                            />
                        )}
                    </PageContentSection>
                </PageContent>

                {showModal && (
                    <PackageForm
                        onClose={handleModalClose}
                        onSuccess={handleModalSuccess}
                        editId={editingId}
                    />
                )}

                {showViewModal && selectedPackage && (
                    <Modal
                        isOpen={showViewModal}
                        onClose={() => setShowViewModal(false)}
                        title="Package Details"
                        size="xl"
                    >
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPackage.name}</h3>
                                <div className="flex items-center gap-3 mt-3">
                                    <Badge color="info">{selectedPackage.type}</Badge>
                                    <Badge color={getStatusColor(selectedPackage.status)}>
                                        {selectedPackage.status}
                                    </Badge>
                                    {selectedPackage.featured && (
                                        <Badge color="warning">Featured</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedPackage.duration?.days} Days / {selectedPackage.duration?.nights} Nights
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedPackage.type}
                                    </p>
                                </div>
                            </div>

                            {selectedPackage.description && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedPackage.description}</p>
                                </div>
                            )}

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

                            {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Package Includes</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {selectedPackage.inclusions.map((inclusion: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2 text-success-700 dark:text-success-400">
                                                <span className="text-success-600 dark:text-success-500">✓</span>
                                                <span>{inclusion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPackage.exclusions && selectedPackage.exclusions.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Not Included</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {selectedPackage.exclusions.map((exclusion: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2 text-error-700 dark:text-error-400">
                                                <span className="text-error-600 dark:text-error-500">✗</span>
                                                <span>{exclusion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}
            </PageLayout>
        </>
    );
};

export default Packages;
