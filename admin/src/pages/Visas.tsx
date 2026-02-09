import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Globe, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import PageMeta from '../components/common/PageMeta';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import { Visa } from '../types';

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
            <PageMeta title="Visa Management | Admin" description="" />
            
            <div className="space-y-6">
                <PageBreadCrumb pageTitle="Visa Management" />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visa Services</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage visa services for all countries
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Visa
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Search by country or type..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                value={filters.visaType}
                                onChange={(e) => setFilters({ ...filters, visaType: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="Tourist">Tourist</option>
                                <option value="Business">Business</option>
                                <option value="Student">Student</option>
                                <option value="Work">Work</option>
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
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredVisas.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No visas found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visa Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Processing Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredVisas.map((visa) => (
                                        <tr key={visa._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Globe size={16} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {visa.country?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {visa.visaType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {visa.processingTime?.min}-{visa.processingTime?.max || visa.processingTime?.min} {visa.processingTime?.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                PKR {visa.pricing?.adult?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    visa.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {visa.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleView(visa)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(visa)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(visa._id)}
                                                        className="text-red-600 hover:text-red-900"
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {editingVisa ? 'Edit Visa' : 'Add New Visa'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                                    Visa form implementation pending - API integration required
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Modal */}
                {showViewModal && selectedVisa && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Visa Details
                                </h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
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
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Visas;
