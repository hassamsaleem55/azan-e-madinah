import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import axiosInstance from "../Api/axios";
import { FileText, Calendar, Printer, Copy, FileSpreadsheet, FileDown } from "lucide-react";
import { toast } from "react-toastify";

interface LedgerEntry {
  voucherId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
}

const Ledger = () => {
  const { id } = useParams();
  const location = useLocation();
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const userName = location.state?.userName || "User";

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchLedger();
    }
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("admin_token");
      
      // This is a placeholder API call - adjust the endpoint as per your backend
      const response = await axiosInstance.get(`/payment/ledger/${id}`, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        //   "Content-Type": "application/json",
        // },
        params: {
          dateFrom,
          dateTo,
        },
      });

      if (response.data.success) {
        setLedgerData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching ledger:", error);
      toast.error("Failed to load ledger data");
      // Set empty data on error
      setLedgerData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLedger();
  };

  const calculateTotals = () => {
    const totalDebit = ledgerData.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledgerData.reduce((sum, entry) => sum + entry.credit, 0);
    const closingBalance = totalDebit - totalCredit;
    
    return { totalDebit, totalCredit, closingBalance };
  };

  const { totalDebit, totalCredit, closingBalance } = calculateTotals();

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (type: string) => {
    try {
      // const token = localStorage.getItem("admin_token");
      
      if (type === 'copy') {
        // Copy table data to clipboard
        const tableData = ledgerData.map(entry => 
          `${entry.voucherId}\t${new Date(entry.date).toLocaleDateString()}\t${entry.description}\t${entry.debit > 0 ? entry.debit.toFixed(2) : ''}\t${entry.credit > 0 ? entry.credit.toFixed(2) : ''}`
        ).join('\n');
        
        const header = 'Voucher Id\tDate\tDescription\tDebit\tCredit\n';
        const totals = `\nTotal\t\t\t${totalDebit.toFixed(2)}\t${totalCredit.toFixed(2)}`;
        const fullText = `Ledger of ${userName.toUpperCase()}\nFrom ${dateFrom} To ${dateTo}\n\n${header}${tableData}${totals}`;
        
        await navigator.clipboard.writeText(fullText);
        alert('Table data copied to clipboard!');
        return;
      }

      // For CSV, Excel, and PDF, download from backend
      const exportUrl = `/payment/ledger/${id}/export/${type}`;
      
      const response = await axiosInstance.get(exportUrl, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
        params: {
          dateFrom,
          dateTo,
          userName,
        },
        responseType: 'blob',
      });

      // Check if response is actually an error (JSON) instead of a file
      if (response.headers['content-type']?.includes('application/json')) {
        // Response is JSON error, not a file - need to read the blob as text
        const reader = new FileReader();
        const errorText = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(response.data);
        });
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Export failed');
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = type === 'csv' ? 'csv' : type === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `ledger-${userName}-${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(`Error exporting as ${type}:`, error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = `Failed to export as ${type.toUpperCase()}.`;
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        if (error.response.data instanceof Blob) {
          // Error response is a blob (JSON), read it
          try {
            const reader = new FileReader();
            const errorText = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsText(error.response.data);
            });
            const errorData = JSON.parse(errorText);
            errorMessage += ` ${errorData.message || errorData.error || ''}`;
          } catch (e) {
            console.error('Failed to parse error response:', e);
            errorMessage += ` Server error (Status: ${error.response.status})`;
          }
        } else if (error.response.data?.message) {
          errorMessage += ` ${error.response.data.message}`;
        } else {
          errorMessage += ` Server error (Status: ${error.response.status})`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += ' No response from server. Please check your connection.';
      } else if (error.message) {
        // Something else happened
        errorMessage += ` ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Ledger - {userName}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View account ledger with date range filtering
          </p>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          
          /* Hide non-printable elements */
          nav, aside, header, footer,
          .no-print,
          button:not(.print-keep),
          [class*="sidebar"],
          [class*="breadcrumb"] {
            display: none !important;
          }
          
          /* Reset page styling */
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          /* Container adjustments */
          .rounded-2xl {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          /* Hide date filter form */
          form {
            display: none !important;
          }
          
          /* Title styling */
          h2 {
            color: #dc2626 !important;
            font-size: 18pt !important;
            margin-bottom: 8pt !important;
          }
          
          p {
            color: #16a34a !important;
            font-size: 11pt !important;
            margin-bottom: 16pt !important;
          }
          
          /* Table styling */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
            font-size: 10pt !important;
          }
          
          thead {
            display: table-header-group !important;
            background: #1f2937 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          thead th {
            background: #1f2937 !important;
            color: white !important;
            padding: 8pt 4pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          tbody tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          
          tbody td {
            padding: 6pt 4pt !important;
            border-bottom: 1px solid #e5e7eb !important;
            color: #000 !important;
          }
          
          tfoot {
            display: table-footer-group !important;
            background: #f3f4f6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          tfoot td {
            background: #f3f4f6 !important;
            font-weight: bold !important;
            padding: 8pt 4pt !important;
            border-top: 2px solid #d1d5db !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Summary box */
          .bg-gray-50 {
            background: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            padding: 12pt !important;
            margin-top: 16pt !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Color adjustments for print */
          .text-green-600,
          .dark\\:text-green-500 {
            color: #16a34a !important;
          }
          
          .text-red-600,
          .dark\\:text-red-500 {
            color: #dc2626 !important;
          }
          
          /* Remove hover effects */
          tr:hover {
            background: transparent !important;
          }
        }
      `}</style>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-white/[0.03]">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          {/* Date Range Filter Section */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-6 no-print">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date Range Filter</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select date range to view ledger</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-2.5 h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30"
              >
                <Calendar className="w-4 h-4" />
                Submit
              </button>
            </form>
          </div>

          {/* Ledger Title Section */}
          <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ledger of {userName.toUpperCase()}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              From {new Date(dateFrom).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} To {new Date(dateTo).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Export Actions */}
          <div className="mb-6 no-print">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExport('copy')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/30"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Loading ledger...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full table-auto">
                  <thead className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Voucher Id</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Debit</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                    {ledgerData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="w-12 h-12 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400 font-medium">No data available in table</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ledgerData.map((entry, index) => (
                        <tr
                          key={index}
                          className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">
                            {entry.voucherId}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                            {entry.description}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-right font-medium text-red-600 dark:text-red-400">
                            {entry.debit > 0 ? entry.debit.toFixed(2) : ''}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-right font-medium text-green-600 dark:text-green-400">
                            {entry.credit > 0 ? entry.credit.toFixed(2) : ''}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 font-semibold">
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                      <td colSpan={3} className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white font-bold">
                        Total:
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-red-600 dark:text-red-400">
                        {totalDebit.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-green-600 dark:text-green-400">
                        {totalCredit.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary Box */}
              <div className="mt-6 max-w-md ml-auto">
                <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-5 shadow-lg space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Total Debit</span>
                    <span className="text-red-600 dark:text-red-400 font-bold text-base">{totalDebit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Total Credit</span>
                    <span className="text-green-600 dark:text-green-400 font-bold text-base">{totalCredit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white font-bold">Closing Balance</span>
                    <span className={`font-bold text-lg ${closingBalance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {closingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;
