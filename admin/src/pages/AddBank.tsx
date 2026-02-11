import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { Building2, Plus, Edit, Trash2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
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
  Badge,
} from "../components";

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
      <PageMeta title="Bank Management | Admin" description="Manage bank accounts and details" />
      
      <PageLayout>
        <PageHeader
          title="Banks"
          description="Manage bank accounts and details"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Bank Management' },
          ]}
          actions={
            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
              Add Bank
            </Button>
          }
        />

        {fetchLoading ? (
          <LoadingState />
        ) : banks.length === 0 ? (
          <EmptyState
            title="No banks found"
            description="Get started by adding your first bank"
            action={
              <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
                Add Bank
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'logo',
                header: 'Logo',
                render: (bank: Bank) => (
                  <div className="flex items-center">
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
                  </div>
                ),
              },
              {
                key: 'name',
                header: 'Bank Name',
                render: (bank: Bank) => (
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{bank.bankName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{bank.bankAddress}</div>
                  </div>
                ),
              },
              {
                key: 'account',
                header: 'Account Details',
                render: (bank: Bank) => (
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{bank.accountTitle}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Acc: {bank.accountNo}</div>
                  </div>
                ),
              },
              {
                key: 'iban',
                header: 'IBAN',
                render: (bank: Bank) => (
                  <span className="text-sm text-gray-900 dark:text-gray-100">{bank.ibn}</span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (bank: Bank) => (
                  <button
                    onClick={() => toggleStatus(bank._id, bank.status)}
                    className="transition-all"
                  >
                    <Badge color={bank.status === "Active" ? "success" : "light"}>
                      {bank.status}
                    </Badge>
                  </button>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (bank: Bank) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(bank)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                      title="Edit bank"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bank._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                      title="Delete bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={banks}
            keyExtractor={(bank) => bank._id}
          />
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingBank ? 'Edit Bank' : 'Add New Bank'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Bank Name" required>
                    <Input
                      type="text"
                      required
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g., Bank Al Habib"
                    />
                  </FormField>

                  <FormField label="Account Title" required>
                    <Input
                      type="text"
                      required
                      value={formData.accountTitle}
                      onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
                      placeholder="Account holder name"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Account Number" required>
                    <Input
                      type="text"
                      required
                      value={formData.accountNo}
                      onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                      placeholder="Account number"
                    />
                  </FormField>

                  <FormField label="IBAN" required>
                    <Input
                      type="text"
                      required
                      value={formData.ibn}
                      onChange={(e) => setFormData({ ...formData, ibn: e.target.value })}
                      placeholder="IBAN number"
                    />
                  </FormField>
                </div>

                <FormField label="Bank Address" required>
                  <Input
                    type="text"
                    required
                    value={formData.bankAddress}
                    onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                    placeholder="Branch address"
                  />
                </FormField>

                <FormField 
                  label="Bank Logo" 
                  required={!editingBank}
                  hint={editingBank && editingBank.logo && !logo ? "Current logo will be kept if no new file is selected" : undefined}
                >
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                      <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
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
                </FormField>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingBank ? 'Update Bank' : 'Add Bank'}
              </Button>
            </div>
          </form>
        </Modal>
      </PageLayout>
    </>
  );
};

export default AddBank;
