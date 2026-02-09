import Booking from '../models/Booking.js'
import GroupTicketing from '../models/GroupTicketing.js'
import Register from '../models/Register.js'
import {
    startBookingTimer,
    cancelBookingTimer,
    hasBookingTimer,
    getBookingRemainingTime
} from '../utils/bookingTimer.js'
import {
    sendBookingConfirmationEmail,
    sendBookingStatusChangeEmail
} from '../utils/emailService.js'

// Helper function to check if user has a specific role
const hasRole = (user, roleName) => {
    if (user.roles && user.roles.length > 0) {
        return user.roles.some(role => role.name === roleName);
    }
    return false;
};

const HOLD_DURATION = 2 * 60 * 60 * 1000 // 2 hours

/* =========================================================
   CREATE BOOKING
========================================================= */
const createBooking = async (req, res) => {
    try {
        const {
            groupId, groupType, airline, sector, pnr, contactPersonName,
            adultsCount, childrenCount, infantsCount, totalPassengers,
            pricing, passengers, flights, departureDate, arrivalDate
        } = req.body

        if (passengers.length !== totalPassengers)
            return res.status(400).json({ success: false, message: 'Passenger mismatch' })

        const calculatedTotal = pricing.adultTotal + pricing.childTotal + pricing.infantTotal

        if (Math.abs(calculatedTotal - pricing.grandTotal) > 0.01)
            return res.status(400).json({ success: false, message: 'Price mismatch' })

        if (req.user.creditAmount < calculatedTotal)
            return res.status(400).json({ success: false, message: 'Insufficient credit' })

        const expiresAt = new Date(Date.now() + HOLD_DURATION)

        const booking = await Booking.create({
            groupId, groupType, airline, sector, pnr, contactPersonName,
            adultsCount, childrenCount, infantsCount, totalPassengers,
            pricing, passengers, flights, departureDate, arrivalDate,
            userId: req.user._id,
            status: 'on hold',
            expiresAt
        })

        const seats = adultsCount + childrenCount

        await GroupTicketing.updateOne({ _id: groupId }, { $inc: { totalSeats: -seats } })
        await Register.updateOne({ _id: req.user._id }, { $inc: { creditAmount: -calculatedTotal } })

        // Send booking confirmation email
        try {
            await sendBookingConfirmationEmail(req.user.email, req.user.name, booking);
            console.log(`✅ Booking confirmation email sent to: ${req.user.email}`);
        } catch (emailError) {
            console.error(`❌ Failed to send booking confirmation email:`, emailError.message);
            // Don't fail the booking if email fails
        }

        res.status(201).json({ success: true, data: booking })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to create booking' })
    }
}

/* =========================================================
   GET ALL BOOKINGS
========================================================= */
const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, sector, airline, fromDate, search } = req.query
        const query = {}

        if (status) query.status = status
        if (sector) query.sector = sector
        if (airline) query['airline.name'] = airline
        if (fromDate) query.departureDate = { $gte: new Date(fromDate) }

        if (search) {
            query.$or = [
                { bookingReference: { $regex: search, $options: 'i' } },
                { contactPersonName: { $regex: search, $options: 'i' } },
                { pnr: { $regex: search, $options: 'i' } }
            ]
        }

        if (!hasRole(req.user, 'Super Admin') && !hasRole(req.user, 'Admin')) query.userId = req.user._id

        const skip = (page - 1) * limit

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'name email agencyCode companyName')

        const total = await Booking.countDocuments(query)

        res.json({
            success: true,
            data: bookings,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalBookings: total
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' })
    }
}

/* =========================================================
   GET BOOKING BY ID
========================================================= */
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email agencyCode companyName')

        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' })

        if (!hasRole(req.user, 'Super Admin') && !hasRole(req.user, 'Admin') && booking.userId._id.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' })

        res.json({ success: true, data: booking })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to fetch booking' })
    }
}

