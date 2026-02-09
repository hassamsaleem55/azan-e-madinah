import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import MaskedDatePicker from "../../components/MaskedDatePicker";
import { 
    Search, Download, Printer, FileSpreadsheet, FileText, 
    RefreshCcw, ArrowUpRight, ArrowDownLeft, Loader2, Calendar 
} from 'lucide-react';

const Ledger = () => {
  const getCurrentYearStart = () => `${new Date().getFullYear()}-01-01`;

  const [filters, setFilters] = useState({
    dateFrom: getCurrentYearStart(),
    dateTo: new Date().toISOString().split("T")[0],
  });

  const [ledgerData, setLedgerData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const calculateTotals = () => {
    const debit = ledgerData.reduce((sum, item) => sum + (item.debit || 0), 0);
    const credit = ledgerData.reduce((sum, item) => sum + (item.credit || 0), 0);
    return { debit, credit, closingBalance: debit - credit };
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-PK", { minimumFractionDigits: 2 }).format(amount);

  const fetchLedger = async () => {
    /* ... (Keep existing fetch logic) ... */
    setFetching(true);
    // Mock for UI
    setTimeout(() => { setFetching(false); setInitialLoading(false); }, 1000);
  };

  useEffect(() => { fetchLedger(); }, [filters]);

  const resetFilters = () => {
    setFilters({ dateFrom: getCurrentYearStart(), dateTo: new Date().toISOString().split("T")[0] });
    setSearchTerm("");
  };

  // ... (Keep handleExport, handlePrint logic) ...
  const handleExport = (type) => {};
  const handlePrint = () => window.print();

  const filteredData = ledgerData.filter((item) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return item.voucherId?.toString().includes(s) || item.description?.toLowerCase().includes(s);
  });

  const totals = calculateTotals();

  if (initialLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37] w-10 h-10"/></div>;

  return (
    <div className="w-full pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Ledger</h1>
            <p className="text-sm text-gray-500 mt-1">Detailed statement of your account transactions</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileText size={16} /> PDF
            </button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileSpreadsheet size={16} /> Excel
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#D4AF37] to-[#B8941F] text-white rounded-lg text-sm font-medium hover:from-[#B8941F] hover:to-[#D4AF37] transition-colors">
                <Printer size={16} /> Print
            </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 no-print">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex flex-1 gap-2 w-full">
                <div className="relative w-full max-w-xs">
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                    <MaskedDatePicker 
                        value={filters.dateFrom} 
                        onChange={(d) => setFilters({...filters, dateFrom: d})} 
                        className="pl-9 w-full"
                        placeholderText="From"
                    />
                </div>
                <span className="self-center text-gray-400">-</span>
                <div className="relative w-full max-w-xs">
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                    <MaskedDatePicker 
                        value={filters.dateTo} 
                        onChange={(d) => setFilters({...filters, dateTo: d})} 
                        className="pl-9 w-full"
                        placeholderText="To"
                    />
                </div>
            </div>

            <div className="flex-1 w-full relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transaction..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none"
                />
            </div>

            <button onClick={resetFilters} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Reset Filters">
                <RefreshCcw size={18} />
            </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-300px)]">
        {fetching && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]"/></div>}
        
        <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
                <thead className="bg-linear-to-r from-[#0A1628] to-[#152238] text-white font-semibold sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3.5 whitespace-nowrap w-24">Voucher</th>
                        <th className="px-6 py-3.5 whitespace-nowrap w-32">Date</th>
                        <th className="px-6 py-3.5 w-32">Ticket #</th>
                        <th className="px-6 py-3.5">Description</th>
                        <th className="px-6 py-3.5 text-right w-40">Debit</th>
                        <th className="px-6 py-3.5 text-right w-40">Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.length === 0 ? (
                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No transactions found.</td></tr>
                    ) : (
                        filteredData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 font-mono text-xs text-gray-500">{item.voucherId}</td>
                                <td className="px-6 py-3 text-gray-900">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-3 text-gray-600">{item.ticketNumber || '-'}</td>
                                <td className="px-6 py-3 text-gray-900 max-w-md truncate" title={item.description}>{item.description}</td>
                                <td className="px-6 py-3 text-right font-medium text-red-600">{item.debit ? formatCurrency(item.debit) : '-'}</td>
                                <td className="px-6 py-3 text-right font-medium text-green-600">{item.credit ? formatCurrency(item.credit) : '-'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 uppercase font-bold">Total Debit</span>
                <span className="text-lg font-bold text-red-600 flex items-center gap-1"><ArrowUpRight size={16}/> {formatCurrency(totals.debit)}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 uppercase font-bold">Total Credit</span>
                <span className="text-lg font-bold text-green-600 flex items-center gap-1"><ArrowDownLeft size={16}/> {formatCurrency(totals.credit)}</span>
            </div>
            <div className="flex justify-between items-center bg-linear-to-r from-[#D4AF37] to-[#B8941F] text-white p-3 rounded-lg shadow-sm">
                <span className="text-xs text-white/80 uppercase font-bold">Closing Balance</span>
                <span className="text-lg font-bold">{formatCurrency(totals.closingBalance)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Ledger;