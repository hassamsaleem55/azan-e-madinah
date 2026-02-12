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
        <table className="min-w-full border-collapse">
            <thead className="bg-linear-to-r from-[#1e3a5f] to-[#2d5a8f]">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white border-r border-[#3d6fa8]">
                        Booking Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white border-r border-[#3d6fa8]">
                        <div className="flex items-center gap-1">
                            <span>Group</span>
                            <span>✈</span>
                        </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white border-r border-[#3d6fa8]">
                        <div className="flex items-center gap-1">
                            <span>Passengers</span>
                            <span>👥</span>
                        </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white border-r border-[#3d6fa8]">
                        Price (PKR)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white border-r border-[#3d6fa8]">
                        <span>Status</span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white">
                        Action
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white">
                {bookings.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm border">
                            No bookings found
                        </td>
                    </tr>
                ) : (
                    bookings.map((booking: Booking) => {
                        const statusBadge = getStatusBadge(booking.status)
                        const userId = typeof booking.userId === 'object' ? booking.userId : null
                        const firstPassenger = booking.passengers?.[0]
                        return (
                            <tr key={booking._id} className="border-b border-gray-300 hover:bg-blue-50/20 transition-colors">
                                {/* Booking Details */}
                                <td className="px-4 py-4 align-top border-r border-gray-300">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block bg-linear-to-r from-amber-600 to-amber-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-md">
                                                Airline PNR #: {booking.pnr || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-700 leading-relaxed">
                                            <span className="font-semibold text-gray-800">Agency:</span> {userId?.companyName || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-700 leading-relaxed">
                                            <span className="font-semibold text-gray-800">AGT #:</span>{userId?.agencyCode || 'N/A'}
                                            <span className="mx-2 font-semibold text-gray-800">BK#:</span>{booking.bookingReference}
                                        </div>
                                        <div className="text-xs text-gray-600 pt-0.5">
                                            Created: {formatDate(booking.createdAt)}
                                        </div>
                                    </div>
                                </td>

                                {/* Group */}
                                <td className="px-4 py-4 align-top border-r border-gray-300">
                                    <div className="space-y-1.5">
                                        <div className="font-bold text-sm text-gray-900">
                                            {booking.airline?.name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-700 font-medium">
                                            {booking.sector}
                                        </div>
                                        <div className="text-xs text-gray-700">
                                            {formatDate(booking.departureDate)}
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium pt-0.5">
                                            <div className="text-xs text-gray-600 font-medium pt-0.5">
                                                {firstPassenger
                                                    ? `${firstPassenger.givenName} ${firstPassenger.surName}`
                                                    : 'N/A'}{' '}
                                                X {booking.totalPassengers || 0}
                                            </div>

                                        </div>
                                    </div>
                                </td>

                                {/* Passengers */}
                                <td className="px-4 py-4 align-top border-r border-gray-300">
                                    <div className="inline-block w-full">
                                        <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden">
                                            <thead className="bg-[#2d5a8f] text-white">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold border-r border-slate-600">
                                                        Status
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-semibold border-r border-slate-600">
                                                        Adults
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-semibold border-r border-slate-600">
                                                        Child
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-semibold border-r border-slate-600">
                                                        Infants
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-semibold">
                                                        Seats
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {[
                                                    { key: 'on hold', label: 'Requested', match: ['on hold', 'pending', 'cancelled'] },
                                                    { key: 'confirmed', label: 'Confirmed', match: ['confirmed'] },
                                                ].map(({ key, label, match }) => {
                                                    const active = match.includes(booking.status)

                                                    const adults = active ? booking.adultsCount || 0 : 0
                                                    const children = active ? booking.childrenCount || 0 : 0
                                                    const infants = active ? booking.infantsCount || 0 : 0
                                                    const seats = adults + children + infants

                                                    return (
                                                        <tr
                                                            key={key}
                                                            className="hover:bg-slate-50 transition-colors"
                                                        >
                                                            <td className="px-3 py-2 font-medium text-slate-700 bg-slate-50 border-r border-slate-200">
                                                                {label}
                                                            </td>

                                                            <td className="px-3 py-2 text-center font-semibold border-r border-slate-200">
                                                                {adults}
                                                            </td>

                                                            <td className="px-3 py-2 text-center font-semibold border-r border-slate-200">
                                                                {children}
                                                            </td>

                                                            <td className="px-3 py-2 text-center font-semibold border-r border-slate-200">
                                                                {infants}
                                                            </td>

                                                            <td className="px-3 py-2 text-center font-bold text-slate-900">
                                                                {seats}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </td>

                                {/* Price */}
                                <td className={`px-4 py-4 ${(booking.status === 'on hold' || booking.status === 'pending') ? "align-bottom" : "align-middle"} text-center border-r border-gray-300`}>
                                    <div className="font-bold text-base text-gray-900">
                                        {(booking.status === 'on hold' || booking.status === 'pending') ? (<div className="text-xs text-yellow-700 font-semibold bg-yellow-50 px-2.5 py-1.5 rounded-md border border-yellow-300">
                                            Admin Review<br />Required
                                        </div>) :
                                            `PKR ${booking.pricing?.grandTotal?.toLocaleString() || '0'}`
                                        }
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-4 align-top border-r border-gray-300">
                                    <div className="flex flex-col gap-2 items-center">
                                        <span className={`inline-block px-3 py-1.5 rounded-md text-xs shadow-sm ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                        {(booking.status === 'on hold' || booking.status === 'pending') && (
                                            <div className="flex flex-col gap-2 items-center text-xs">
                                                <div className="font-bold text-gray-800">Booking Expiry Time</div>
                                                {/* <div className="flex items-center gap-1.5"> */}
                                                {timers[booking._id] && timers[booking._id].expired ? (
                                                    <div className="text-red-600 font-bold text-xs">EXPIRED</div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="bg-linear-to-br from-rose-500 to-rose-600 text-white px-3 py-2 rounded-lg shadow-md text-center min-w-10">
                                                            <div className="text-xl font-bold leading-none">
                                                                {String(timers[booking._id]?.hours || 0).padStart(2, '0')}
                                                            </div>
                                                            <div className="text-[9px] font-medium mt-1 opacity-90">HOURS</div>
                                                        </div>
                                                        <div className="bg-linear-to-br from-amber-500 to-amber-600 text-white px-3 py-2 rounded-lg shadow-md text-center min-w-10">
                                                            <div className="text-xl font-bold leading-none">
                                                                {String(timers[booking._id]?.minutes || 0).padStart(2, '0')}
                                                            </div>
                                                            <div className="text-[9px] font-medium mt-1 opacity-90">MINS</div>
                                                        </div>
                                                        <div className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-lg shadow-md text-center min-w-10">
                                                            <div className="text-xl font-bold leading-none">
                                                                {String(timers[booking._id]?.seconds || 0).padStart(2, '0')}
                                                            </div>
                                                            <div className="text-[9px] font-medium mt-1 opacity-90">SECS</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* </div> */}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Action */}
                                <td className="py-4 align-top">
                                    <div className="flex justify-center items-center gap-2">
                                        {/* View Details - Available for all bookings */}
                                        <button
                                            onClick={() => navigate(`/booking-detail/${booking._id}`)}
                                            className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-all shadow-sm hover:shadow-md border border-slate-200"
                                            title="View Details"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>

                                        {/* On Hold booking actions */}
                                        {(booking.status === 'on hold' || booking.status === 'pending' || booking.status === 'confirmed') && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        // Handle PDF download
                                                        generateBookingPDF(booking).catch((err: any) => {
                                                            console.error('Error generating PDF:', err)
                                                        })
                                                    }}
                                                    className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-all shadow-sm hover:shadow-md border border-slate-200"
                                                    title="Download PDF"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>
                                            </>
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

                <FilterBar
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                {/* Bookings Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden relative">
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
