import mongoose from 'mongoose';

const flightPackageSchema = new mongoose.Schema({
    flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    remainingSlots: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Sold Out', 'Upcoming', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique flight-package combinations
flightPackageSchema.index({ flight: 1, package: 1 }, { unique: true });

// Index for faster queries
flightPackageSchema.index({ status: 1 });
flightPackageSchema.index({ flight: 1 });
flightPackageSchema.index({ package: 1 });

// Virtual populate for better performance
flightPackageSchema.virtual('flightDetails', {
    ref: 'Flight',
    localField: 'flight',
    foreignField: '_id',
    justOne: true
});

flightPackageSchema.virtual('packageDetails', {
    ref: 'Package',
    localField: 'package',
    foreignField: '_id',
    justOne: true
});

// Ensure virtuals are included in JSON
flightPackageSchema.set('toJSON', { virtuals: true });
flightPackageSchema.set('toObject', { virtuals: true });

export default mongoose.model('FlightPackage', flightPackageSchema);
