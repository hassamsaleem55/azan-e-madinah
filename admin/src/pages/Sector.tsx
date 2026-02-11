import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { MapPin, Plus, Edit, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";

interface Sector {
  _id: string;
  sectorTitle: string;
  fullSector: string;
  createdAt: string;
}

const Sector = () => {
  const [formData, setFormData] = useState({
    sectorTitle: "",
    fullSector: "",
  });
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
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
    setFormData({
      sectorTitle: "",
      fullSector: "",
    });
    setShowModal(true);
  };

  const handleEdit = (sector: Sector) => {
    setEditingId(sector._id);
    setFormData({
      sectorTitle: sector.sectorTitle,
      fullSector: sector.fullSector,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sectorTitle || !formData.fullSector) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      let response;
      if (editingId) {
        response = await axiosInstance.put(`/sector/${editingId}`, formData);
      } else {
        response = await axiosInstance.post("/sector/add", formData);
      }

      if (response.data.success) {
        toast.success(editingId ? "Sector updated successfully" : "Sector added successfully");
        setShowModal(false);
        setFormData({
          sectorTitle: "",
          fullSector: "",
        });
        setEditingId(null);
        fetchSectors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save sector");
    } finally {
      setLoading(false);
    }
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
      <PageMeta title="Sector Management | Admin" description="" />
      
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Sector Management" />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={24} />
              Sectors
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage flight sectors by group type
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Sector
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {fetchLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : sectors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No sectors found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sectors.map((sector, index) => (
                    <tr key={sector._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {sector.sectorTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {sector.fullSector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(sector)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit sector"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sector._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete sector"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all animate-slideUp">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                {editingId ? 'Edit Sector' : 'Add New Sector'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sector Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sectorTitle}
                    onChange={(e) => {
                      const input = e.target.value.replace(/-/g, '').toUpperCase();
                      const formatted = input.length > 3 ? `${input.slice(0, 3)}-${input.slice(3, 6)}` : input;
                      setFormData({ ...formData, sectorTitle: formatted });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., DXB-JED"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Sector <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullSector}
                    onChange={(e) => setFormData({ ...formData, fullSector: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Dubai-Jeddah"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingId ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingId ? 'Update Sector' : 'Add Sector'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Sector;
