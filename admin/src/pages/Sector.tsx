import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import SectorForm from "./SectorForm";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  Button,
  DataTable,
  LoadingState,
  EmptyState,
} from "../components";

interface Sector {
  _id: string;
  sectorTitle: string;
  fullSector: string;
  createdAt: string;
}

const Sector = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSectors = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosInstance.get("/sector");
      if (response.data.success) {
        setSectors(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch sectors");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const handleCreate = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (sector: Sector) => {
    setEditingId(sector._id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingId(null);
    fetchSectors();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sector?")) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/sector/${id}`);
      if (response.data.success) {
        toast.success("Sector deleted successfully");
        fetchSectors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete sector");
    }
  };

  return (
    <>
      <PageMeta title="Sector Management | Admin" description="Manage flight sectors by group type" />
      
      <PageLayout>
        <PageHeader
          title="Sectors"
          description="Manage flight sectors by group type"
          // icon={<MapPin size={24} />}
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Sector Management' },
          ]}
          actions={
            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
              Add Sector
            </Button>
          }
        />

        {fetchLoading ? (
          <LoadingState />
        ) : sectors.length === 0 ? (
          <EmptyState
            title="No sectors found"
            description="Get started by adding your first sector"
            action={
              <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                Add Sector
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'index',
                header: '#',
                render: (_sector: Sector, index: number) => (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {(index ?? 0) + 1}
                  </span>
                ),
              },
              {
                key: 'title',
                header: 'Sector Title',
                render: (sector: Sector) => (
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {sector.sectorTitle}
                  </span>
                ),
              },
              {
                key: 'full',
                header: 'Full Sector',
                render: (sector: Sector) => (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {sector.fullSector}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (sector: Sector) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(sector)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                      title="Edit sector"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sector._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                      title="Delete sector"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={sectors}
            keyExtractor={(sector) => sector._id}
          />
        )}

        {showModal && (
          <SectorForm
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            editId={editingId}
          />
        )}
      </PageLayout>
    </>
  );
};

export default Sector;
