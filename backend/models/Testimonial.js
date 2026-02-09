import mongoose from 'mongoose';

/**
 * Testimonial Model - Customer Reviews & Feedback
 * Supports customer testimonials with ratings and approval workflow
 */

const testimonialSchema = new mongoose.Schema({
    // Customer Information
    customer: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        },
        avatar: String,
        location: String
    },

    // Review Content
    title: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },

    // Rating
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        index: true
    },

    // Service Type
    serviceType: {
        type: String,
        required: true,
        enum: ['Umrah Package', 'Hajj Package', 'Hotel Booking', 'Flight Booking', 'Visa Service', 'Tour Package', 'Overall Service'],
        index: true
    },

    // Related Booking (if applicable)
    relatedBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },

    // Verification
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    verifiedAt: Date,

    // Status
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Hidden'],
        default: 'Pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register'
    },
    reviewedAt: Date,
    rejectionReason: String,

    // Featured
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },

    // Helpful Count
    helpfulCount: {
        type: Number,
        default: 0
    },

    // Response from Company
    response: {
        content: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        },
        respondedAt: Date
    },

    // Images (optional)
    images: [{
        url: String,
        caption: String
    }],

    // Meta
    platform: {
        type: String,
        enum: ['Website', 'Facebook', 'Google', 'Email', 'Other'],
        default: 'Website'
    },

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
testimonialSchema.index({ status: 1, isFeatured: -1, rating: -1, createdAt: -1 });
testimonialSchema.index({ serviceType: 1, status: 1 });
testimonialSchema.index({ 'customer.userId': 1 });

// Virtual for display status
testimonialSchema.virtual('isPublished').get(function() {
    return this.status === 'Approved' && this.isVerified;
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
