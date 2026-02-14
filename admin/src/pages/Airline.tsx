import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { Plane, Plus, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import AirlineForm from "./AirlineForm";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  Button,
  DataTable,
  LoadingState,
  EmptyState,
} from "../components";

interface Airline {
  _id: string;
  airlineCode: string;
  airlineName: string;
  shortCode: string;
  logo: string;
  status: "Active" | "De-Active";
  createdAt: string;
}

interface Airline {
  _id: string;
  airlineCode: string;
  airlineName: string;
  shortCode: string;
  logo: string;
  status: "Active" | "De-Active";
  createdAt: string;
}

const Airline = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAirlineId, setEditingAirlineId] = useState<string | null>(null);

  const fetchAirlines = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosInstance.get("/airline");
      if (response.data.success) {
        setAirlines(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch airlines");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAirlines();
  }, []);

  const handleCreate = () => {
    setEditingAirlineId(null);
    setShowModal(true);
  };

  const handleEdit = (airline: Airline) => {
    setEditingAirlineId(airline._id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAirlineId(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingAirlineId(null);
    fetchAirlines();
  };

  return (
    <>
      <PageMeta title="Airline Management | Admin" description="Manage airlines and their logos" />
      
      <PageLayout>
        <PageHeader
          title="Airlines"
          description="Manage airlines and their logos"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Airline Management' },
          ]}
          actions={
            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
              Add Airline
            </Button>
          }
        />

        {fetchLoading ? (
          <LoadingState />
        ) : airlines.length === 0 ? (
          <EmptyState
            title="No airlines found"
            description="Get started by adding your first airline"
            action={
              <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                Add Airline
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'index',
                header: '#',
                render: (_airline: Airline, index: number) => (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {(index ?? 0) + 1}
                  </span>
                ),
              },
              {
                key: 'logo',
                header: 'Logo',
                render: (airline: Airline) => (
                  airline.logo ? (
                    <img
                      src={airline.logo}
                      alt={airline.airlineName}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Plane className="w-5 h-5 text-gray-400" />
                    </div>
                  )
                ),
              },
              {
                key: 'code',
                header: 'Airline Code',
                render: (airline: Airline) => (
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {airline.airlineCode}
                  </span>
                ),
              },
              {
                key: 'details',
                header: 'Airline Details',
                render: (airline: Airline) => (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {airline.airlineName}
                  </span>
                ),
              },
              {
                key: 'shortCode',
                header: 'Short Code',
                render: (airline: Airline) => (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {airline.shortCode}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (airline: Airline) => (
                  <button
                    onClick={() => handleEdit(airline)}
                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                    title="Edit airline"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
            data={airlines}
            keyExtractor={(airline) => airline._id}
          />
        )}

        {showModal && (
          <AirlineForm
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            editId={editingAirlineId}
          />
        )}
      </PageLayout>
    </>
  );
};

export default Airline;
