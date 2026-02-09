import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from '../../../api/axios'
import { toast } from 'react-toastify'
import MaskedDatePicker from '../../../components/MaskedDatePicker'
import { Search, Filter, Calendar, Plane, MapPin, Clock, Luggage, Utensils, Wallet } from 'lucide-react' // Added Wallet

export default function AllGroups({ header, searchParams }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [groups, setGroups] = useState([])
    const [allGroups, setAllGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [logoErrors, setLogoErrors] = useState({});

    // Filter states
    const [filters, setFilters] = useState({
        sectors: [],
        airlines: [],
        searchKeyword: '',
        departDate: null
    })

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
    const [airlines, setAirlines] = useState([])
    const [sectors, setSectors] = useState([])
    const { user } = useAuth();

    useEffect(() => {
        fetchGroups()
    }, [location.search])

    const fetchGroups = async () => {
        try {
            setLoading(true);
            setError(null);

            // Extract query parameters from URL
            const searchParams = new URLSearchParams(location.search);
            const queryString = searchParams.toString();

            // Build API URL with query parameters
            const apiUrl = queryString ? `/group-ticketing?${queryString}` : '/group-ticketing';
            const res = await axiosInstance.get(apiUrl);
            if (res.data.success) {
                const allGroupsData = res.data.data;
                setAllGroups(allGroupsData);
                applyFilters(allGroupsData);

                const uniqueAirlines = [...new Set(allGroupsData.map(g => g.airline?.airline_name).filter(Boolean))].sort();
                const uniqueSectors = [...new Set(allGroupsData.map(g => g.sector).filter(Boolean))].sort();

                setAirlines(uniqueAirlines);
                setSectors(uniqueSectors);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load groups.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoError = (id) => {
        setLogoErrors(prev => ({ ...prev, [id]: true }));
    };

    const applyFilters = (dataToFilter = allGroups) => {
        let filtered = [...dataToFilter]

        if (filters.sectors.length > 0) {
            filtered = filtered.filter(g => filters.sectors.includes(g.sector))
        }
        if (filters.airlines.length > 0) {
            filtered = filtered.filter(g => filters.airlines.includes(g.airline?.airline_name))
        }

        if (filters.searchKeyword) {
            const keyword = filters.searchKeyword.toLowerCase()
            filtered = filtered.filter(g =>
                g.sector?.toLowerCase().includes(keyword) ||
                g.airline?.airline_name?.toLowerCase().includes(keyword) ||
                g.details?.some(f => f.flight_no?.toLowerCase().includes(keyword))
            )
        }

        if (filters.departDate) {
            filtered = filtered.filter(g => {
                const deptDate = new Date(g.dept_date)
                const selectedDate = new Date(filters.departDate)
                return deptDate.toDateString() === selectedDate.toDateString()
            })
        }

        filtered.sort((a, b) => new Date(a.dept_date) - new Date(b.dept_date))
        setGroups(filtered)
    }

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'sector' || filterType === 'airline') {
            const key = filterType === 'sector' ? 'sectors' : 'airlines'
            setFilters(prev => ({
                ...prev,
                [key]: prev[key].includes(value) ? prev[key].filter(i => i !== value) : [...prev[key], value]
            }))
        } else {
            setFilters(prev => ({ ...prev, [filterType]: value }))
        }
    }

    const handleBookNow = (group) => navigate('/dashboard/booking', { state: { groupData: group } })

    useEffect(() => { applyFilters() }, [filters, allGroups])

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchGroups} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
        </div>
    )

    return (
        <div className="w-full pb-20">
            {/* Header & Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                    <div className="w-full lg:w-auto">{header}</div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative group min-w-50">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Calendar size={16} />
                            </div>
                            <div className="pl-8">
                                <MaskedDatePicker
                                    value={filters.departDate}
                                    onChange={(date) => handleFilterChange('departDate', date)}
                                    placeholderText='Departure Date'
                                    minDate={new Date()}
                                    className="w-full py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] focus:border-transparent outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="relative flex-1 min-w-60">
                            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Airline, Sector..."
                                value={filters.searchKeyword}
                                onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] focus:border-transparent outline-none transition-all shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                            className={`px-4 py-2.5 rounded-lg border-2 flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap shadow-sm
                            ${showAdvancedSearch ? 'bg-[#C9A536] text-white border-[#C9A536] shadow-[#C9A536]/30' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedSearch && (
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Airlines</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {airlines.map(airline => (
                                    <label key={airline} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={filters.airlines.includes(airline)}
                                            onChange={() => handleFilterChange('airline', airline)}
                                            className="rounded text-[#C9A536] focus:ring-[#C9A536] border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 truncate">{airline}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sectors</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {sectors.map(sector => (
                                    <label key={sector} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={filters.sectors.includes(sector)}
                                            onChange={() => handleFilterChange('sector', sector)}
                                            className="rounded text-[#C9A536] focus:ring-[#C9A536] border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 truncate">{sector}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Groups Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-linear-to-r from-[#0B0E1A] via-[#151B2E] to-[#0B0E1A] text-white border-b-2 border-[#C9A536]/30">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Flight Details</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Route</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Baggage</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Meal</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Price (PKR)</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A536] shadow-lg shadow-[#C9A536]/40"></div>
                                            <span className="text-sm">Loading flights...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : groups.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                                        No flights found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                (() => {
                                    // Grouping Logic
                                    const groupedData = groups.reduce((acc, group) => {
                                        const key = `${group.airline?.airline_name}-${group.sector}`;
                                        if (!acc[key]) acc[key] = { ...group, groups: [] };
                                        acc[key].groups.push(group);
                                        return acc;
                                    }, {});

                                    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

                                    return Object.values(groupedData).map((data, idx) => (
                                        <React.Fragment key={idx}>
                                            {/* Group Header */}
                                            <tr className="bg-gray-50/80 border-b border-gray-200">
                                                <td colSpan="7" className="px-6 py-3">
                                                    <div className="flex items-center gap-4">
                                                        {data.airline?.logo_url && !logoErrors[data.airline.id] ? (
                                                            <img
                                                                src={data.airline.logo_url}
                                                                alt="Logo"
                                                                className="w-24 object-contain"
                                                                onError={() => handleLogoError(data.airline.id)}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-[#C9A536] font-bold">
                                                                <Plane size={18} />
                                                                {data.airline?.airline_name.toUpperCase()}
                                                            </div>
                                                        )}


                                                        <div className="h-4 w-px bg-gray-300"></div>

                                                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
                                                                Sector
                                                            </span>
                                                            {data.sector}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>


                                            {/* Flight Rows */}
                                            {data.groups.map((group) => {
                                                // --- CREDIT CHECK LOGIC ---
                                                const userBalance = user?.creditAmount || 0;
                                                const groupPrice = group.price || 0;
                                                const hasInsufficientCredit = Number(userBalance) < Number(groupPrice);

                                                return (
                                                    <tr key={group.id} className="hover:bg-blue-50/30 transition-colors group">
                                                        <td className="px-6 py-4 align-middle">
                                                            {group.details?.map((f, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                                    <Plane size={14} className="text-blue-500 transform -rotate-45" />
                                                                    {f.flight_no}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="px-6 py-4 align-middle">
                                                            {group.details?.map((f, i) => (
                                                                <div key={i} className="flex justify-center items-center gap-2 text-sm text-gray-600">
                                                                    <MapPin size={14} className="text-gray-400" />
                                                                    {f.origin} <span className="text-gray-400">→</span> {f.destination}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="px-6 py-4 align-middle">
                                                            {group.details?.map((f, i) => (
                                                                <div key={i} className="flex flex-col justify-center items-center">
                                                                    <span className="text-xs font-bold text-[#C9A536] bg-linear-to-br from-[#E6C35C]/20 to-[#C9A536]/20 px-2 py-0.5 rounded mb-1 border-2 border-[#C9A536]/30 shadow-sm">
                                                                        {formatDate(f.flight_date)}
                                                                    </span>
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <Clock size={12} />
                                                                        {f.dept_time?.substring(0, 5)} - {f.arv_time?.substring(0, 5)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="px-6 py-4 align-middle">
                                                            {group.details?.map((f, i) => (
                                                                <div key={i} className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                                                    <Luggage size={14} className="text-gray-400" />
                                                                    {f.baggage || '20'}KG
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="px-6 py-4 align-middle">
                                                            {group.details?.map((f, i) => (
                                                                <div key={i} className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                                                    <Utensils size={14} className="text-gray-400" />
                                                                    {f.meal || 'No'}
                                                                </div>
                                                            ))}
                                                        </td>

                                                        {/* --- PRICE COLUMN WITH WARNING --- */}
                                                        <td className="px-6 py-4 align-middle text-right">
                                                            <div className="font-bold text-lg text-[#C9A536]">
                                                                {Number(group.price)?.toLocaleString()}
                                                            </div>
                                                            {hasInsufficientCredit && (
                                                                <div className="flex flex-col items-end gap-1 mt-1.5 animate-in fade-in slide-in-from-top-1">
                                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                                                        <Wallet size={10} />
                                                                        <span>Insufficient Credit</span>
                                                                    </div>
                                                                    <span className="text-[9px] text-gray-400">Bal: {userBalance.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* --- ACTION BUTTON --- */}
                                                        <td className="px-6 py-4 align-middle">
                                                            <button
                                                                onClick={() => handleBookNow(group)}
                                                                disabled={hasInsufficientCredit}
                                                                className={`text-sm font-bold px-6 py-2 rounded-lg shadow-md transition-all 
                                                                ${hasInsufficientCredit
                                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                                                        : 'bg-[#ff6b35] hover:bg-[#e65520] text-white hover:shadow-lg transform active:scale-95'
                                                                    }`}
                                                            >
                                                                {hasInsufficientCredit ? 'Low Bal' : 'Book'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </React.Fragment>
                                    ))
                                })()
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}