// import React, { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import axiosInstance from '../../api/axios'
// import { toast } from 'react-toastify'

// export default function BookingDetail() {
//     const { id } = useParams()
//     const navigate = useNavigate()
//     const [booking, setBooking] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)

//     useEffect(() => {
//         fetchBookingDetail()
//     }, [id])

//     const fetchBookingDetail = async () => {
//         try {
//             setLoading(true)
//             setError(null)

//             const response = await axiosInstance.get(`/bookings/${id}`)

//             if (response.data.success) {
//                 setBooking(response.data.data)
//             } else {
//                 setError('Failed to load booking details')
//             }
//         } catch (err) {
//             console.error('Error fetching booking:', err)
//             setError('Failed to load booking details')
//             toast.error('Failed to load booking details')
//         } finally {
//             setLoading(false)
//         }
//     }

//     const formatDate = (dateStr) => {
//         if (!dateStr) return 'N/A'
//         return new Date(dateStr).toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric'
//         })
//     }

//     const getStatusColor = (status) => {
//         const colors = {
//             "on hold": 'border border-yellow-200 bg-yellow-50 text-yellow-700',
//             pending: 'border border-yellow-200 bg-yellow-50 text-yellow-700',
//             confirmed: 'border border-green-200 bg-green-50 text-green-700',
//             cancelled: 'border border-red-200 bg-red-50 text-red-700'
//         }
//         return colors[status] || 'bg-gray-100 text-gray-800'
//     }

//     const handleCancelBooking = async () => {
//         if (!window.confirm('Are you sure you want to cancel this booking?')) {
//             return
//         }

//         try {
//             const response = await axiosInstance.patch(`/bookings/${id}/cancel`)
//             if (response.data.success) {
//                 toast.success('Booking cancelled successfully')
//                 setBooking({ ...booking, status: 'cancelled' })
//             }
//         } catch (error) {
//             console.error('Error cancelling booking:', error)
//             toast.error(error.response?.data?.message || 'Failed to cancel booking')
//         }
//     }

//     if (loading) {
//         return (
//             <div className="w-full min-h-screen flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading booking details...</p>
//                 </div>
//             </div>
//         )
//     }

//     if (error || !booking) {
//         return (
//             <div className="w-full min-h-screen flex items-center justify-center">
//                 <div className="text-center">
//                     <p className="text-red-600 text-lg mb-4">{error || 'Booking not found'}</p>
//                     <button
//                         onClick={() => navigate(-1)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                         Go Back
//                     </button>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="w-full min-h-screen bg-gray-50">
//             <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Header */}
//                 <div className="mb-8 flex justify-between items-start">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
//                         <p className="text-gray-600 mt-1">Reference: <span className="font-semibold text-blue-600">{booking.bookingReference}</span></p>
//                     </div>
//                     <button
//                         onClick={() => navigate(-1)}
//                         className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
//                     >
//                         Back
//                     </button>
//                 </div>

//                 {/* Main Content */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Left Column - Booking Info */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Status Card */}
//                         <div className="bg-white rounded-lg shadow p-6">
//                             <div className="flex justify-between items-center">
//                                 <h2 className="text-lg font-semibold text-gray-900">Booking Status</h2>
//                                 <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
//                                     {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//                                 </span>
//                             </div>
//                             <p className="text-gray-600 mt-2 text-sm">Created: {formatDate(booking.createdAt)}</p>
//                         </div>

