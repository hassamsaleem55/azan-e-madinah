import Booking from '../models/Booking.js';
import GroupTicketing from '../models/GroupTicketing.js';

// Store active timers to prevent duplicates
const activeTimers = new Map();

/**
 * Check if a booking already has an active timer
 */
export const hasBookingTimer = (bookingId) => {
    return activeTimers.has(bookingId);
};

export const startBookingTimer = async (bookingId) => {
    // Always restart timer
    if (activeTimers.has(bookingId)) {
        clearTimeout(activeTimers.get(bookingId));
        activeTimers.delete(bookingId);
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    if (booking.status !== 'on hold' && booking.status !== 'pending') return;

    const baseTime = new Date(booking.updatedAt).getTime();
    const expiryTime = baseTime + 2 * 60 * 60 * 1000;
    const remainingTime = expiryTime - Date.now();

    if (remainingTime <= 0) {
        await cancelBookingAfterTimeout(bookingId);
        return;
    }

    const timerId = setTimeout(async () => {
        try {
            await cancelBookingAfterTimeout(bookingId);
        } finally {
            activeTimers.delete(bookingId);
        }
    }, remainingTime);

    activeTimers.set(bookingId, timerId);

    console.log(
        `Timer restarted for booking ${bookingId}, expires in ${Math.round(
            remainingTime / 1000
        )}s`
    );
};

/**
 * Cancel booking after timeout and return seats
 */
const cancelBookingAfterTimeout = async (bookingId) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) return;

    if (booking.status !== 'on hold' && booking.status !== 'pending') return;

    booking.status = 'cancelled';
    await booking.save();

    const seatsToReturn = booking.adultsCount + booking.childrenCount;

    await GroupTicketing.updateOne(
        { _id: booking.groupId },
        { $inc: { totalSeats: seatsToReturn } }
    );

    console.log(`Booking ${bookingId} auto-cancelled, seats returned: ${seatsToReturn}`);
};

/**
 * Cancel a timer manually
 */
export const cancelBookingTimer = (bookingId) => {
    if (activeTimers.has(bookingId)) {
        clearTimeout(activeTimers.get(bookingId));
        activeTimers.delete(bookingId);
        console.log(`Timer cancelled for booking ${bookingId}`);
    }
};

/**
 * Remaining time for frontend countdown
 */

export const getBookingRemainingTime = (baseTime) => {
    const expiry = new Date(baseTime).getTime() + 2 * 60 * 60 * 1000;
    const diff = expiry - Date.now();

    if (diff <= 0) {
        return { expired: true, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        expired: false,
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
};

