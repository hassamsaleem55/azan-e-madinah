import mongoose from 'mongoose';

/**
 * Visa Model - Visa Service Management
 * Supports multiple countries, visa types, document requirements, and pricing
 */

const documentRequirementSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Business Owner', 'Job Holder', 'Retired Person', 'Student', 'Dependent', 'All']
    },
    documents: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: String,
        isMandatory: {
            type: Boolean,
            default: true
        }
    }]
}, { _id: false });

const pricingSchema = new mongoose.Schema({
    adult: {
        type: Number,
        required: true,
        min: 0
    },
    child: {
        type: Number,
        min: 0,
        default: function() { return this.adult; }
    },
    currency: {
        type: String,
        default: 'PKR'
    }
}, { _id: false });

const visaSchema = new mongoose.Schema({
    // Country Information
    country: {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            index: true
        },
        flagUrl: String
    },

    // Visa Type
    visaType: {
        type: String,
        required: true,
        enum: ['Tourist', 'Business', 'Student', 'Work', 'Family Visit', 'Transit', 'Sticker Visa', 'E-Visa', 'Easy Sticker Visa'],
        index: true
    },

    // Entry Type
    entryType: {
        type: String,
        enum: ['Single Entry', 'Multiple Entry'],
        default: 'Single Entry'
    },

    // Processing Information
    processingTime: {
        min: {
            type: Number,
            required: true // in days
        },
        max: {
            type: Number // in days
        },
        unit: {
            type: String,
            enum: ['Days', 'Weeks', 'Months'],
            default: 'Days'
        }
    },

    // Validity Duration
    validityDuration: {
        value: Number,
        unit: {
            type: String,
            enum: ['Days', 'Months', 'Years'],
            default: 'Days'
        }
    },

    // Duration Options (for UAE type visas)
    durationOptions: [{
        days: {
            type: Number,
            required: true
        },
        pricing: pricingSchema
    }],

    // Standard Pricing (if not duration-based)
    pricing: pricingSchema,

    // Document Requirements
    documentRequirements: [documentRequirementSchema],

    // General Requirements
    requirements: [{
        type: String,
        trim: true
    }],

    // Important Notes
    importantNotes: [{
        type: String,
        trim: true
    }],

    // Interview Required
    interviewRequired: {
        type: Boolean,
        default: false
    },

    // Bank Statement Required
    bankStatementRequired: {
        type: Boolean,
        default: false
    },
    minimumBankBalance: {
        amount: Number,
        currency: String
    },

    // Invitation Required
    invitationRequired: {
        type: Boolean,
        default: false
    },

    // Services Included
    servicesIncluded: [{
        type: String,
        enum: ['Document Review', 'Application Submission', 'Tracking', 'Courier Service', 'Translation', 'Attestation'],
        default: ['Document Review', 'Application Submission', 'Tracking']
    }],

    // Status & Availability
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended', 'Coming Soon'],
        default: 'Active',
        index: true
    },

    // Processing Status
    processingStatus: {
        type: String,
        enum: ['Open', 'Limited', 'Closed', 'By Appointment'],
        default: 'Open'
    },

    // Featured
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },

    // Popularity Score
    popularityScore: {
        type: Number,
        default: 0,
        index: true
    },

    // Application Count
    applicationCount: {
        type: Number,
        default: 0
    },

    // Success Rate
    successRate: {
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
visaSchema.index({ 'country.name': 'text', visaType: 'text', tags: 'text' });
visaSchema.index({ 'country.name': 1, visaType: 1, status: 1 });
visaSchema.index({ status: 1, isFeatured: -1, popularityScore: -1 });

// Virtual for display name
visaSchema.virtual('displayName').get(function() {
    return `${this.country.name} ${this.visaType}`;
});

// Pre-save middleware to generate slug
visaSchema.pre('save', function(next) {
    if ((this.isModified('country') || this.isModified('visaType')) && !this.slug) {
        this.slug = `${this.country.name}-${this.visaType}`.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

const Visa = mongoose.model('Visa', visaSchema);
export default Visa;
