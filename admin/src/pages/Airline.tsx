import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { Plane, Plus, Edit, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { validateAirlineCode, validateTextLength, validateFile } from "../utils/validation";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  Button,
  Modal,
  ModalFooter,
  DataTable,
  LoadingState,
  EmptyState,
  FormField,
  Input,
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

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingAirline ? 'Edit Airline' : 'Add New Airline'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Airline Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Airline Code (Country)" required error={errors.airlineCode}>
                  <Input
                    type="text"
                    name="airlineCode"
                    required
                    value={formData.airlineCode}
                    onChange={handleInputChange}
                    placeholder="e.g., Pakistan"
                  />
                </FormField>

                <FormField label="Short Code (2-3 Letters)" required error={errors.shortCode}>
                  <Input
                    type="text"
                    name="shortCode"
                    required
                    value={formData.shortCode}
                    onChange={handleInputChange}
                    placeholder="e.g., PK"
                    className="uppercase"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Airline Name" required error={errors.airlineName}>
                    <Input
                      type="text"
                      name="airlineName"
                      required
                      value={formData.airlineName}
                      onChange={handleInputChange}
                      placeholder="e.g., Pakistan International Airlines"
                    />
                  </FormField>
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
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-5 py-3 sm:px-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all touch-manipulation"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 sm:px-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5" />
                    <span>{editingAirline ? 'Update Airline' : 'Add Airline'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </PageLayout>
    </>
  );
};

export default Airline;
