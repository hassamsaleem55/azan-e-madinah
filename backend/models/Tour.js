import mongoose from 'mongoose';

/**
 * Tour Model - Tour Package Management
 * Supports international tours with detailed itineraries, pricing, and inclusions
 */

const itineraryDaySchema = new mongoose.Schema({
    dayNumber: {
        type: Number,
        required: true,
        min: 1
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    activities: [{
        time: String,
        activity: {
            type: String,
            required: true
        },
        location: String
    }],
    meals: {
        breakfast: {
            type: Boolean,
            default: false
        },
        lunch: {
            type: Boolean,
            default: false
        },
        dinner: {
            type: Boolean,
            default: false
        }
    },
    accommodation: String
}, { _id: false });

const inclusionSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Flights', 'Accommodation', 'Meals', 'Transport', 'Activities', 'Visa', 'Insurance', 'Guide', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    icon: String
}, { _id: false });

const pricingSchema = new mongoose.Schema({
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'PKR'
    },
    pricePerPerson: {
        type: Boolean,
        default: true
    },
    discountedPrice: {
        type: Number,
        min: 0
    },
    childPrice: {
        type: Number,
        min: 0
    }
}, { _id: false });

const tourSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true
    },

    // Destination
    destination: {
        country: {
            type: String,
            required: true,
            index: true
        },
        countries: [{
            type: String
        }],
        cities: [{
            type: String
        }],
        region: String
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

    // Tour Type
    type: {
        type: String,
        required: true,
        enum: ['Group Tour', 'Private Tour', 'Custom Tour', 'Family Tour', 'Honeymoon', 'Adventure', 'Cultural', 'Religious'],
        index: true
    },

    // Category
    category: {
        type: String,
        enum: ['Budget', 'Standard', 'Deluxe', 'Luxury', 'Premium'],
        default: 'Standard',
        index: true
    },

    // Seasonal Categories
    seasonalCategory: {
        type: String,
        enum: ['Summer Special', 'Winter Special', 'Spring Special', 'Autumn Special', 'All Year'],
        index: true
    },

    // Itinerary
    itinerary: {
        type: [itineraryDaySchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Tour must have at least one day in itinerary'
        }
    },

    // Pricing
    pricing: {
        type: pricingSchema,
        required: true
    },

    // Inclusions & Exclusions
    inclusions: [inclusionSchema],
    exclusions: [{
        type: String,
        trim: true
    }],

    // Tour Features
    features: {
        returnTickets: {
            type: Boolean,
            default: false
        },
        visa: {
            type: Boolean,
            default: false
        },
        hotel: {
            type: Boolean,
            default: true
        },
        hotelRating: {
            type: Number,
            min: 1,
            max: 5
        },
        meals: {
            type: String,
            enum: ['None', 'Breakfast Only', 'Half Board', 'Full Board', 'All Inclusive']
        },
        transport: {
            type: Boolean,
            default: true
        },
        guide: {
            type: Boolean,
            default: false
        },
        insurance: {
            type: Boolean,
            default: false
        }
    },

    // Departure Information
    departures: [{
        date: {
            type: Date,
            required: true
        },
        availableSeats: {
            type: Number,
            min: 0
        },
        status: {
            type: String,
            enum: ['Available', 'Limited', 'Sold Out', 'Cancelled'],
            default: 'Available'
        }
    }],

    // Group Size
    groupSize: {
        minimum: {
            type: Number,
            min: 1,
            default: 1
        },
        maximum: {
            type: Number,
            min: 1
        }
    },

    // Age Requirements
    ageRequirements: {
        minimumAge: {
            type: Number,
            min: 0
        },
        maximumAge: {
            type: Number
        },
        childFriendly: {
            type: Boolean,
            default: true
        }
    },

    // Physical Requirements
    fitnessLevel: {
        type: String,
        enum: ['Easy', 'Moderate', 'Challenging', 'Difficult'],
        default: 'Easy'
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

    // Images
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],

    // Status
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Sold Out', 'Coming Soon'],
        default: 'Active',
        index: true
    },

    // Featured
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },

    // Best Seller
    isBestSeller: {
        type: Boolean,
        default: false,
        index: true
    },

    // Booking Count
    bookingCount: {
        type: Number,
        default: 0
    },

    // Tags
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
    metaDescription: String,

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
tourSchema.index({ name: 'text', description: 'text', tags: 'text' });
tourSchema.index({ 'destination.country': 1, type: 1, status: 1 });
tourSchema.index({ status: 1, isFeatured: -1, 'reviews.averageRating': -1 });
tourSchema.index({ category: 1, seasonalCategory: 1 });

// Virtual for has available departures
tourSchema.virtual('hasAvailableDepartures').get(function() {
    return this.departures && this.departures.some(dep => dep.status === 'Available' && dep.date > new Date());
});

// Pre-save middleware to generate slug
tourSchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
