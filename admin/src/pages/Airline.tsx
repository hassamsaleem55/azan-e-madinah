import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { Plane, Plus, Edit, X, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { validateAirlineCode, validateTextLength, validateFile } from "../utils/validation";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";

interface Airline {
  _id: string;
  airlineCode: string;
  airlineName: string;
  shortCode: string;
  logo: string;
  status: "Active" | "De-Active";
  createdAt: string;
}

interface FormErrors {
  airlineCode?: string;
  airlineName?: string;
  shortCode?: string;
  logo?: string;
}

const Airline = () => {
  const [formData, setFormData] = useState({
    airlineCode: "",
    airlineName: "",
    shortCode: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileError = validateFile(file, ['image/jpeg', 'image/png', 'image/jpg'], 5);
      
      if (fileError) {
        setErrors((prev) => ({ ...prev, logo: fileError }));
        setLogo(null);
        toast.error(fileError);
      } else {
        setLogo(file);
        setErrors((prev) => ({ ...prev, logo: '' }));
      }
    }
  };

  const handleCreate = () => {
    setEditingAirline(null);
    setFormData({
      airlineCode: "",
      airlineName: "",
      shortCode: "",
    });
    setLogo(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (airline: Airline) => {
    setEditingAirline(airline);
    setFormData({
      airlineCode: airline.airlineCode,
      airlineName: airline.airlineName,
      shortCode: airline.shortCode,
    });
    setLogo(null);
    setErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate airline code (country)
    const codeError = validateTextLength(formData.airlineCode, 'Airline code', 2, 100);
    if (codeError) newErrors.airlineCode = codeError;
    
    // Validate airline name
    const nameError = validateTextLength(formData.airlineName, 'Airline name', 2, 100);
    if (nameError) newErrors.airlineName = nameError;
    
    // Validate short code (2-3 uppercase letters/numbers)
    const shortCodeError = validateAirlineCode(formData.shortCode);
    if (shortCodeError) newErrors.shortCode = shortCodeError;
    
    // Validate logo (required for new airlines)
    if (!editingAirline && !logo) {
      newErrors.logo = 'Airline logo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      const firstError = Object.values(errors)[0] || 'Please fix the errors in the form';
      toast.error(firstError);
      return;
    }
    
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("airlineCode", formData.airlineCode);
      submitData.append("airlineName", formData.airlineName);
      submitData.append("shortCode", formData.shortCode);

      if (logo) {
        submitData.append("logo", logo);
      }

      let response;
      if (editingAirline) {
        response = await axiosInstance.put(`/airline/${editingAirline._id}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axiosInstance.post("/airline/add", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        toast.success(response.data.message || `Airline ${editingAirline ? "updated" : "added"} successfully!`);
        setShowModal(false);
        setFormData({
          airlineCode: "",
          airlineName: "",
          shortCode: "",
        });
        setLogo(null);
        setEditingAirline(null);
        setErrors({});
        fetchAirlines();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingAirline ? "update" : "add"} airline`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Airline Management | Admin" description="" />
      
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Airline Management" />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plane size={24} />
              Airlines
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage airlines and their logos
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Airline
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {fetchLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : airlines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No airlines found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Airline Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Airline Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {airlines.map((airline, index) => (
                    <tr key={airline._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {airline.logo ? (
                        <img
                          src={airline.logo}
                          alt={airline.airlineName}
                          className="h-10 w-auto object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Plane className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {airline.airlineCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {airline.airlineName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {airline.shortCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(airline)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit airline"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
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
                <Plane className="w-6 h-6 text-blue-600" />
                {editingAirline ? 'Edit Airline' : 'Add New Airline'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Airline Code (Country) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="airlineCode"
                    required
                    value={formData.airlineCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${errors.airlineCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="e.g., Pakistan"
                  />
                  {errors.airlineCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.airlineCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Code (2-3 Letters) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shortCode"
                    required
                    value={formData.shortCode}
                    onChange={handleInputChange}
                    maxLength={3}
                    className={`w-full px-4 py-3 border ${errors.shortCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all uppercase`}
                    placeholder="e.g., PK"
                  />
                  {errors.shortCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.shortCode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Airline Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="airlineName"
                    required
                    value={formData.airlineName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${errors.airlineName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="e.g., Pakistan International Airlines"
                  />
                  {errors.airlineName && (
                    <p className="mt-1 text-sm text-red-600">{errors.airlineName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo {!editingAirline && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className={`flex-1 flex items-center gap-2 px-4 py-3 border-2 border-dashed ${errors.logo ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'} rounded-lg cursor-pointer transition-all`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {logo ? logo.name : "Choose airline logo (JPG, PNG, max 5MB)"}
                      </span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/jpg"
                        required={!editingAirline}
                        className="hidden"
                      />
                    </label>
                    {editingAirline?.logo && !logo && (
                      <img
                        src={editingAirline.logo}
                        alt="Current logo"
                        className="h-12 w-auto object-contain"
                      />
                    )}
                  </div>
                  {errors.logo && (
                    <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                  )}
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
                      {editingAirline ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingAirline ? 'Update Airline' : 'Add Airline'
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

export default Airline;