//                         {/* Booking Information */}
//                         <div className="bg-white rounded-lg shadow p-6">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="text-sm text-gray-600">Contact Person</label>
//                                     <p className="text-gray-900 font-medium">{(booking?.passengers?.[0]?.givenName + ' ' + booking?.passengers?.[0]?.surName) || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <label className="text-sm text-gray-600">Sector</label>
//                                     <p className="text-gray-900 font-medium">{booking.sector}</p>
//                                 </div>
//                                 <div>
//                                     <label className="text-sm text-gray-600">Airline</label>
//                                     <p className="text-gray-900 font-medium">{booking.airline?.name || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <label className="text-sm text-gray-600">PNR</label>
//                                     <p className="text-gray-900 font-medium">{booking.pnr || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <label className="text-sm text-gray-600">Departure Date</label>
//                                     <p className="text-gray-900 font-medium">{formatDate(booking.departureDate)}</p>
//                                 </div>
//                                 <div>
//                                     <label className="text-sm text-gray-600">Arrival Date</label>
//                                     <p className="text-gray-900 font-medium">{formatDate(booking.arrivalDate)}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Passenger Information */}
//                         <div className="bg-white rounded-lg shadow p-6">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger Breakdown</h3>
//                             <div className="grid grid-cols-3 gap-4">
//                                 <div className="bg-blue-50 p-4 rounded-lg text-center">
//                                     <p className="text-2xl font-bold text-blue-600">{booking.adultsCount || "0"}</p>
//                                     <p className="text-sm text-gray-600">Adults</p>
//                                 </div>
//                                 <div className="bg-green-50 p-4 rounded-lg text-center">
//                                     <p className="text-2xl font-bold text-green-600">{booking.childrenCount || "0"}</p>
//                                     <p className="text-sm text-gray-600">Children</p>
//                                 </div>
//                                 <div className="bg-purple-50 p-4 rounded-lg text-center">
//                                     <p className="text-2xl font-bold text-purple-600">{booking.infantsCount || "0"}</p>
//                                     <p className="text-sm text-gray-600">Infants</p>
//                                 </div>
//                             </div>
//                             <div className="mt-4 pt-4 border-t border-gray-200">
//                                 <p className="text-gray-700"><span className="font-semibold">Total Passengers:</span> {booking.totalPassengers}</p>
//                             </div>
//                         </div>

