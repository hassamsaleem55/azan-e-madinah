import { useState, useEffect } from 'react';
import { Plane, Plus, Edit, Trash2, Eye, Calendar as CalendarIcon, Package as PackageIcon, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import Button from '../components/ui/button/Button';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import PageMeta from '../components/common/PageMeta';
import FlightPackageForm from './FlightPackageForm';

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
            <PageMeta title="Flight Packages | Admin" description="" />
            
            <div className="space-y-6">
                <PageBreadCrumb pageTitle="Flight Packages" />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Plane size={24} />
                            Flight Packages
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Link packages with flights and manage schedules
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Link Package to Flight
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Search by flight, package, or airline..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Sold Out">Sold Out</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.packageType}
                                onChange={(e) => setFilters({ ...filters, packageType: e.target.value })}
                            >
                                <option value="">All Package Types</option>
                                <option value="Umrah">Umrah</option>
                                <option value="Hajj">Hajj</option>
                                <option value="Combined">Combined</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredFlightPackages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <PackageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No flight packages found</p>
                            <p className="text-sm mt-2">Link your first package to a flight to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Flight Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Package Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Departure
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Slots
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
                                    {filteredFlightPackages.map((fp) => (
                                        <tr key={fp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                            </td>
                                            <td className="px-6 py-4">
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {fp.remainingSlots}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fp.status)}`}>
                                                    {fp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(fp._id)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(fp._id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

                {showModal && (
                    <FlightPackageForm
                        onClose={() => setShowModal(false)}
                        onSuccess={handleSuccess}
                        editId={editingId}
                    />
                )}
            </div>
        </>
    );
};

export default FlightPackages;
