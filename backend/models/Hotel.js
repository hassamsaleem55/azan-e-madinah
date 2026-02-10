import mongoose from 'mongoose';

/**
 * Hotel Model - Hotel Management for Makkah and Madinah
 * Supports complete hotel details with amenities, ratings, and pricing
 */

const amenitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    icon: String,
    category: {
        type: String,
        enum: ['Room', 'Bathroom', 'General', 'Services', 'Food'],
        default: 'General'
    }
}, { _id: false });

const locationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        enum: ['Makkah', 'Madinah'],
        index: true
    },
    district: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    distanceFromHaram: {
        type: Number, // in meters
        required: true,
        index: true
    },
    walkingTime: Number, // in minutes
}, { _id: false });

const hotelSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    nameArabic: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },

    // Location
    location: {
        type: locationSchema,
        required: true
    },

    // Star Rating
    starRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        index: true
    },

    // Reviews & Ratings
    reviews: {
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },

    // Amenities
    amenities: [amenitySchema],

    // Services
    services: {
        shuttleService: {
            type: Boolean,
            default: false
        },
        breakfast: {
            type: Boolean,
            default: false
        },
        wifi: {
            type: Boolean,
            default: true
        },
        parking: {
            type: Boolean,
            default: false
        },
        ac: {
            type: Boolean,
            default: true
        },
        elevator: {
            type: Boolean,
            default: true
        },
        restaurant: {
            type: Boolean,
            default: false
        },
        roomService: {
            type: Boolean,
            default: false
        },
        laundry: {
            type: Boolean,
            default: false
        }
    },

    // Category
    category: {
        type: String,
        enum: ['Economy', 'Standard', 'Deluxe', 'Premium', 'Luxury'],
        default: 'Standard',
        index: true
    },

    // Images
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: String,
        category: {
            type: String,
            enum: ['Exterior', 'Room', 'Bathroom', 'Lobby', 'Restaurant', 'Amenity', 'View'],
            default: 'Exterior'
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],

    // Contact Information
    contact: {
        phone: String,
        email: String,
        website: String
    },

    // Policies
    policies: {
        checkInTime: {
            type: String,
            default: '14:00'
        },
        checkOutTime: {
            type: String,
            default: '12:00'
        },
        cancellationPolicy: String,
        childPolicy: String,
        petPolicy: String
    },

    // Featured
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },

    // Partner Information
    partnerId: String,
    commission: {
        type: Number,
        min: 0,
        max: 100,
        default: 10
    },

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
hotelSchema.index({ name: 'text', description: 'text' });
hotelSchema.index({ 'location.city': 1, starRating: -1, 'location.distanceFromHaram': 1 });
hotelSchema.index({ isFeatured: -1 });
hotelSchema.index({ category: 1, 'location.city': 1 });

// Pre-save middleware to generate slug
hotelSchema.pre('save', function() {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
});

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