//                         {/* Pricing Information */}
//                         <div className="bg-white rounded-lg shadow p-6">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
//                             <div className="space-y-3">
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-700">Adult Price (x{booking.adultsCount})</span>
//                                     <span className="font-medium">PKR {(booking.pricing?.adultPrice || 0).toLocaleString()}</span>
//                                 </div>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-gray-700">Adult Total</span>
//                                     <span className="font-medium text-blue-600">PKR {(booking.pricing?.adultTotal || 0).toLocaleString()}</span>
//                                 </div>
//                                 {booking.childrenCount > 0 && (
//                                     <>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-700">Child Price (x{booking.childrenCount})</span>
//                                             <span className="font-medium">PKR {(booking.pricing?.childPrice || 0).toLocaleString()}</span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-700">Child Total</span>
//                                             <span className="font-medium text-green-600">PKR {(booking.pricing?.childTotal || 0).toLocaleString()}</span>
//                                         </div>
//                                     </>
//                                 )}
//                                 {booking.infantsCount > 0 && (
//                                     <>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-700">Infant Price (x{booking.infantsCount})</span>
//                                             <span className="font-medium">PKR {(booking.pricing?.infantPrice || 0).toLocaleString()}</span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-700">Infant Total</span>
//                                             <span className="font-medium text-purple-600">PKR {(booking.pricing?.infantTotal || 0).toLocaleString()}</span>
//                                         </div>
//                                     </>
//                                 )}
//                                 <div className="border-t border-gray-200 pt-3 mt-3">
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-lg font-semibold text-gray-900">Grand Total</span>
//                                         <span className="text-lg font-bold text-blue-600">PKR {(booking.pricing?.grandTotal || 0).toLocaleString()}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Passenger List */}
//                         {booking.passengers && booking.passengers.length > 0 && (
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger List</h3>
//                                 <div className="overflow-x-auto">
//                                     <table className="min-w-full divide-y divide-gray-200">
//                                         <thead className="bg-gray-50">
//                                             <tr>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Passport</th>
//                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">DOB</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="divide-y divide-gray-200">
//                                             {booking.passengers.map((passenger, index) => (
//                                                 <tr key={index} className="hover:bg-gray-50">
//                                                     <td className="px-4 py-3 text-sm text-gray-900">{`${passenger.title}.`} {passenger.givenName} {passenger.surName}</td>
//                                                     <td className="px-4 py-3 text-sm">
//                                                         <span className={`px-2 py-1 rounded text-xs font-medium ${passenger.type === 'Adult' ? 'bg-blue-100 text-blue-800' :
//                                                             passenger.type === 'Child' ? 'bg-green-100 text-green-800' :
//                                                                 'bg-purple-100 text-purple-800'
//                                                             }`}>
//                                                             {passenger.type}
//                                                         </span>
//                                                     </td>
//                                                     <td className="px-4 py-3 text-sm text-gray-600">{passenger.passport || 'N/A'}</td>
//                                                     <td className="px-4 py-3 text-sm text-gray-600">
//                                                         {passenger.dateOfBirth ? new Date(passenger.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Flight Details */}
//                         {booking.flights && booking.flights.length > 0 && (
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Details</h3>
//                                 <div className="space-y-4">
//                                     {booking.flights.map((flight, index) => (
//                                         <div key={index} className="border border-gray-200 rounded-lg p-4">
//                                             <p className="font-semibold text-gray-900">Flight {index + 1}: {flight.flightNo}</p>
//                                             <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
//                                                 <div><span className="font-medium">Origin:</span> {flight.origin}</div>
//                                                 <div><span className="font-medium">Destination:</span> {flight.destination}</div>
//                                                 <div><span className="font-medium">Departure:</span> {formatDate(flight.depDate)} {flight.depTime}</div>
//                                                 <div><span className="font-medium">Arrival:</span> {formatDate(flight.arrDate)} {flight.arrTime}</div>
//                                                 <div><span className="font-medium">Baggage:</span> {flight.baggage || 'N/A'}</div>
//                                                 <div><span className="font-medium">Meal:</span> {flight.meal || 'N/A'}</div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Right Column - Summary */}
//                     <div>
//                         <div className="bg-white rounded-lg shadow p-6 sticky top-20">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
//                             <div className="space-y-4 text-sm">
//                                 <div>
//                                     <label className="text-gray-600">Reference</label>
//                                     <p className="text-gray-900 font-medium">{booking.bookingReference}</p>
//                                 </div>
//                                 <div>
//                                     <label className="text-gray-600">Status</label>
//                                     <p className={`font-medium px-3 py-1 rounded w-fit text-xs mt-1 ${getStatusColor(booking.status)}`}>
//                                         {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//                                     </p>
//                                 </div>
//                                 <div className="border-t border-gray-200 pt-4">
//                                     <label className="text-gray-600">Total Passengers</label>
//                                     <p className="text-2xl font-bold text-gray-900">{booking.totalPassengers}</p>
//                                 </div>
//                                 <div className="border-t border-gray-200 pt-4">
//                                     <label className="text-gray-600">Grand Total</label>
//                                     <p className="text-2xl font-bold text-blue-600">PKR {(booking.pricing?.grandTotal || 0).toLocaleString()}</p>
//                                 </div>
//                                 <div className="border-t border-gray-200 pt-4">
//                                     <label className="text-gray-600">Booked on</label>
//                                     <p className="text-gray-900">{formatDate(booking.createdAt)}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex gap-4 mt-2">
//                             {(booking.status === 'pending' || booking.status === 'on hold') && (
//                                 <>
//                                     <button
//                                         onClick={() => navigate(`/dashboard/edit-booking/${id}`)}
//                                         className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
//                                     >
//                                         Edit Booking
//                                     </button>
//                                     <button
//                                         onClick={handleCancelBooking}
//                                         className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
//                                     >
//                                         Cancel Booking
//                                     </button>
//                                 </>
//                             )}
//                             {booking.status === 'cancelled' && (
//                                 <div className="w-full text-center py-3 bg-red-50 border border-red-200 rounded-lg">
//                                     <p className="text-red-700 font-medium">This booking has been cancelled</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }


import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axios'
import { toast } from 'react-toastify'
import { 
    Calendar, Clock, User, Phone, Users, MapPin, Plane, 
    CreditCard, AlertTriangle, ArrowLeft, XCircle, Edit 
} from 'lucide-react';

