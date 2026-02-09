import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Adult', 'Child', 'Infant']
    },
    title: {
        type: String,
        required: true
    },
    givenName: {
        type: String,
        required: true,
        trim: true
    },
    surName: {
        type: String,
        required: true,
        trim: true
    },
    passport: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    passportExpiry: {
        type: Date,
        required: true
    }
});

const bookingSchema = new mongoose.Schema({
    // Group and Flight Information
    groupId: {
        type: String,
        required: true
    },
    groupType: {
        type: String,
        required: true
    },
    airline: {
        id: String,
        name: {
            type: String,
            required: true
        },
        logoUrl: String
    },
    sector: {
        type: String,
        required: true
    },
    pnr: {
        type: String,
        default: ''
    },

    // Contact Information
    contactPersonName: {
        type: String,
        required: true,
        trim: true
    },

    // Passenger Counts
    adultsCount: {
        type: Number,
        required: true,
        min: 0
    },
    childrenCount: {
        type: Number,
        default: 0,
        min: 0
    },
    infantsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalPassengers: {
        type: Number,
        required: true
    },

    // Pricing Information
    pricing: {
        adultPrice: {
            type: Number,
            required: true
        },
        childPrice: {
            type: Number,
            default: 0
        },
        infantPrice: {
            type: Number,
            default: 0
        },
        adultTotal: {
            type: Number,
            required: true
        },
        childTotal: {
            type: Number,
            default: 0
        },
        infantTotal: {
            type: Number,
            default: 0
        },
        grandTotal: {
            type: Number,
            required: true
        }
    },

    // Passenger Details
    passengers: [passengerSchema],

    // Flight Details
    flights: [{
        flightNo: String,
        flightDate: Date,
        depDate: Date,
        depTime: String,
        origin: String,
        destination: String,
        arrDate: Date,
        arrTime: String,
        baggage: String,
        meal: String
    }],

    // Dates
    departureDate: {
        type: Date,
        required: true
    },
    arrivalDate: {
        type: Date
    },

    // Booking Status
    status: {
        type: String,
        enum: ['on hold', 'confirmed', 'cancelled'],
        default: 'on hold'
    },

    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
        required: true
    },

    // Metadata
    bookingReference: {
        type: String,
        unique: true
        // Removed index: true to avoid duplicate with schema.index() below
    },
    notes: {
        type: String,
        default: ''
    },
    expiresAt: {
        type: Date,
        default: null,
        index: true, // helps cron/queries
    },
}, {
    timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', async function () {
    if (!this.bookingReference) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.bookingReference = `BK${timestamp}${random}`;
    }
});

// Index for faster queries
bookingSchema.index({ userId: 1, createdAt: -1 });
// Note: bookingReference already has unique: true, no need for explicit index
bookingSchema.index({ status: 1 });
bookingSchema.index({ groupId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
