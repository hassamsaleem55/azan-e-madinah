import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import PageHeader from "../components/layout/PageHeader";
import { Receipt, Save, ArrowLeft, Upload, Calendar, DollarSign, FileText, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Api/axios";
import { useAuth } from "../context/AuthContext";

interface Payment {
  _id: string;
  voucherId: string;
  date: string;
  description: string;
  bankAccount: {
    _id: string;
    bankName: string;
    accountNo: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    companyName?: string;
  };
  amount: number;
  status: string;
  remarks?: string;
  receipt?: string;
  editedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  editedAt?: string;
}

interface Bank {
  _id: string;
  bankName: string;
  accountNo: string;
}

const EditPaymentVoucher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  const [formData, setFormData] = useState({
    evoucherAgentCreditAccountName: "",
    bankName: "",
    agentName: "",
    description: "",
    amount: "",
    accountNo: "",
    status: "Posted",
    remarks: "",
    date: "",
  });

  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBanks();
    if (id) {
      fetchPaymentDetails();
    }
  }, [id]);

  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get("/bank");
      if (response.data.success) {
        setBanks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/payment/${id}`);
      if (response.data.success) {
        const payment: Payment = response.data.data;
        setFormData({
          evoucherAgentCreditAccountName: payment.user?.companyName || payment.user?.name || "",
          bankName: payment.bankAccount?._id || "",
          agentName: payment.user?.companyName || payment.user?.name || "",
          description: payment.description || "",
          amount: payment.amount?.toString() || "",
          accountNo: payment.bankAccount?.accountNo || "",
          status: payment.status || "Posted",
          remarks: payment.remarks || "",
          date: payment.date ? new Date(payment.date).toISOString().split("T")[0] : "",
        });
        setReceipt(payment.receipt || null);
      }
    } catch (error: any) {
      console.error("Error fetching payment details:", error);
      toast.error("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-populate account number when bank is selected
    if (name === "bankName") {
      const selectedBank = banks.find((bank) => bank._id === value);
      if (selectedBank) {
        setFormData((prev) => ({
          ...prev,
          accountNo: selectedBank.accountNo,
        }));
      }
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      submitData.append("description", formData.description);
      submitData.append("amount", formData.amount);
      submitData.append("status", formData.status);
      submitData.append("remarks", formData.remarks);
      submitData.append("date", formData.date);
      submitData.append("bankAccount", formData.bankName);
      
      // Add the current user ID as editedBy
      if (user?.id) {
        submitData.append("editedBy", user.id);
      }

      if (receiptFile) {
        submitData.append("receipt", receiptFile);
      }

      const response = await axiosInstance.put(`/payment/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Payment voucher updated successfully!");
        navigate("/view-payment-voucher");
      }
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error(error.response?.data?.message || "Failed to update payment voucher");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.date) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Loading payment details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Voucher Details"
        description="View and edit payment voucher information"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Payment Vouchers', path: '/view-payment-voucher' },
          { label: 'Edit' },
        ]}
        actions={
          <button
            onClick={() => navigate("/view-payment-voucher")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Voucher Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update payment voucher details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Account Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evoucher Agent Credit Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Credit Account Name
                </label>
                <input
                  type="text"
                  name="evoucherAgentCreditAccountName"
                  value={formData.evoucherAgentCreditAccountName}
                  onChange={handleChange}
                  disabled
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={banks.find(b => b._id === formData.bankName)?.bankName || ""}
                  disabled
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Payment Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  disabled
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Account # */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account #
                </label>
                <input
                  type="text"
                  name="accountNo"
                  value={formData.accountNo}
                  disabled
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Posted">Posted</option>
                  <option value="Un Posted">Un Posted</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remarks <span className="text-red-600">(Optional)</span>
              </label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Add any additional notes..."
                className="w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Receipt</h4>
            </div>
            <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              {receipt ? (
                <div className="text-center">
                  <img
                    src={receipt}
                    alt="Receipt"
                    className="max-w-xs max-h-64 object-contain mx-auto mb-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-600"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    Change Receipt
                  </label>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg mb-4 mx-auto">
                    <Receipt className="w-16 h-16 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Receipt
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/view-payment-voucher")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              {loading ? "Updating..." : "Update Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentVoucher;
