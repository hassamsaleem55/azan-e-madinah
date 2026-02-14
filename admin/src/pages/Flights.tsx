import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Plane, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../Api/axios';
import DatePicker from 'react-datepicker';
import FlightForm from './FlightForm';
import {
  PageMeta,
  PageLayout,
  PageHeader,
  PageContent,
  PageContentSection,
  FilterBar,
  Button,
  Modal,
  DataTable,
  LoadingState,
  EmptyState,
  FormField,
  Select,
} from '../components';

interface Flight {
    _id: string;
    flightNumber: string;
    airline: any;
    sector: any;
    departureCity: string;
    departureDate: string;
    departureTime: string;
    arrivalCity: string;
    arrivalDate: string;
    arrivalTime: string;
    createdAt: string;
}

const Flights = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [filters, setFilters] = useState({
        airline: '',
        date: ''
    });

    const [airlines, setAirlines] = useState<any[]>([]);

    useEffect(() => {
        fetchFlights();
        fetchAirlines();
    }, [filters]);

    const fetchFlights = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/flights', {
                params: filters
            });
            setFlights(response.data.flights || []);
        } catch (error) {
            toast.error('Failed to fetch flights');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAirlines = async () => {
        try {
            const response = await axiosInstance.get('/airline');
            setAirlines(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch airlines');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this flight?')) return;

        try {
            await axiosInstance.delete(`/flights/${id}`);
            toast.success('Flight deleted successfully');
            fetchFlights();
        } catch (error) {
            toast.error('Failed to delete flight');
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

    const handleView = (flight: Flight) => {
        setSelectedFlight(flight);
        setShowViewModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        setEditingId(null);
        fetchFlights();
    };

    const filteredFlights = flights.filter(flight =>
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.airline?.airlineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.sector?.sectorTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Flight Management | Admin" description="Manage flight schedules and availability" />
            
            <PageLayout>
                <PageHeader
                    title="Flights"
                    description="Manage flight schedules and availability"
                    breadcrumbs={[
                        { label: 'Home', path: '/' },
                        { label: 'Flights' },
                    ]}
                    actions={
                        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                            Add Flight
                        </Button>
                    }
                />

                <FilterBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search by flight number, airline, or sector..."
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Filter by Airline">
                                <Select
                                    value={filters.airline}
                                    onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
                                    options={airlines.map(a => ({ value: a._id, label: a.airlineName }))}
                                    placeholder="All Airlines"
                                />
                            </FormField>
                            <FormField label="Filter by Date">
                                <div className="relative">
                                    <DatePicker
                                        selected={filters.date ? new Date(filters.date) : null}
                                        onChange={(date: Date | null) => {
                                            setFilters({ 
                                                ...filters, 
                                                date: date ? date.toISOString().split('T')[0] : '' 
                                            });
                                        }}
                                        dateFormat="MMMM d, yyyy"
                                        placeholderText="Select date"
                                        className="w-full h-11 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90"
                                        wrapperClassName="w-full"
                                        isClearable
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </FormField>
                        </div>
                    }
                    showFilters={true}
                />

                <PageContent>
                    <PageContentSection noPadding>
                        {loading ? (
                            <LoadingState message="Loading flights..." />
                        ) : filteredFlights.length === 0 ? (
                            <EmptyState
                                icon={<Plane className="w-16 h-16" />}
                                title="No flights found"
                                description="Try adjusting your search or filters, or add a new flight."
                                action={
                                    <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                                        Add First Flight
                                    </Button>
                                }
                            />
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        key: 'flight',
                                        header: 'Flight',
                                        render: (flight: Flight) => (
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {flight.flightNumber}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {flight.airline?.airlineName}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: 'sector',
                                        header: 'Sector',
                                        render: (flight: Flight) => (
                                            <span className="text-sm">{flight.sector?.sectorTitle}</span>
                                        ),
                                    },
                                    {
                                        key: 'departure',
                                        header: 'Departure',
                                        render: (flight: Flight) => (
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {flight.departureCity}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(flight.departureDate).toLocaleDateString()} {flight.departureTime}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: 'arrival',
                                        header: 'Arrival',
                                        render: (flight: Flight) => (
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {flight.arrivalCity}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(flight.arrivalDate).toLocaleDateString()} {flight.arrivalTime}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: 'actions',
                                        header: 'Actions',
                                        align: 'center',
                                        render: (flight: Flight) => (
                                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => handleView(flight)}
                                                    className="p-2 sm:p-2.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors touch-manipulation"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(flight._id)}
                                                    className="p-2 sm:p-2.5 text-warning-600 hover:bg-warning-50 dark:text-warning-400 dark:hover:bg-warning-900/20 rounded-lg transition-colors touch-manipulation"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(flight._id)}
                                                    className="p-2 sm:p-2.5 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 rounded-lg transition-colors touch-manipulation"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        ),
                                    },
                                ]}
                                data={filteredFlights}
                                keyExtractor={(flight) => flight._id}
                                hover
                            />
                        )}
                    </PageContentSection>
                </PageContent>

                {showModal && (
                    <FlightForm
                        onClose={handleModalClose}
                        onSuccess={handleModalSuccess}
                        editId={editingId}
                    />
                )}

                {/* View Modal */}
                {selectedFlight && (
                    <Modal
                        isOpen={showViewModal}
                        onClose={() => setShowViewModal(false)}
                        title="Flight Details"
                        size="lg"
                    >
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedFlight.flightNumber}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedFlight.airline?.airlineName}
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sector</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                    {selectedFlight.sector?.fullSector}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Plane className="w-5 h-5" />
                                        Departure
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {selectedFlight.departureCity}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(selectedFlight.departureDate).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {selectedFlight.departureTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Plane className="w-5 h-5 rotate-90" />
                                        Arrival
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {selectedFlight.arrivalCity}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(selectedFlight.arrivalDate).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {selectedFlight.arrivalTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </PageLayout>
        </>
    );
};

export default Flights;
