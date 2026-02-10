import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    airline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airline',
        required: true
    },
    sector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sector',
        required: true
    },
    departureCity: {
        type: String,
        required: true,
        trim: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalCity: {
        type: String,
        required: true,
        trim: true
    },
    arrivalDate: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
flightSchema.index({ flightNumber: 1 });
flightSchema.index({ airline: 1 });
flightSchema.index({ sector: 1 });
flightSchema.index({ departureDate: 1 });

const Flight = mongoose.model('Flight', flightSchema);

export default Flight;
