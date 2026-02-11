import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import { Visa } from '../types';
import {
  PageMeta,
  PageLayout,
  PageHeader,
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

const Visas = () => {
    const [visas, setVisas] = useState<Visa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingVisa, setEditingVisa] = useState<Visa | null>(null);
    const [selectedVisa, setSelectedVisa] = useState<Visa | null>(null);
    const [filters, setFilters] = useState({
        visaType: '',
        status: ''
    });

    useEffect(() => {
        fetchVisas();
    }, [filters]);

    const fetchVisas = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/visas', {
                params: { ...filters, limit: 100 }
            });
            setVisas(response.data.visas || []);
        } catch (error) {
            toast.error('Failed to fetch visas');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this visa?')) return;

        try {
            await axiosInstance.delete(`/visas/${id}`);
            toast.success('Visa deleted successfully');
            fetchVisas();
        } catch (error) {
            toast.error('Failed to delete visa');
            console.error(error);
        }
    };

    const handleCreate = () => {
        setEditingVisa(null);
        setShowModal(true);
    };

    const handleEdit = (visa: Visa) => {
        setEditingVisa(visa);
        setShowModal(true);
    };

    const handleView = (visa: Visa) => {
        setSelectedVisa(visa);
        setShowViewModal(true);
    };

    const filteredVisas = visas.filter(visa =>
        visa.country?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visa.visaType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Visa Management | Admin" description="Manage visa services for all countries" />
            
            <PageLayout>
                <PageHeader
                    title="Visa Services"
                    description="Manage visa services for all countries"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Visa Management' },
                    ]}
                    actions={
                        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                            Add Visa
                        </Button>
                    }
                />

                <FilterBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search by country or type..."
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Visa Type">
                                <Select
                                    value={filters.visaType}
                                    onChange={(e) => setFilters({ ...filters, visaType: e.target.value })}
                                    options={[
                                        { value: 'Tourist', label: 'Tourist' },
                                        { value: 'Business', label: 'Business' },
                                        { value: 'Student', label: 'Student' },
                                        { value: 'Work', label: 'Work' },
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
                                    ]}
                                    placeholder="All Status"
                                />
                            </FormField>
                        </div>
                    }
                />

                {loading ? (
                    <LoadingState />
                ) : filteredVisas.length === 0 ? (
                    <EmptyState
                        title="No visas found"
                        description="Get started by adding your first visa service"
                        action={
                            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                                Add Visa
                            </Button>
                        }
                    />
                ) : (
                    <DataTable
                        columns={[
                            {
                                key: 'country',
                                header: 'Country',
                                render: (visa: Visa) => (
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} className="text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {visa.country?.name}
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                key: 'type',
                                header: 'Visa Type',
                                render: (visa: Visa) => (
                                    <Badge color="info">{visa.visaType}</Badge>
                                ),
                            },
                            {
                                key: 'processing',
                                header: 'Processing Time',
                                render: (visa: Visa) => (
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {visa.processingTime?.min}-{visa.processingTime?.max || visa.processingTime?.min} {visa.processingTime?.unit}
                                    </span>
                                ),
                            },
                            {
                                key: 'price',
                                header: 'Price',
                                render: (visa: Visa) => (
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        PKR {visa.pricing?.adult?.toLocaleString()}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (visa: Visa) => (
                                    <Badge color={visa.status === 'Active' ? 'success' : 'light'}>
                                        {visa.status}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'actions',
                                header: 'Actions',
                                render: (visa: Visa) => (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleView(visa)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                                            title="View"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(visa)}
                                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(visa._id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        data={filteredVisas}
                        keyExtractor={(visa) => visa._id}
                    />
                )}

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingVisa ? 'Edit Visa' : 'Add New Visa'}
                    size="lg"
                >
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                            Visa form implementation pending - API integration required
                        </p>
                    </div>
                </Modal>

                {/* View Modal */}
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="Visa Details"
                    size="lg"
                >
                    {selectedVisa && (
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedVisa.country?.name || 'N/A'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedVisa.visaType}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Processing Time</p>
                                    <p className="text-gray-900 dark:text-white">
                                        {selectedVisa.processingTime?.min}-{selectedVisa.processingTime?.max || selectedVisa.processingTime?.min} {selectedVisa.processingTime?.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                                    <p className="text-gray-900 dark:text-white">{selectedVisa.status}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </PageLayout>
        </>
    );
};

export default Visas;