export default function BookingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchBookingDetail()
    }, [id])

    const fetchBookingDetail = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axiosInstance.get(`/bookings/${id}`)
            if (response.data.success) {
                setBooking(response.data.data)
            } else {
                setError('Failed to load booking details')
            }
        } catch (err) {
            console.error('Error fetching booking:', err)
            setError('Failed to load booking details')
            toast.error('Failed to load booking details')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
    }

    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'on hold':
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const handleCancelBooking = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const response = await axiosInstance.patch(`/bookings/${id}/cancel`)
            if (response.data.success) {
                toast.success('Booking cancelled successfully')
                setBooking({ ...booking, status: 'cancelled' })
            }
        } catch (error) {
            console.error('Error cancelling booking:', error)
            toast.error(error.response?.data?.message || 'Failed to cancel booking')
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]"></div>
                    <p className="text-gray-500 text-sm font-medium">Loading details...</p>
                </div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-center p-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{error || 'Booking Not Found'}</h3>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002855] transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyle(booking.status)}`}>
                            {booking.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">Ref: <span className="font-bold text-gray-700">{booking.bookingReference}</span></p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium w-fit"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Flight Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Plane className="text-[#003366]" size={18} /> Flight Information
                            </h3>
                            <span className="text-xs font-mono text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                                PNR: {booking.pnr || 'N/A'}
                            </span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide font-bold">Airline</label>
                                    <div className="font-semibold text-gray-900 text-lg mt-0.5">{booking.airline?.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide font-bold">Sector</label>
                                    <div className="flex items-center gap-2 font-medium text-gray-700 mt-0.5">
                                        <MapPin size={14} className="text-blue-500" /> {booking.sector}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wide font-bold">Departure</label>
                                        <div className="font-medium text-gray-900 mt-0.5">{formatDate(booking.departureDate)}</div>
                                    </div>
                                    <div className="text-right">
                                        <label className="text-xs text-gray-500 uppercase tracking-wide font-bold">Arrival</label>
                                        <div className="font-medium text-gray-900 mt-0.5">{formatDate(booking.arrivalDate)}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide font-bold">Flight Segments</label>
                                    <div className="mt-2 space-y-2">
                                        {booking.flights?.map((flight, idx) => (
                                            <div key={idx} className="text-sm bg-gray-50 px-3 py-2 rounded border border-gray-100 flex justify-between items-center">
                                                <span className="font-bold text-[#003366]">{flight.flightNo}</span>
                                                <span className="text-gray-500 text-xs">{flight.origin} → {flight.destination}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Passenger Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 font-bold uppercase mb-1">Adults</span>
                            <span className="text-3xl font-black text-[#003366]">{booking.adultsCount || 0}</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 font-bold uppercase mb-1">Children</span>
                            <span className="text-3xl font-black text-green-600">{booking.childrenCount || 0}</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 font-bold uppercase mb-1">Infants</span>
                            <span className="text-3xl font-black text-purple-600">{booking.infantsCount || 0}</span>
                        </div>
                    </div>

                    {/* Passenger List Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Users className="text-[#003366]" size={18} /> Passenger Manifest
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Passport</th>
                                        <th className="px-6 py-3">DOB</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {booking.passengers?.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-900">
                                                {p.title}. {p.givenName} {p.surName}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                    p.type === 'Adult' ? 'bg-blue-100 text-blue-800' :
                                                    p.type === 'Child' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {p.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-mono text-gray-600">{p.passport || '-'}</td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-GB') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="space-y-6">
                    
                    {/* Financial Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="text-[#003366]" size={18} /> Financial Summary
                        </h3>
                        
                        <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Adults (x{booking.adultsCount})</span>
                                <span className="font-medium">{booking.pricing?.adultTotal?.toLocaleString()}</span>
                            </div>
                            {booking.childrenCount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Children (x{booking.childrenCount})</span>
                                    <span className="font-medium">{booking.pricing?.childTotal?.toLocaleString()}</span>
                                </div>
                            )}
                            {booking.infantsCount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Infants (x{booking.infantsCount})</span>
                                    <span className="font-medium">{booking.pricing?.infantTotal?.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Total Amount</span>
                                <span className="text-xs text-gray-400">PKR</span>
                            </div>
                            <div className="text-2xl font-black text-[#003366]">
                                {booking.pricing?.grandTotal?.toLocaleString()}
                            </div>
                        </div>

                        {/* Contact Person */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Primary Contact</div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                {booking.contactPersonName || (booking.passengers?.[0]?.givenName + ' ' + booking.passengers?.[0]?.surName)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {(booking.status === 'pending' || booking.status === 'on hold') && (
                                <>
                                    <button
                                        onClick={() => navigate(`/dashboard/edit-booking/${id}`)}
                                        className="w-full py-2.5 bg-[#003366] text-white font-semibold rounded-lg hover:bg-[#002855] transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Edit size={16} /> Edit Booking
                                    </button>
                                    <button
                                        onClick={handleCancelBooking}
                                        className="w-full py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={16} /> Cancel Booking
                                    </button>
                                </>
                            )}
                            {booking.status === 'cancelled' && (
                                <div className="w-full py-3 bg-red-50 text-red-700 text-center text-sm font-bold rounded-lg border border-red-100">
                                    🚫 Booking Cancelled
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}