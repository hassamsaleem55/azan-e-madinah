import { useState, useEffect } from "react";
import axiosInstance from "../Api/axios";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import BankForm from "./BankForm";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  Button,
  DataTable,
  LoadingState,
  EmptyState,
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
  const [banks, setBanks] = useState<Bank[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);

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
    setEditingBankId(null);
    setShowModal(true);
  };

  const handleEdit = (bank: Bank) => {
    setEditingBankId(bank._id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBankId(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingBankId(null);
    fetchBanks();
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

        {showModal && (
          <BankForm
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            editId={editingBankId}
          />
        )}
      </PageLayout>
    </>
  );
};

export default AddBank;