/* =========================================================
   GET BOOKING BY REFERENCE
========================================================= */
const getBookingByReference = async (req, res) => {
    try {
        const booking = await Booking.findOne({ bookingReference: req.params.reference })
            .populate('userId', 'name email agencyCode companyName')

        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' })

        if (!hasRole(req.user, 'Super Admin') && !hasRole(req.user, 'Admin') && booking.userId._id.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' })

        res.json({ success: true, data: booking })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to fetch booking' })
    }
}

/* =========================================================
   UPDATE BOOKING STATUS (ADMIN)
========================================================= */
const updateBookingStatus = async (req, res) => {
    try {
        const { status, notes } = req.body
        const booking = await Booking.findById(req.params.id)

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
        if (!hasRole(req.user, 'Super Admin') && !hasRole(req.user, 'Admin')) return res.status(403).json({ success: false, message: 'Not authorized' })

        const oldStatus = booking.status
        const seats = booking.adultsCount + booking.childrenCount
        const amount = booking.pricing.grandTotal

        let seatDiff = 0
        let creditDiff = 0

        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            seatDiff = seats
            creditDiff = amount
        }

        if (oldStatus === 'cancelled' && status !== 'cancelled') {
            seatDiff = -seats
            creditDiff = -amount
        }

        booking.status = status
        booking.notes = notes ?? booking.notes
        booking.expiresAt =
            status === 'on hold' || status === 'pending'
                ? new Date(Date.now() + HOLD_DURATION)
                : null

        await booking.save()

        await GroupTicketing.updateOne({ _id: booking.groupId }, { $inc: { totalSeats: seatDiff } })
        if (creditDiff !== 0)
            await Register.updateOne({ _id: booking.userId }, { $inc: { creditAmount: creditDiff } })

        // Send booking status change email
        if (oldStatus !== status) {
            try {
                const user = await Register.findById(booking.userId);
                if (user) {
                    const populatedBooking = await Booking.findById(booking._id).populate('airline');
                    await sendBookingStatusChangeEmail(user.email, user.name, populatedBooking, oldStatus, status);
                    console.log(`✅ Booking status change email sent to: ${user.email}`);
                }
            } catch (emailError) {
                console.error(`❌ Failed to send booking status change email:`, emailError.message);
                // Don't fail the status update if email fails
            }
        }

        res.json({ success: true, data: booking })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to update status' })
    }
}

/* =========================================================
   UPDATE BOOKING DETAILS
========================================================= */
const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

        if (!['on hold', 'pending'].includes(booking.status))
            return res.status(400).json({ success: false, message: 'Only on-hold bookings can be edited' })

        const oldSeats = booking.adultsCount + booking.childrenCount
        const oldAmount = booking.pricing.grandTotal

        Object.assign(booking, req.body)

        const newSeats = booking.adultsCount + booking.childrenCount
        const newAmount = booking.pricing.grandTotal

        booking.expiresAt = new Date(Date.now() + HOLD_DURATION)

        await booking.save()

        await GroupTicketing.updateOne(
            { _id: booking.groupId },
            { $inc: { totalSeats: oldSeats - newSeats } }
        )

        await Register.updateOne(
            { _id: booking.userId },
            { $inc: { creditAmount: oldAmount - newAmount } }
        )

        res.json({ success: true, data: booking })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to update booking' })
    }
}

/* =========================================================
   CANCEL BOOKING
========================================================= */
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

        if (booking.status === 'cancelled')
            return res.status(400).json({ success: false, message: 'Already cancelled' })

        if (!hasRole(req.user, 'Super Admin') && !hasRole(req.user, 'Admin') && booking.userId.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' })

        const seats = booking.adultsCount + booking.childrenCount
        const amount = booking.pricing.grandTotal

        booking.status = 'cancelled'
        booking.expiresAt = null
        await booking.save()

        await GroupTicketing.updateOne({ _id: booking.groupId }, { $inc: { totalSeats: seats } })
        await Register.updateOne({ _id: booking.userId }, { $inc: { creditAmount: amount } })

        res.json({ success: true, message: 'Booking cancelled', data: booking })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to cancel booking' })
    }
}

/* =========================================================
   DELETE BOOKING (ADMIN)
========================================================= */
const deleteBooking = async (req, res) => {
    try {
        if (!hasRole(req.user, 'Super Admin') && !hasRole(req.user, 'Admin'))
            return res.status(403).json({ success: false, message: 'Not authorized' })

        const booking = await Booking.findById(req.params.id)
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

        if (booking.status !== 'cancelled') {
            const seats = booking.adultsCount + booking.childrenCount
            const amount = booking.pricing.grandTotal

            await GroupTicketing.updateOne({ _id: booking.groupId }, { $inc: { totalSeats: seats } })
            await Register.updateOne({ _id: booking.userId }, { $inc: { creditAmount: amount } })
        }

        await booking.deleteOne()

        res.json({ success: true, message: 'Booking deleted' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to delete booking' })
    }
}

/* =========================================================
   BOOKING STATISTICS (ADMIN)
========================================================= */
const getBookingStatistics = async (req, res) => {
    try {
        if (!hasRole(req.user, 'Super Admin') && !hasRole(req.user, 'Admin'))
            return res.status(403).json({ success: false, message: 'Not authorized' })

        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$pricing.grandTotal' }
                }
            }
        ])

        const totalBookings = await Booking.countDocuments()
        const totalRevenueAgg = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } }
        ])

        res.json({
            success: true,
            data: {
                byStatus: stats,
                totalBookings,
                totalRevenue: totalRevenueAgg[0]?.total || 0
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' })
    }
}

export {
    createBooking,
    getAllBookings,
    getBookingById,
    getBookingByReference,
    updateBookingStatus,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getBookingStatistics
}
