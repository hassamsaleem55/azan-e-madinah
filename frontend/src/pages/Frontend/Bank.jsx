// import { useState, useEffect } from "react";
// import axiosInstance from "../../api/axios";

// const Bank = () => {
//   const [banks, setBanks] = useState([]);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch all banks
//   const fetchBanks = async () => {
//     try {
//       setError(null);
      
//       const response = await axiosInstance.get("/bank");
//       if (response.data.success) {
//         // Filter only active banks for frontend
//         const activeBanks = response.data.data.filter(
//           (bank) => bank.status === "Active"
//         );
//         setBanks(activeBanks);
//       } else {
//         setBanks([]);
//       }
//     } catch (error) {
//       console.error("Error fetching banks:", error);
//       if (error.response && error.response.status === 404) {
//         setBanks([]);
//       } else {
//         setError("Failed to fetch bank details. Please try again later.");
//       }
//     } finally {
//       setInitialLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBanks();
//   }, []);

//   if (initialLoading) {
//     return (
//       <div className="w-full min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading bank details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="w-full min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{error}</p>
//           <button
//             onClick={fetchBanks}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen mx-auto px-2 sm:px-4 md:px-0">
//       {/* Header */}
//       <div className="mb-4 sm:mb-6 md:mb-8">
//         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Bank Details</h1>
//         <p className="text-sm sm:text-base text-gray-600">View your registered bank account information</p>
//       </div>

//       {banks.length === 0 ? (
//         <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
//           <div className="text-gray-400 mb-4">
//             <svg className="w-12 sm:w-16 h-12 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//             </svg>
//           </div>
//           <p className="text-gray-500 text-base sm:text-lg">No bank details available.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//           {banks.map((bank) => (
//             <div
//               key={bank._id}
//               className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               {/* Bank Logo Section */}
//               <div className="bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex items-center justify-center h-32 sm:h-40 border-b border-gray-200">
//                 {bank.logo ? (
//                   <img
//                     src={bank.logo}
//                     alt={`${bank.bankName} logo`}
//                     className="max-h-full max-w-full object-contain"
//                   />
//                 ) : (
//                   <div className="text-4xl sm:text-6xl font-bold text-gray-400">
//                     {bank.bankName.charAt(0)}
//                   </div>
//                 )}
//               </div>

//               {/* Bank Details Section */}
//               <div className="p-4 sm:p-6">
//                 <div className="space-y-3 sm:space-y-4">
//                   <div>
//                     <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//                       Bank Name
//                     </p>
//                     <p className="text-base sm:text-lg font-bold text-gray-900">
//                       {bank.bankName}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//                       Account Title
//                     </p>
//                     <p className="text-sm sm:text-base text-gray-700 font-medium">
//                       {bank.accountTitle}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                     <div>
//                       <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//                         Account Number
//                       </p>
//                       <p className="text-sm sm:text-base text-gray-700 font-mono">
//                         {bank.accountNo}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//                         IBN
//                       </p>
//                       <p className="text-sm sm:text-base text-gray-700 font-mono">
//                         {bank.ibn}
//                       </p>
//                     </div>
//                   </div>

//                   <div>
//                     <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//                       Address
//                     </p>
//                     <p className="text-xs sm:text-sm text-gray-700">
//                       {bank.bankAddress}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Bank;


import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { Copy, Check, Building2, MapPin, Globe, CreditCard, AlertTriangle, Loader2 } from "lucide-react";

const Bank = () => {
  const [banks, setBanks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch all banks
  const fetchBanks = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get("/bank");
      if (response.data.success) {
        const activeBanks = response.data.data.filter(
          (bank) => bank.status === "Active"
        );
        setBanks(activeBanks);
      } else {
        setBanks([]);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      if (error.response && error.response.status === 404) {
        setBanks([]);
      } else {
        setError("Failed to fetch bank details. Please try again later.");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleCopy = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(fieldId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (initialLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#C9A536] animate-spin" />
            <p className="text-gray-500 font-medium">Loading bank details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={fetchBanks}
          className="px-6 py-2 bg-linear-to-r from-[#C9A536] to-[#E6C35C] text-white rounded-lg hover:shadow-[0_0_20px_rgba(201,165,54,0.4)] transition-all shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
        <p className="text-sm text-gray-500 mt-1">
            Manage your transactions using the registered accounts below.
        </p>
      </div>

      {banks.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Bank Accounts Found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            There are currently no active bank accounts linked to your profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <div
              key={bank._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Header / Logo Area */}
              <div className="h-32 bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center relative border-b border-gray-100 p-6">
                {bank.logo ? (
                  <img
                    src={bank.logo}
                    alt={`${bank.bankName} logo`}
                    className="max-h-full max-w-[80%] object-contain mix-blend-multiply filter group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Building2 size={40} />
                    <span className="text-xs font-bold uppercase mt-2 tracking-widest">{bank.bankName}</span>
                  </div>
                )}
                {/* Active Badge */}
                <div className="absolute top-4 right-4">
                    <span className="flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{bank.bankName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{bank.accountTitle}</p>
                </div>

                <div className="space-y-4">
                    {/* Account Number */}
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 relative group/copy">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Account Number</p>
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-gray-800 font-semibold tracking-wide text-sm sm:text-base truncate mr-2">
                                {bank.accountNo}
                            </p>
                            <button 
                                onClick={() => handleCopy(bank.accountNo, `acc-${bank._id}`)}
                                className="p-1.5 rounded-md hover:bg-white text-blue-500 hover:text-blue-700 transition-colors focus:outline-none"
                                title="Copy Account Number"
                            >
                                {copiedId === `acc-${bank._id}` ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* IBAN */}
                    {bank.ibn && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 relative group/copy">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">IBAN</p>
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-gray-700 text-xs sm:text-sm truncate mr-2">
                                    {bank.ibn}
                                </p>
                                <button 
                                    onClick={() => handleCopy(bank.ibn, `ibn-${bank._id}`)}
                                    className="p-1.5 rounded-md hover:bg-white text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                                    title="Copy IBAN"
                                >
                                    {copiedId === `ibn-${bank._id}` ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Branch Info */}
                    <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                            <span className="leading-relaxed">{bank.bankAddress || 'Main Branch'}</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bank;