import { useState, useEffect } from 'react';
import { Plane, Plus, Edit, Trash2, Calendar as CalendarIcon, Package as PackageIcon, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import FlightPackageForm from './FlightPackageForm';
import {
  PageMeta,
  PageLayout,
  PageHeader,
  FilterBar,
  Button,
  Badge,
  DataTable,
  LoadingState,
  EmptyState,
  FormField,
  Select,
} from '../components';

interface FlightPackage {
    _id: string;
    flight: {
        _id: string;
        flightNumber: string;
        airline: { airlineName: string };
        sector: { sectorTitle: string };
        departureCity: string;
        departureDate: string;
        arrivalCity: string;
    };
    package: {
        _id: string;
        name: string;
        type: string;
        duration: { days: number; nights: number };
    };
    remainingSlots: number;
    status: string;
    createdAt: string;
}

const FlightPackages = () => {
    const [flightPackages, setFlightPackages] = useState<FlightPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        packageType: ''
    });

    useEffect(() => {
        fetchFlightPackages();
    }, [filters]);

    const fetchFlightPackages = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/flight-packages', {
                params: filters
            });
            setFlightPackages(response.data.flightPackages || []);
        } catch (error) {
            toast.error('Failed to fetch flight packages');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to unlink this package from the flight?')) return;

        try {
            await axiosInstance.delete(`/flight-packages/${id}`);
            toast.success('Flight package link deleted successfully');
            fetchFlightPackages();
        } catch (error) {
            toast.error('Failed to delete flight package link');
            console.error(error);
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        setShowModal(true);
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
        setShowModal(true);
    };

    const handleSuccess = () => {
        setShowModal(false);
        setEditingId(null);
        fetchFlightPackages();
    };

    const filteredFlightPackages = flightPackages.filter(fp =>
        fp.flight?.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fp.package?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fp.flight?.airline?.airlineName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Sold Out':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Upcoming':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <>
            <PageMeta title="Flight Packages | Admin" description="Link packages with flights and manage schedules" />
            
            <PageLayout>
                <PageHeader
                    title="Flight Packages"
                    description="Link packages with flights and manage schedules"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Flight Packages' },
                    ]}
                    actions={
                        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                            Link Package to Flight
                        </Button>
                    }
                />

                <FilterBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search by flight, package, or airline..."
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Status">
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    options={[
                                        { value: 'Active', label: 'Active' },
                                        { value: 'Sold Out', label: 'Sold Out' },
                                        { value: 'Upcoming', label: 'Upcoming' },
                                        { value: 'Inactive', label: 'Inactive' },
                                    ]}
                                    placeholder="All Statuses"
                                />
                            </FormField>
                            <FormField label="Package Type">
                                <Select
                                    value={filters.packageType}
                                    onChange={(e) => setFilters({ ...filters, packageType: e.target.value })}
                                    options={[
                                        { value: 'Umrah', label: 'Umrah' },
                                        { value: 'Hajj', label: 'Hajj' },
                                        { value: 'Combined', label: 'Combined' },
                                    ]}
                                    placeholder="All Package Types"
                                />
                            </FormField>
                        </div>
                    }
                />

                {loading ? (
                    <LoadingState />
                ) : filteredFlightPackages.length === 0 ? (
                    <EmptyState
                        icon={<PackageIcon className="w-16 h-16" />}
                        title="No flight packages found"
                        description="Link your first package to a flight to get started"
                        action={
                            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                                Link Package to Flight
                            </Button>
                        }
                    />
                ) : (
                    <DataTable
                        columns={[
                            {
                                key: 'flight',
                                header: 'Flight Details',
                                render: (fp: FlightPackage) => (
                                    <div className="flex items-center gap-2">
                                        <Plane className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {fp.flight?.flightNumber}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {fp.flight?.airline?.airlineName}
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'package',
                                header: 'Package Details',
                                render: (fp: FlightPackage) => (
                                    <div className="flex items-center gap-2">
                                        <PackageIcon className="w-5 h-5 text-green-600" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {fp.package?.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {fp.package?.type} • {fp.package?.duration?.days}D/{fp.package?.duration?.nights}N
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'departure',
                                header: 'Departure',
                                render: (fp: FlightPackage) => (
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {new Date(fp.flight?.departureDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'slots',
                                header: 'Slots',
                                render: (fp: FlightPackage) => (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {fp.remainingSlots}
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (fp: FlightPackage) => (
                                    <Badge 
                                        color={
                                            fp.status === 'Active' ? 'success' :
                                            fp.status === 'Sold Out' ? 'error' :
                                            fp.status === 'Upcoming' ? 'info' : 'light'
                                        }
                                    >
                                        {fp.status}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'actions',
                                header: 'Actions',
                                render: (fp: FlightPackage) => (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(fp._id)}
                                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(fp._id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        data={filteredFlightPackages}
                        keyExtractor={(fp) => fp._id}
                    />
                )}

                {showModal && (
                    <FlightPackageForm
                        onClose={() => setShowModal(false)}
                        onSuccess={handleSuccess}
                        editId={editingId}
                    />
                )}
            </PageLayout>
        </>
    );
};

export default FlightPackages;
