import { useState, useEffect } from "react";
import MaskedDatePicker from "../../components/MaskedDatePicker";
import { 
    Calendar, FileText, Landmark, CreditCard, UploadCloud, 
    Filter, RefreshCw, AlertCircle, CheckCircle, Loader2, Image 
} from 'lucide-react';

const Payment = () => {
  const getCurrentYearStart = () => `${new Date().getFullYear()}-01-01`;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    bankAccount: "",
    amount: "",
    receipt: null,
    booking: "",
  });

  const [filters, setFilters] = useState({
    dateFrom: getCurrentYearStart(),
    dateTo: new Date().toISOString().split("T")[0],
    status: "All",
  });

  const [payments, setPayments] = useState([]);
  const [banks, setBanks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // ... (Keep existing fetchBanks, fetchBookings, fetchPayments logic) ...
  // Note: Function bodies omitted for brevity, assume logic is identical to original.
  const fetchBanks = async () => { /* ... */ };
  const fetchBookings = async () => { /* ... */ };
  const fetchPayments = async () => { /* ... */ }; // Ensure this sets loading states correctly

  useEffect(() => {
    // Mocking fetch calls for UI preview
    fetchBanks();
    fetchBookings();
    fetchPayments();
    setInitialLoading(false); // Remove this in real implementation if fetch handles it
  }, []);

  // ... (Keep handleInputChange, handleFileChange, handleFilterChange, handleSubmit) ...
  const handleInputChange = (e) => { /* ... */ };
  const handleFileChange = (e) => { 
      setFormData(prev => ({ ...prev, receipt: e.target.files[0] })); 
  };
  const handleFilterChange = (e) => { /* ... */ };
  const handleSubmit = async (e) => { e.preventDefault(); /* ... */ };
  const handleFilter = () => { /* ... */ };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-PK", { minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });

  if (initialLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#003366] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Record new payments and view transaction history</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Add Payment Form */}
        <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard size={18} className="text-[#003366]" /> New Payment Entry
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Date</label>
                        <MaskedDatePicker
                            value={formData.date}
                            onChange={(date) => setFormData({ ...formData, date })}
                            minDate={new Date()}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Bank Account</label>
                        <div className="relative">
                            <Landmark size={16} className="absolute left-3 top-3 text-gray-400" />
                            <select
                                name="bankAccount"
                                value={formData.bankAccount}
                                onChange={handleInputChange}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none appearance-none"
                                required
                            >
                                <option value="">Select Bank</option>
                                {banks.map((bank) => (
                                    <option key={bank._id} value={bank._id}>{bank.bankName} - {bank.accountNo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Amount (PKR)</label>
                        <input
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#003366] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="2"
                            placeholder="Payment details..."
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Booking Ref (Optional)</label>
                        <select
                            name="booking"
                            value={formData.booking}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none"
                        >
                            <option value="">Select Booking</option>
                            {bookings.map((b) => (
                                <option key={b._id} value={b._id}>{b.bookingReference} - {b.sector}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Upload Receipt</label>
                        <div className="relative">
                            <input
                                type="file"
                                id="receipt-upload"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label 
                                htmlFor="receipt-upload" 
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#003366] hover:bg-blue-50 transition-colors"
                            >
                                <UploadCloud size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-600 truncate">
                                    {formData.receipt ? formData.receipt.name : "Click to upload image"}
                                </span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#002855] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        {submitting ? "Processing..." : "Submit Payment"}
                    </button>
                </form>
            </div>
        </div>

        {/* Right Col: History & Filters */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" /> Filter History
                    </h3>
                    <button onClick={handleFilter} className="text-sm text-blue-600 hover:underline font-medium">
                        Refresh List
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MaskedDatePicker
                        value={filters.dateFrom}
                        onChange={(date) => setFilters({ ...filters, dateFrom: date })}
                        placeholderText="From Date"
                        className="w-full"
                    />
                    <MaskedDatePicker
                        value={filters.dateTo}
                        onChange={(date) => setFilters({ ...filters, dateTo: date })}
                        placeholderText="To Date"
                        className="w-full"
                    />
                    <div className="flex gap-2">
                        <select
                            name="status"
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#003366]"
                        >
                            <option value="All">All Status</option>
                            <option value="Posted">Posted</option>
                            <option value="Un Posted">Un Posted</option>
                        </select>
                        <button 
                            onClick={handleFilter}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-150">
                {fetching && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#003366] animate-spin" />
                    </div>
                )}
                
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">ID</th>
                                <th className="px-6 py-3 whitespace-nowrap">Date</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 text-center">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No payments found for this period.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-3 font-mono text-gray-500 text-xs">{payment.voucherId}</td>
                                        <td className="px-6 py-3 text-gray-900">{formatDate(payment.date)}</td>
                                        <td className="px-6 py-3 text-gray-600 max-w-xs truncate" title={payment.description}>
                                            {payment.description}
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold text-[#003366]">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase
                                                ${payment.status === 'Posted' ? 'bg-green-100 text-green-700' : 
                                                  payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            {payment.receipt ? (
                                                <a href={payment.receipt} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex">
                                                    <Image size={16} />
                                                </a>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Total */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end items-center gap-4">
                    <span className="text-sm font-semibold text-gray-500 uppercase">Total Amount</span>
                    <span className="text-xl font-bold text-[#003366]">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;