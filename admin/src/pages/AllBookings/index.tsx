import { useState, useEffect, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from 'lucide-react'
import DatePicker from 'react-datepicker'
import axiosInstance from '../../Api/axios'
import { generateBookingPDF } from '../../utils'
import { PageMeta, PageLayout, PageHeader, FilterBar, FormField, Input, Button, LoadingState, CustomSelect } from '../../components'

interface Booking {
    _id: string
    bookingReference: string
    contactPersonName: string
    sector: string
    airline?: { id?: string; name: string; logoUrl?: string }
    passengers: { _id: string, type: string; title: string; givenName: string, surName: string, passportNumber: string, dateOfBirth: string, passportExpiry: string, nationality: string }[]
    userId?: string | { _id: string; name: string; email: string; companyName?: string; agencyCode?: string }
    adultsCount: number
    childrenCount: number
    infantsCount: number
    totalPassengers: number
    confirmedAdults?: number
    confirmedChildren?: number
    confirmedInfants?: number
    departureDate: string
    createdAt: string
    pnr?: string
    pricing: { grandTotal: number }
    status: string,
    expiresAt: string | null
}

interface StatusOption {
    value: string
    label: string
    color: string
}

interface BookingsTableProps {
    bookings: Booking[]
    getStatusBadge: (status: string) => StatusOption
    formatDate: (dateStr: string | undefined) => string
    navigate: (path: string) => void
    timers: { [key: string]: { hours: number; minutes: number; seconds: number; expired: boolean } }
}

const BookingsTable = memo(({ bookings, getStatusBadge, formatDate, navigate, timers }: BookingsTableProps) => {
    return (
        <table className="min-w-full">
            <thead className="bg-linear-to-r from-brand-600 via-brand-500 to-indigo-600 dark:from-brand-700 dark:via-brand-600 dark:to-indigo-700">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Booking Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Flight & Travel Info
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                        Passengers
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                        Price (PKR)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No bookings found</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    bookings.map((booking: Booking) => {
                        const statusBadge = getStatusBadge(booking.status)
                        const userId = typeof booking.userId === 'object' ? booking.userId : null
                        const firstPassenger = booking.passengers?.[0]
                        return (
                            <tr key={booking._id} className="hover:bg-linear-to-r hover:from-brand-50/30 hover:to-brand-100/20 dark:hover:from-brand-900/10 dark:hover:to-brand-800/5 transition-all duration-300">
                                {/* Booking Details */}
                                <td className="px-6 py-4">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 bg-linear-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                </svg>
                                                PNR: {booking.pnr || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">Agency:</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{userId?.companyName || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="font-semibold">AGT#:</span>
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono">{userId?.agencyCode || 'N/A'}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="font-semibold">BK#:</span>
                                                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-mono">{booking.bookingReference}</span>
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Created: {formatDate(booking.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Flight & Travel Info */}
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {booking.airline?.logoUrl && (
                                                <img src={booking.airline.logoUrl} alt={booking.airline.name} className="w-6 h-6 object-contain" />
                                            )}
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {booking.airline?.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-semibold">{booking.sector}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Departure: {formatDate(booking.departureDate)}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {firstPassenger
                                                ? `${firstPassenger.givenName} ${firstPassenger.surName}`
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </td>

                                {/* Passengers */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {booking.totalPassengers || 0}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                                            <div className="flex flex-col items-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Adults</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{booking.adultsCount || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Children</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{booking.childrenCount || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Infants</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{booking.infantsCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Price */}
                                <td className="px-6 py-4 text-center">
                                    {(booking.status === 'on hold' || booking.status === 'pending') ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="text-xs font-semibold">Review Required</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                PKR {booking.pricing?.grandTotal?.toLocaleString() || '0'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                                        </div>
                                    )}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-3 items-center">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                        {(booking.status === 'on hold' || booking.status === 'pending') && (
                                            <div className="flex flex-col gap-2 items-center">
                                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Expiry Timer</div>
                                                {timers[booking._id] && timers[booking._id].expired ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-700">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-xs font-bold">EXPIRED</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="bg-linear-to-br from-rose-500 to-rose-600 text-white px-2.5 py-2 rounded-lg shadow-md text-center min-w-[50px]">
                                                            <div className="text-lg font-bold leading-none">
                                                                {String(timers[booking._id]?.hours || 0).padStart(2, '0')}
                                                            </div>
                                                            <div className="text-[8px] font-semibold mt-0.5 opacity-90">HRS</div>
                                                        </div>
                                                        <div className="bg-linear-to-br from-amber-500 to-amber-600 text-white px-2.5 py-2 rounded-lg shadow-md text-center min-w-[50px]">
                                                            <div className="text-lg font-bold leading-none">
                                                                {String(timers[booking._id]?.minutes || 0).padStart(2, '0')}
                                                            </div>
                                                            <div className="text-[8px] font-semibold mt-0.5 opacity-90">MIN</div>
                                                        </div>
                                                        <div className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white px-2.5 py-2 rounded-lg shadow-md text-center min-w-[50px]">
                                                            <div className="text-lg font-bold leading-none">
                                                                {String(timers[booking._id]?.seconds || 0).padStart(2, '0')}
                                                            </div>
                                                            <div className="text-[8px] font-semibold mt-0.5 opacity-90">SEC</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/booking-detail/${booking._id}`)}
                                            className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-all shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-800"
                                            title="View Details"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>

                                        {(booking.status === 'on hold' || booking.status === 'pending' || booking.status === 'confirmed') && (
                                            <button
                                                onClick={() => {
                                                    generateBookingPDF(booking).catch((err: any) => {
                                                        console.error('Error generating PDF:', err)
                                                    })
                                                }}
                                                className="p-2.5 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-all shadow-sm hover:shadow-md border border-green-200 dark:border-green-800"
                                                title="Download PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
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
    )
})

BookingsTable.displayName = 'BookingsTable'

export default function AllBookings() {
    interface Filters {
        sector: string
        airline: string
        fromDate: Date | null
    }

    type Timer = {
        hours: number
        minutes: number
        seconds: number
        expired: boolean
    }

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [fetching, setFetching] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<Filters>({
        sector: '',
        airline: '',
        fromDate: null,
    })

    const [uniqueSectors, setUniqueSectors] = useState<string[]>([])
    const [uniqueAirlines, setUniqueAirlines] = useState<string[]>([])
    const [timers, setTimers] = useState<Record<string, Timer>>({})


    // Get status from URL params
    const activeStatus = searchParams.get('status') || ''

    const statusOptions: StatusOption[] = [
        { value: 'on hold', label: 'On Hold', color: 'bg-yellow-50 text-yellow-700 border border-yellow-300' },
        { value: 'pending', label: 'On Hold', color: 'bg-yellow-50 text-yellow-700 border border-yellow-300' },
        { value: 'confirmed', label: 'Confirmed', color: 'bg-green-50 text-green-700 border border-green-300' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border border-red-300' }
    ]

    const calculateRemainingTime = (expiresAt: string | null) => {

        if (!expiresAt) return { hours: 0, minutes: 0, seconds: 0, expired: true }

        const diff = new Date(expiresAt).getTime() - new Date().getTime()

        if (diff <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, expired: true }
        }

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        return { hours, minutes, seconds, expired: false }
    }

    useEffect(() => {
        const onHoldBookings = bookings.filter(
            b => (b.status === 'on hold' || b.status === 'pending') && b.expiresAt
        )

        if (onHoldBookings.length === 0) return

        const interval = setInterval(() => {
            const newTimers: Record<string, Timer> = {}
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
        // Extract unique sectors and airlines from bookings
        const sectors = [...new Set(bookings.map(b => b.sector).filter(Boolean))]
        const airlines = [...new Set(bookings.map(b => b.airline?.name).filter((name): name is string => Boolean(name)))]
        setUniqueSectors(sectors.sort())
        setUniqueAirlines(airlines.sort())
    }, [bookings])

    const fetchBookings = async () => {
        try {
            setFetching(true)
            const params = new URLSearchParams({
                ...(activeStatus && { status: activeStatus }),
                ...(filters.sector && { sector: filters.sector }),
                ...(filters.airline && { airline: filters.airline }),
                ...(searchQuery && { search: searchQuery }),
                ...(filters.fromDate && {
                    fromDate: format(filters.fromDate, 'yyyy-MM-dd'),
                }),
            })

            const response = await axiosInstance.get(`/bookings?${params}`)

            if (response.data.success) {
                setBookings(response.data.data)
            }
        } catch (err) {
            console.error('Error fetching bookings:', err)
        } finally {
            setInitialLoading(false)
            setFetching(false)
        }
    }

    const handleFilterChange = <K extends keyof Filters>(
        filterName: K,
        value: Filters[K]
    ) => {
        setFilters(prev => ({ ...prev, [filterName]: value }))
    }


    const resetFilters = () => {
        setSearchQuery('')
        setFilters({
            sector: '',
            airline: '',
            fromDate: null
        })
        // Reset status by navigating without status param
        if (activeStatus) {
            navigate('/all-bookings')
        }
    }

    const getStatusBadge = (status: string): StatusOption => {
        const option = statusOptions.find(opt => opt.value === status)
        return option || statusOptions[0]
    }

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    if (initialLoading) {
        return <LoadingState message="Loading bookings..." />;
    }

    return (
        <>
            <PageMeta title="All Bookings" description="Manage all customer flight bookings" />
            <PageLayout>
                <PageHeader
                    title="All Bookings"
                    description="Manage all customer flight bookings"
                    breadcrumbs={[
                        { label: "Dashboard", path: "/" },
                        { label: "All Bookings" }
                    ]}
                />

                <div className="relative z-10">
                    <FilterBar
                        filters={
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <FormField label="Search">
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by reference, PNR, or customer name..."
                                />
                            </FormField>
                            <FormField label="Sector">
                                <CustomSelect
                                    value={filters.sector}
                                    onChange={(value) => handleFilterChange('sector', value)}
                                    options={[
                                        { value: '', label: 'All Sectors' },
                                        ...uniqueSectors.map(sector => ({ value: sector, label: sector }))
                                    ]}
                                    placeholder="All Sectors"
                                />
                            </FormField>
                            <FormField label="Airline">
                                <CustomSelect
                                    value={filters.airline}
                                    onChange={(value) => handleFilterChange('airline', value)}
                                    options={[
                                        { value: '', label: 'All Airlines' },
                                        ...uniqueAirlines.map(airline => ({ value: airline, label: airline }))
                                    ]}
                                    placeholder="All Airlines"
                                />
                            </FormField>
                            <FormField label="Departure Date">
                                <div className="relative">
                                    <DatePicker
                                        selected={filters.fromDate}
                                        onChange={(date: Date | null) => handleFilterChange('fromDate', date)}
                                        dateFormat="MMMM d, yyyy"
                                        placeholderText="Select date"
                                        className="w-full h-11 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90"
                                        wrapperClassName="w-full"
                                        minDate={new Date()}
                                        isClearable
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </FormField>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="w-full text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    }
                    showFilters={true}
                />
                </div>

                {/* Bookings Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden relative z-0">
                    {fetching && (
                        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <BookingsTable
                            bookings={bookings}
                            getStatusBadge={getStatusBadge}
                            formatDate={formatDate}
                            navigate={navigate}
                            timers={timers}
                        />
                    </div>
                </div>
            </PageLayout>
        </>
    )
}
