import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { Building2, Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { toast } from "react-toastify";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";

interface Bank {
  _id: string;
  bankName: string;
  accountTitle: string;
  accountNo: string;
  ibn: string;
  bankAddress: string;
  logo: string;
  status: "Active" | "De-Active";
  createdAt: string;
}

const AddBank = () => {
  const [formData, setFormData] = useState({
    bankName: "",
    accountTitle: "",
    accountNo: "",
    ibn: "",
    bankAddress: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);

  const fetchBanks = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosInstance.get("/bank");
      if (response.data.success) {
        setBanks(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch banks");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleCreate = () => {
    setEditingBank(null);
    setFormData({
      bankName: "",
      accountTitle: "",
      accountNo: "",
      ibn: "",
      bankAddress: "",
    });
    setLogo(null);
    setShowModal(true);
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({
      bankName: bank.bankName,
      accountTitle: bank.accountTitle,
      accountNo: bank.accountNo,
      ibn: bank.ibn,
      bankAddress: bank.bankAddress,
    });
    setLogo(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankName || !formData.accountTitle || !formData.accountNo || !formData.ibn || !formData.bankAddress) {
      toast.error("All fields are required");
      return;
    }

    if (!editingBank && !logo) {
      toast.error("Bank logo is required");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("bankName", formData.bankName);
      data.append("accountTitle", formData.accountTitle);
      data.append("accountNo", formData.accountNo);
      data.append("ibn", formData.ibn);
      data.append("bankAddress", formData.bankAddress);

      if (logo) {
        data.append("logo", logo);
      }

      let response;
      if (editingBank) {
        response = await axiosInstance.put(`/bank/${editingBank._id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axiosInstance.post("/bank/add", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        toast.success(editingBank ? "Bank updated successfully" : "Bank added successfully");
        setShowModal(false);
        setFormData({
          bankName: "",
          accountTitle: "",
          accountNo: "",
          ibn: "",
          bankAddress: "",
        });
        setLogo(null);
        setEditingBank(null);
        fetchBanks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save bank");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bank?")) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/bank/${id}`);
      if (response.data.success) {
        toast.success("Bank deleted successfully");
        fetchBanks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete bank");
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Active" ? "De-Active" : "Active";
      const response = await axiosInstance.patch(`/bank/${id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success(`Bank ${newStatus === "Active" ? "activated" : "deactivated"} successfully`);
        fetchBanks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update bank status");
    }
  };

  return (
    <>
      <PageMeta title="Bank Management | Admin" description="" />
      
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Bank Management" />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 size={24} />
              Banks
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage bank accounts and details
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Bank
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {fetchLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : banks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No banks found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {banks.map((bank) => (
                    <tr key={bank._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bank.logo ? (
                      <img
                        src={bank.logo}
                        alt={bank.bankName}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{bank.bankName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{bank.bankAddress}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{bank.accountTitle}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Acc: {bank.accountNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{bank.ibn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(bank._id, bank.status)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all ${
                        bank.status === "Active"
                          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {bank.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(bank)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit bank"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bank._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete bank"
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
                <Building2 className="w-6 h-6 text-blue-600" />
                {editingBank ? 'Edit Bank' : 'Add New Bank'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      required
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Bank Al Habib"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountTitle"
                      required
                      value={formData.accountTitle}
                      onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Account holder name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNo"
                      required
                      value={formData.accountNo}
                      onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      IBAN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ibn"
                      required
                      value={formData.ibn}
                      onChange={(e) => setFormData({ ...formData, ibn: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="IBAN number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankAddress"
                    required
                    value={formData.bankAddress}
                    onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Branch address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Logo {!editingBank && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {logo ? logo.name : editingBank ? "Change Logo" : "Choose Logo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLogo(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {editingBank && editingBank.logo && !logo && (
                      <img
                        src={editingBank.logo}
                        alt="Current logo"
                        className="h-12 w-12 object-contain border rounded"
                      />
                    )}
                  </div>
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
                      {editingBank ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingBank ? 'Update Bank' : 'Add Bank'
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

export default AddBank;
