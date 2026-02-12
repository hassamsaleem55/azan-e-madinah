import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../api/axios'
import { toast } from 'react-toastify'
import { generateBookingPDF } from '../../utils'
import { format } from "date-fns"
import MaskedDatePicker from '../../components/MaskedDatePicker'
import { Search, Calendar, Clock, Download, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'

export default function MyBookings() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [bookings, setBookings] = useState([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [fetching, setFetching] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        sector: '',
        airline: '',
        fromDate: null,
    })

    const [uniqueSectors, setUniqueSectors] = useState([])
    const [uniqueAirlines, setUniqueAirlines] = useState([])
    const [timers, setTimers] = useState({})

    const activeStatus = searchParams.get('status') || ''

    const statusOptions = [
        { value: 'on hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' }
    ]

    // const calculateRemainingTime = (createdAt) => {
    //     const createdDate = new Date(createdAt)
    //     const expiryDate = new Date(createdDate.getTime() + 2 * 60 * 60 * 1000)
    //     const now = new Date()
    //     const diff = expiryDate - now

    //     if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }

    //     const hours = Math.floor(diff / (1000 * 60 * 60))
    //     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    //     const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    //     return { hours, minutes, seconds, expired: false }
    // }

    const calculateRemainingTime = (expiresAt) => {
        if (!expiresAt) return { hours: 0, minutes: 0, seconds: 0, expired: true }

        const diff = new Date(expiresAt) - new Date()

        if (diff <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, expired: true }
        }

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        return { hours, minutes, seconds, expired: false }
    }

    // useEffect(() => {
    //     const onHoldBookings = bookings.filter(b => b.status === 'on hold' || b.status === 'pending')
    //     if (onHoldBookings.length === 0) return

    //     const interval = setInterval(() => {
    //         const newTimers = {}
    //         onHoldBookings.forEach(booking => {
    //             newTimers[booking._id] = calculateRemainingTime(booking.createdAt)
    //         })
    //         setTimers(newTimers)
    //     }, 1000)

    //     return () => clearInterval(interval)
    // }, [bookings])

    useEffect(() => {
        const onHoldBookings = bookings.filter(
            b => (b.status === 'on hold' || b.status === 'pending') && b.expiresAt
        )

        if (onHoldBookings.length === 0) return

        const interval = setInterval(() => {
            const newTimers = {}
            onHoldBookings.forEach(booking => {
                newTimers[booking._id] = calculateRemainingTime(booking.expiresAt)
            })
            setTimers(newTimers)
        }, 1000)

        return () => clearInterval(interval)
    }, [bookings])

    useEffect(() => {
        fetchBookings()
    }, [filters, activeStatus, searchQuery])

    useEffect(() => {
        const sectors = [...new Set(bookings.map(b => b.sector).filter(Boolean))]
        const airlines = [...new Set(bookings.map(b => b.airline?.name).filter(Boolean))]
        setUniqueSectors(sectors.sort())
        setUniqueAirlines(airlines.sort())
    }, [bookings])

    const fetchBookings = async () => {
        try {
            setFetching(true)
            const params = new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(activeStatus && { status: activeStatus }),
                ...(filters.sector && { sector: filters.sector }),
                ...(filters.airline && { airline: filters.airline }),
                ...(filters.fromDate && { fromDate: format(filters.fromDate, 'yyyy-MM-dd') }),
            })

            const response = await axiosInstance.get(`/bookings?${params}`)
            if (response.data.success) setBookings(response.data.data)
        } catch (err) {
            console.error('Error fetching bookings:', err)
            toast.error('Failed to load bookings')
        } finally {
            setInitialLoading(false)
            setFetching(false)
        }
    }

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }))
    }

    const resetFilters = () => {
        setSearchQuery('')
        setFilters({ sector: '', airline: '', fromDate: null })
        navigate('/dashboard/my-bookings')
    }

    const getStatusBadge = (status) => statusOptions.find(opt => opt.value === status) || statusOptions[0]

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    if (initialLoading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#C9A536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
        </div>
    )

    return (
        <div className="w-full pb-20">
            {/* Header & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-between items-start lg:items-center mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage and track your flight reservations</p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-60">
                            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Ref, PNR, Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] focus:border-transparent outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="w-full sm:w-auto">
                            <select
                                value={filters.sector}
                                onChange={(e) => handleFilterChange('sector', e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] focus:border-transparent outline-none cursor-pointer shadow-sm"
                            >
                                <option value="">All Sectors</option>
                                {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="w-full sm:w-auto">
                            <select
                                value={filters.airline}
                                onChange={(e) => handleFilterChange('airline', e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] focus:border-transparent outline-none cursor-pointer shadow-sm"
                            >
                                <option value="">All Airlines</option>
                                {uniqueAirlines.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        <div className="w-full sm:w-auto min-w-37.5">
                            <MaskedDatePicker
                                value={filters.fromDate}
                                onChange={(date) => handleFilterChange('fromDate', date)}
                                placeholderText='Date'
                                className="w-full py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] outline-none shadow-sm"
                            />
                        </div>

                        <button
                            onClick={resetFilters}
                            className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                {fetching && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A536] shadow-lg shadow-[#C9A536]/40"></div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-linear-to-r from-[#0B0E1A] via-[#151B2E] to-[#0B0E1A] text-white border-b-2 border-[#C9A536]/30">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Flight Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Passenger</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Seats</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Price (PKR)</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                                        No bookings found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => {
                                    const statusBadge = getStatusBadge(booking.status)
                                    const firstPassenger = booking.passengers?.[0]
                                    const timer = timers[booking._id]

                                    return (
                                        <tr key={booking._id} className="hover:bg-[#C9A536]/10 transition-colors group border-b border-gray-100">
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-mono font-bold text-[#C9A536] text-sm">{booking.bookingReference}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <span className="font-semibold">PNR:</span> {booking.pnr || '-'}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {formatDate(booking.createdAt)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className="font-bold text-sm text-gray-900">{booking.airline?.name || 'Airline'}</div>
                                                <div className="text-xs text-gray-600 mt-0.5 font-medium bg-gray-100 px-2 py-0.5 rounded w-fit">
                                                    {booking.sector}
                                                </div>
                                                <div className="text-xs text-[#C9A536] mt-1 font-medium flex items-center gap-1">
                                                    <Calendar size={12} /> {formatDate(booking.departureDate)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {firstPassenger ? `${firstPassenger.givenName} ${firstPassenger.surName}` : 'N/A'}
                                                </div>
                                                {booking.totalPassengers > 1 && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                                                        +{booking.totalPassengers - 1} others
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 align-top text-center">
                                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-[#C9A536]/20 to-[#E6C35C]/20 text-[#C9A536] text-xs font-bold border-2 border-[#C9A536]/30 shadow-md">
                                                    {booking.totalPassengers}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 align-top text-right">
                                                <div className="font-bold text-[#C9A536] text-base">
                                                    {booking.pricing?.grandTotal?.toLocaleString() || '0'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusBadge.color}`}>
                                                        {statusBadge.label}
                                                    </span>

                                                    {(booking.status === 'on hold' || booking.status === 'pending') && (
                                                        <div className="flex gap-1 text-[10px] font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                            <Clock size={12} className={timer?.expired ? 'text-red-500' : 'text-blue-500'} />
                                                            {timer?.expired ? <span className="text-red-600">EXPIRED</span> :
                                                                <span>
                                                                    {String(timer?.hours || 0).padStart(2, '0')}:
                                                                    {String(timer?.minutes || 0).padStart(2, '0')}:
                                                                    {String(timer?.seconds || 0).padStart(2, '0')}
                                                                </span>
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/booking-detail/${booking._id}`)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {(booking.status === 'on hold' || booking.status === 'pending') && (
                                                        <>
                                                            <button
                                                                onClick={() => navigate(`/dashboard/edit-booking/${booking._id}`)}
                                                                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                title="Edit Booking"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => { if (window.confirm('Delete booking?')) toast.info('Delete logic here') }}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Cancel Booking"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {(booking.status === 'confirmed' || booking.status === 'on hold' || booking.status === 'pending') && (
                                                        <button
                                                            onClick={() => generateBookingPDF(booking)}
                                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Download Ticket"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}