import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    getBookingByReference,
    updateBookingStatus,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getBookingStatistics
} from '../controllers/booking.controller.js';
import {
    validateCreateBooking,
    validateUpdateBooking,
    validateBookingId,
    validatePaginationQuery
} from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new booking
router.post('/', validateCreateBooking, createBooking);

// Get all bookings (with filters)
router.get('/', checkPermission('bookings.view'), validatePaginationQuery, getAllBookings);

// Get booking statistics (admin only)
router.get('/statistics', checkPermission('dashboard.stats'), getBookingStatistics);

// Get booking by reference number
router.get('/reference/:reference', checkPermission('bookings.view'), getBookingByReference);

// Get booking by ID
router.get('/:id', checkPermission('bookings.details'), validateBookingId, getBookingById);

// Update booking status (admin only)
router.patch('/:id/status', checkPermission('bookings.approve'), validateBookingId, updateBookingStatus);

// Update booking details
router.put('/:id', checkPermission('bookings.edit'), validateUpdateBooking, updateBooking);

// Cancel booking
router.patch('/:id/cancel', checkPermission('bookings.cancel'), validateBookingId, cancelBooking);

// Delete booking (admin only)
router.delete('/:id', checkPermission('bookings.delete'), validateBookingId, deleteBooking);
export default router;
