import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import axiosInstance from '../../api/axios'
import { toast } from 'react-toastify'
import MaskedDatePicker from '../MaskedDatePicker' 
import { 
    User, Users, ArrowRight, Luggage, Utensils, 
    AlertCircle, CheckCircle, Plane 
} from 'lucide-react';

export default function BookingForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id: bookingId } = useParams()
    const isEditMode = !!bookingId

    // --- ORIGINAL STATE ---
    const [formData, setFormData] = useState({
        contactPersonName: '',
        adults: 1,
        children: 0,
        infants: 0,
        passengers: []
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingBooking, setLoadingBooking] = useState(isEditMode)
    const [existingBooking, setExistingBooking] = useState(null)
    const [groupData, setGroupData] = useState(location.state?.groupData || null)

    // --- ORIGINAL LOGIC & EFFECTS ---

    useEffect(() => {
        if (isEditMode && bookingId) {
            fetchBookingForEdit()
        }
    }, [bookingId, isEditMode])

    const fetchBookingForEdit = async () => {
        try {
            setLoadingBooking(true)
            const response = await axiosInstance.get(`/bookings/${bookingId}`)

            if (response.data.success) {
                const booking = response.data.data

                if (booking.status !== 'pending' && booking.status !== 'on hold') {
                    toast.error('Can only edit pending bookings')
                    navigate('/dashboard/my-bookings')
                    return
                }

                setExistingBooking(booking)

                const reconstructedGroupData = {
                    id: booking.groupId,
                    type: booking.groupType,
                    airline: {
                        id: booking.airline?.id || null,
                        airline_name: booking.airline?.name || '',
                        logo_url: booking.airline?.logoUrl || ''
                    },
                    sector: booking.sector,
                    pnr: booking.pnr,
                    price: booking.pricing?.adultPrice || 0,
                    childPrice: booking.pricing?.childPrice || 0,
                    infantPrice: booking.pricing?.infantPrice || 0,
                    dept_date: booking.departureDate,
                    arv_date: booking.arrivalDate,
                    details: booking.flights?.map(flight => ({
                        flight_no: flight.flightNo,
                        flight_date: flight.flightDate,
                        dep_date: flight.depDate,
                        dept_time: flight.depTime,
                        origin: flight.origin,
                        destination: flight.destination,
                        arv_date: flight.arrDate,
                        arv_time: flight.arrTime,
                        baggage: flight.baggage,
                        meal: flight.meal
                    })) || [],
                    available_no_of_pax: 50
                }

                setGroupData(reconstructedGroupData)

                const formattedPassengers = booking.passengers?.map(passenger => ({
                    ...passenger,
                    dateOfBirth: passenger.dateOfBirth ? new Date(passenger.dateOfBirth).toISOString().split('T')[0] : '',
                    passportExpiry: passenger.passportExpiry ? new Date(passenger.passportExpiry).toISOString().split('T')[0] : ''
                })) || []

                setFormData({
                    contactPersonName: booking.contactPersonName || '',
                    adults: booking.adultsCount,
                    children: booking.childrenCount,
                    infants: booking.infantsCount,
                    passengers: formattedPassengers
                })
            }
        } catch (error) {
            console.error('Error fetching booking:', error)
            toast.error('Failed to load booking')
            navigate('/dashboard/my-bookings')
        } finally {
            setLoadingBooking(false)
        }
    }

    const totalPassengers = (parseInt(formData.adults) || 0) + (parseInt(formData.children) || 0) + (parseInt(formData.infants) || 0)

    const isChildPriceAvailable = () => {
        const price = groupData?.childPrice
        return price !== null && price !== undefined && price !== 0
    }

    const isInfantPriceAvailable = () => {
        const price = groupData?.infantPrice
        return price !== null && price !== undefined && price !== 0
    }

    // Passenger Array Builder Logic
    useEffect(() => {
        const currentPassengers = formData.passengers || []
        const targetAdults = parseInt(formData.adults) || 0
        const targetChildren = parseInt(formData.children) || 0
        const targetInfants = parseInt(formData.infants) || 0

        const passengers = []

        for (let i = 0; i < targetAdults; i++) {
            const existing = currentPassengers.find((p, idx) => p.type === 'Adult' && currentPassengers.filter((x, xIdx) => xIdx < idx && x.type === 'Adult').length === i)
            passengers.push(existing || {
                type: 'Adult',
                title: 'Mr',
                givenName: '',
                surName: '',
                passport: '',
                dateOfBirth: '',
                passportExpiry: ''
            })
        }

        if (!isEditMode || isChildPriceAvailable()) {
            for (let i = 0; i < targetChildren; i++) {
                const existing = currentPassengers.find((p, idx) => p.type === 'Child' && currentPassengers.filter((x, xIdx) => xIdx < idx && x.type === 'Child').length === i)
                passengers.push(existing || {
                    type: 'Child',
                    title: 'Mr',
                    givenName: '',
                    surName: '',
                    passport: '',
                    dateOfBirth: '',
                    passportExpiry: ''
                })
            }
        }

        if (!isEditMode || isInfantPriceAvailable()) {
            for (let i = 0; i < targetInfants; i++) {
                const existing = currentPassengers.find((p, idx) => p.type === 'Infant' && currentPassengers.filter((x, xIdx) => xIdx < idx && x.type === 'Infant').length === i)
                passengers.push(existing || {
                    type: 'Infant',
                    title: 'INF',
                    givenName: '',
                    surName: '',
                    passport: '',
                    dateOfBirth: '',
                    passportExpiry: ''
                })
            }
        }

        setFormData(prev => ({ ...prev, passengers }))
    }, [formData.adults, formData.children, formData.infants, isEditMode, groupData])

    // --- HANDLERS ---

    const validatePassengerInput = (name, value) => {
        if (value === '') return true
        const numValue = parseInt(value)
        if (numValue < 0) return false
        if (name === 'adults' && numValue === 0) return false
        return true
    }

    const getDefaultPassengerValue = (name) => {
        return name === 'adults' ? 1 : 0
    }

    const validateSeatLimit = (adults, children) => {
        if (isEditMode) return true
        const totalSeats = adults + children
        const availableSeats = groupData?.available_no_of_pax || 0
        return totalSeats <= availableSeats
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (['adults', 'children', 'infants'].includes(name)) {
            if (!validatePassengerInput(name, value)) return
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePassengerBlur = (e) => {
        const { name, value } = e.target
        if (!['adults', 'children', 'infants'].includes(name)) return

        if (value === '' || parseInt(value) < 0 || (name === 'adults' && parseInt(value) === 0)) {
            const defaultValue = getDefaultPassengerValue(name)
            setFormData(prev => ({ ...prev, [name]: defaultValue }))
            return
        }

        if (!isEditMode && (name === 'adults' || name === 'children')) {
            const adults = name === 'adults' ? parseInt(value) : (parseInt(formData.adults) || 0)
            const children = name === 'children' ? parseInt(value) : (parseInt(formData.children) || 0)
            
            if (!validateSeatLimit(adults, children)) {
                const totalSeats = adults + children
                const availableSeats = groupData?.available_no_of_pax || 0
                toast.error(`Seats not available! You selected ${totalSeats} seats but only ${availableSeats} are available.`, { toastId: 'seat-limit-error' })
                const defaultValue = getDefaultPassengerValue(name)
                setFormData(prev => ({ ...prev, [name]: defaultValue }))
                e.target.focus()
            }
        }
    }

    const handlePassengerChange = (index, field, value) => {
        setFormData(prev => {
            const newPassengers = [...prev.passengers]
            newPassengers[index] = { ...newPassengers[index], [field]: value }
            return { ...prev, passengers: newPassengers }
        })
    }

    const calculateAdultTotal = () => (parseInt(formData.adults) || 0) * (groupData?.price || 0)
    const calculateChildTotal = () => (parseInt(formData.children) || 0) * (groupData?.childPrice || groupData?.price || 0)
    const calculateInfantTotal = () => (parseInt(formData.infants) || 0) * (groupData?.infantPrice || ((groupData?.price || 0) * 0.24))
    
    const calculateTotalPrice = () => {
        return calculateAdultTotal() + calculateChildTotal() + calculateInfantTotal()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isEditMode) {
            return handleUpdate()
        }

        const payingPassengers = (parseInt(formData.adults) || 0) + (parseInt(formData.children) || 0)
        if (payingPassengers > (groupData?.available_no_of_pax || 0)) {
            toast.error(`Adults and Children (${payingPassengers}) cannot exceed available seats (${groupData?.available_no_of_pax || 0})`)
            return
        }

        const hasEmptyFields = formData.passengers.some(passenger =>
            !passenger.givenName || !passenger.surName || !passenger.passport || !passenger.dateOfBirth || !passenger.passportExpiry
        )

        if (hasEmptyFields) {
            toast.error('Please fill in all passenger details')
            return
        }

        setIsSubmitting(true)

        try {
            const bookingData = {
                groupId: groupData.id,
                groupType: groupData.type,
                airline: {
                    id: groupData.airline?.id || null,
                    name: groupData.airline?.airline_name || '',
                    logoUrl: groupData.airline?.logo_url || ''
                },
                sector: groupData.sector,
                pnr: groupData.pnr || '',
                contactPersonName: formData.contactPersonName,
                adultsCount: parseInt(formData.adults),
                childrenCount: parseInt(formData.children),
                infantsCount: parseInt(formData.infants),
                totalPassengers: totalPassengers,
                pricing: {
                    adultPrice: groupData.price || 0,
                    childPrice: groupData.childPrice || 0,
                    infantPrice: groupData.infantPrice || (groupData.price * 0.24) || 0,
                    adultTotal: calculateAdultTotal(),
                    childTotal: calculateChildTotal(),
                    infantTotal: Math.round(calculateInfantTotal()),
                    grandTotal: Math.round(calculateTotalPrice())
                },
                passengers: formData.passengers,
                flights: groupData.details?.map(flight => ({
                    flightNo: flight.flight_no,
                    flightDate: flight.flight_date,
                    depDate: flight.dep_date,
                    depTime: flight.dep_time,
                    origin: flight.origin,
                    destination: flight.destination,
                    arrDate: flight.arv_date,
                    arrTime: flight.arv_time,
                    baggage: flight.baggage,
                    meal: flight.meal
                })) || [],
                departureDate: groupData.dept_date,
                arrivalDate: groupData.arv_date
            }

            const response = await axiosInstance.post('/bookings', bookingData)

            if (response.data.success) {
                toast.success(`Booking confirmed! Reference: ${response.data.data.bookingReference}`)
                setTimeout(() => {
                    navigate('/dashboard/all-groups', {
                        state: { bookingSuccess: true, bookingReference: response.data.data.bookingReference }
                    })
                }, 1500)
            }
        } catch (error) {
            console.error('Error creating booking:', error)
            const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async () => {
        setIsSubmitting(true)
        try {
            const updateData = {
                contactPersonName: formData.contactPersonName,
                adultsCount: parseInt(formData.adults),
                childrenCount: parseInt(formData.children),
                infantsCount: parseInt(formData.infants),
                passengers: formData.passengers,
                pricing: {
                    adultPrice: groupData?.price || 0,
                    childPrice: groupData?.childPrice || 0,
                    infantPrice: groupData?.infantPrice || 0,
                    adultTotal: calculateAdultTotal(),
                    childTotal: calculateChildTotal(),
                    infantTotal: Math.round(calculateInfantTotal()),
                    grandTotal: Math.round(calculateTotalPrice())
                }
            }
            const response = await axiosInstance.put(`/bookings/${bookingId}`, updateData)
            if (response.data.success) {
                toast.success('Booking updated successfully')
                setTimeout(() => {
                    navigate('/dashboard/my-bookings')
                }, 1500)
            }
        } catch (error) {
            console.error('Error updating booking:', error)
            toast.error(error.response?.data?.message || 'Failed to update booking')
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- UI RENDER (REFACTORED) ---

    if (!groupData && !isEditMode) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No Flight Selected</h3>
                <p className="text-gray-500 mt-2 mb-6">Please select a flight group to proceed with booking.</p>
                <button
                    onClick={() => navigate('/dashboard/all-groups')}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#C9A536] to-[#A68A2E] text-white rounded-lg hover:from-[#A68A2E] hover:to-[#C9A536] transition-colors shadow-lg shadow-[#C9A536]/30"
                >
                    Browse Flights
                </button>
            </div>
        )
    }

    if (loadingBooking) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A536] shadow-lg shadow-[#C9A536]/40"></div>
            </div>
        )
    }

    return (
        <div className="w-full pb-20">
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Booking' : 'Complete Your Booking'}</h1>
                    <p className="text-sm text-gray-500 mt-1">Fill in the details below to secure your seats.</p>
                </div>
                {groupData && (
                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Selected Flight</span>
                        <div className="h-4 w-px bg-blue-200"></div>
                        <span className="text-sm font-semibold text-gray-700">{groupData.airline?.airline_name}</span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-sm font-semibold text-gray-700">{groupData.sector}</span>
                    </div>
                )}
            </div>

            <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Booking Form */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Section 1: Contact Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-blue-100 rounded text-blue-700"><User size={18} /></div>
                            Primary Contact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        name="contactPersonName"
                                        value={formData.contactPersonName}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] focus:border-transparent outline-none transition-all shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Passengers & Seats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-green-100 rounded text-green-700"><Users size={18} /></div>
                            Passenger Details
                        </h2>

                        {/* Seat Selection Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {/* Adult Card */}
                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3 transition-shadow hover:shadow-md">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-gray-700">Adults</span>
                                    <span className="text-xs font-semibold bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                                        PKR {groupData?.price?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        name="adults"
                                        value={formData.adults}
                                        onChange={handleChange}
                                        onBlur={handlePassengerBlur}
                                        min="1"
                                        className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-[#C9A536] outline-none shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Child Card */}
                            <div className={`p-4 rounded-xl border ${isChildPriceAvailable() ? 'border-gray-200 bg-gray-50 hover:shadow-md' : 'border-gray-100 bg-gray-50/50 opacity-60'} transition-all`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-gray-700">Children</span>
                                    <span className="text-xs font-semibold bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                                        {isChildPriceAvailable() ? `PKR ${groupData?.childPrice?.toLocaleString()}` : 'N/A'}
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    name="children"
                                    value={formData.children}
                                    onChange={handleChange}
                                    onBlur={handlePassengerBlur}
                                    disabled={!isEditMode && !isChildPriceAvailable()}
                                    min="0"
                                    className="w-full mt-3 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-[#C9A536] outline-none disabled:bg-gray-100 shadow-sm"
                                />
                            </div>

                            {/* Infant Card */}
                            <div className={`p-4 rounded-xl border ${isInfantPriceAvailable() ? 'border-gray-200 bg-gray-50 hover:shadow-md' : 'border-gray-100 bg-gray-50/50 opacity-60'} transition-all`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-gray-700">Infants</span>
                                    <span className="text-xs font-semibold bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                                        {isInfantPriceAvailable() ? `PKR ${groupData?.infantPrice?.toLocaleString()}` : 'Call'}
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    name="infants"
                                    value={formData.infants}
                                    onChange={handleChange}
                                    onBlur={handlePassengerBlur}
                                    min="0"
                                    className="w-full mt-3 px-3 py-2 bg-white border border-gray-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-[#C9A536] outline-none"
                                />
                            </div>
                        </div>

                        {/* Passenger List Form */}
                        <div className="space-y-4">
                            {formData.passengers.map((passenger, index) => (
                                <div key={index} className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-white shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider text-white shadow-sm
                                            ${passenger.type === 'Adult' ? 'bg-[#C9A536] shadow-[#C9A536]/30' : passenger.type === 'Child' ? 'bg-green-600' : 'bg-purple-600'}
                                        `}>
                                            {passenger.type}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">Passenger #{index + 1}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                                            <select
                                                value={passenger.title}
                                                onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] outline-none shadow-sm"
                                            >
                                                {passenger.type === 'Infant' ? <option value="INF">INF</option> : (
                                                    <><option value="Mr">Mr</option><option value="Mrs">Mrs</option><option value="Ms">Ms</option></>
                                                )}
                                                {passenger.type === 'Child' && <option value="CHLD">CHLD</option>}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Given Name</label>
                                            <input
                                                type="text"
                                                value={passenger.givenName}
                                                onChange={(e) => handlePassengerChange(index, 'givenName', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] outline-none shadow-sm"
                                                placeholder="As per passport"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Surname</label>
                                            <input
                                                type="text"
                                                value={passenger.surName}
                                                onChange={(e) => handlePassengerChange(index, 'surName', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A536] outline-none shadow-sm"
                                                placeholder="Surname"
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Passport No</label>
                                            <input
                                                type="text"
                                                value={passenger.passport}
                                                onChange={(e) => handlePassengerChange(index, 'passport', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-[#C9A536] outline-none shadow-sm"
                                                placeholder="Passport Number"
                                            />
                                        </div>
                                        
                                        {/* Using MaskedDatePicker if available, falling back to standard input if logic was simple */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date of Birth</label>
                                            <MaskedDatePicker 
                                                value={passenger.dateOfBirth} 
                                                onChange={(date) => handlePassengerChange(index, 'dateOfBirth', date)}
                                                placeholderText="DD/MM/YYYY"
                                                maxDate={new Date()}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Passport Expiry</label>
                                            <MaskedDatePicker 
                                                value={passenger.passportExpiry} 
                                                onChange={(date) => handlePassengerChange(index, 'passportExpiry', date)}
                                                placeholderText="DD/MM/YYYY"
                                                minDate={new Date()}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Flight Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                        {/* Flight Info Card */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#C9A536] to-[#A68A2E] p-5 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden shadow-md">
                                        {groupData.airline?.logo_url ? (
                                            <img src={groupData.airline.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <Plane className="text-[#C9A536]" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{groupData.airline?.airline_name}</h3>
                                        <div className="text-xs text-blue-200 mt-0.5">{groupData.sector}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Departure</div>
                                        <div className="font-bold text-sm">{new Date(groupData.dept_date).toLocaleDateString()}</div>
                                    </div>
                                    <ArrowRight className="text-blue-300" size={16} />
                                    <div className="text-center">
                                        <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Arrival</div>
                                        <div className="font-bold text-sm">{new Date(groupData.arv_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50 border-b border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Flight Segments</h4>
                                <div className="space-y-4">
                                    {groupData.details?.map((flight, idx) => (
                                        <div key={idx} className="relative pl-4 border-l-2 border-gray-300">
                                            <div className="absolute -left-1.25 top-0 h-2.5 w-2.5 rounded-full bg-gray-400"></div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-800 text-sm">{flight.flight_no}</span>
                                                <span className="text-xs font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                                    {flight.dept_time?.substring(0,5)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 mb-2">
                                                {flight.origin} <span className="text-gray-400 mx-1">→</span> {flight.destination}
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="inline-flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                                                    <Luggage size={12} /> {flight.baggage || '20'}KG
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                                                    <Utensils size={12} /> {flight.meal || 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Cost Section */}
                            <div className="p-6 bg-white">
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Adults (x{formData.adults})</span>
                                        <span>{calculateAdultTotal().toLocaleString()}</span>
                                    </div>
                                    {formData.children > 0 && (
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Children (x{formData.children})</span>
                                            <span>{calculateChildTotal().toLocaleString()}</span>
                                        </div>
                                    )}
                                    {formData.infants > 0 && (
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Infants (x{formData.infants})</span>
                                            <span>{Math.round(calculateInfantTotal()).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-6">
                                    <div>
                                        <span className="block text-xs text-gray-500 uppercase tracking-wide">Total Amount</span>
                                        <span className="text-sm text-gray-400">PKR</span>
                                    </div>
                                    <div className="text-2xl font-bold text-[#C9A536] drop-shadow-sm">
                                        {Math.round(calculateTotalPrice()).toLocaleString()}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
                                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff6b35] to-[#e65520] hover:from-[#e65520] hover:to-[#ff6b35] text-white hover:shadow-xl shadow-[#ff6b35]/30'}`}
                                >
                                    {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Booking' : 'Confirm & Book')}
                                    {!isSubmitting && <CheckCircle size={18} />}
                                </button>
                                
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="w-full mt-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}