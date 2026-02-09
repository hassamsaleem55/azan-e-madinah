import mongoose from 'mongoose';

/**
 * Package Model - Umrah/Hajj Package Management
 * Supports complete package details with accommodation, pricing tiers, and inclusions
 */

const accommodationSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        enum: ['Makkah', 'Madinah']
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    distanceFromHaram: {
        type: Number, // in meters
        required: true
    },
    nights: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const pricingTierSchema = new mongoose.Schema({
    tierType: {
        type: String,
        required: true,
        enum: ['Sharing', 'Quad', 'Triple', 'Double']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'PKR'
    }
}, { _id: false });

const inclusionSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Visa', 'Accommodation', 'Transport', 'Meals', 'Ziyarat', 'Insurance', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    included: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const packageSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Umrah', 'Hajj', 'Combined'],
        index: true
    },
    description: {
        type: String,
        trim: true
    },

    // Duration
    duration: {
        days: {
            type: Number,
            required: true,
            min: 1
        },
        nights: {
            type: Number,
            required: true,
            min: 0
        }
    },

    // Departure Cities
    departureCities: [{
        type: String,
        required: true,
        index: true
    }],

    // Accommodation Details (Makkah & Madinah)
    accommodations: {
        type: [accommodationSchema],
        validate: {
            validator: function(v) {
                // Must have at least Makkah accommodation
                return v && v.some(acc => acc.city === 'Makkah');
            },
            message: 'Package must include Makkah accommodation'
        }
    },

    // Pricing Tiers
    pricing: {
        type: [pricingTierSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Package must have at least one pricing tier'
        }
    },

    // Inclusions & Exclusions
    inclusions: [inclusionSchema],
    
    exclusions: [{
        type: String,
        trim: true
    }],

    // Visa Information
    visaIncluded: {
        type: Boolean,
        default: true
    },
    visaType: {
        type: String,
        enum: ['Tourist', 'Umrah', 'Hajj', 'Visit'],
        default: 'Umrah'
    },

    // Transport
    transportIncluded: {
        type: Boolean,
        default: true
    },
    transportDetails: {
        type: String,
        trim: true
    },

    // Ziyarat
    ziyaratIncluded: {
        type: Boolean,
        default: true
    },
    ziyaratWithGuide: {
        type: Boolean,
        default: true
    },
    ziyaratDetails: {
        type: String,
        trim: true
    },

    // Availability & Status
    availability: {
        startDate: {
            type: Date,
            index: true
        },
        endDate: {
            type: Date,
            index: true
        },
        availableSeats: {
            type: Number,
            min: 0
        },
        totalSeats: {
            type: Number,
            min: 0
        }
    },

    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Sold Out', 'Upcoming'],
        default: 'Active',
        index: true
    },

    // Featured & Promotional
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    isPromotional: {
        type: Boolean,
        default: false
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    // Images
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],

    // Meta Information
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // SEO
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
packageSchema.index({ name: 'text', description: 'text', tags: 'text' });
packageSchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 });
packageSchema.index({ type: 1, status: 1, isFeatured: -1 });
packageSchema.index({ departureCities: 1, status: 1 });

// Virtual for total capacity
packageSchema.virtual('capacityPercentage').get(function() {
    if (!this.availability.totalSeats) return 0;
    return ((this.availability.totalSeats - this.availability.availableSeats) / this.availability.totalSeats) * 100;
});

// Pre-save middleware to generate slug
packageSchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

const Package = mongoose.model('Package', packageSchema);
export default Package;
