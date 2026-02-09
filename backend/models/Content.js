import mongoose from 'mongoose';

/**
 * Content Model - Manage dynamic website content
 * Supports About Us, Services, Statistics, and other content pages
 */

const statisticSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: String,
        required: true
    },
    icon: String,
    suffix: String, // e.g., '+', '%'
    description: String,
    order: {
        type: Number,
        default: 0
    }
}, { _id: false });

const coreValueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    icon: String,
    order: {
        type: Number,
        default: 0
    }
}, { _id: false });

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    logo: String,
    services: [String],
    established: Number,
    order: {
        type: Number,
        default: 0
    }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    icon: String,
    image: String,
    features: [String],
    order: {
        type: Number,
        default: 0
    }
}, { _id: false });

const stepSchema = new mongoose.Schema({
    stepNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: String
}, { _id: false });

const contentSchema = new mongoose.Schema({
    // Page Identifier
    pageKey: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
        // Examples: 'ABOUT_US', 'HOMEPAGE', 'CONTACT', 'SERVICES'
    },

    // Page Title
    title: {
        type: String,
        required: true,
        trim: true
    },

    // About Us Section
    aboutUs: {
        tagline: String,
        established: Number,
        mission: {
            title: String,
            content: String
        },
        vision: {
            title: String,
            content: String
        },
        description: String,
        images: [{
            url: String,
            caption: String
        }]
    },

    // Core Values
    coreValues: [coreValueSchema],

    // Company Network
    companyNetwork: {
        title: String,
        description: String,
        companies: [companySchema]
    },

    // Services/Expertise
    services: [serviceSchema],

    // How It Works Section
    howItWorks: {
        title: String,
        description: String,
        steps: [stepSchema]
    },

    // Statistics
    statistics: [statisticSchema],

    // Hero Section
    hero: {
        title: String,
        subtitle: String,
        backgroundImage: String,
        backgroundVideo: String,
        ctaText: String,
        ctaLink: String
    },

    // Features/Highlights
    features: [{
        title: String,
        description: String,
        icon: String,
        image: String
    }],

    // Pilgrim's Handbook
    pilgrimsHandbook: [{
        title: String,
        description: String,
        icon: String,
        pdfUrl: String,
        order: Number
    }],

    // Contact Information
    contact: {
        phones: [{
            label: String,
            number: String,
            isPrimary: Boolean
        }],
        emails: [{
            label: String,
            email: String,
            isPrimary: Boolean
        }],
        addresses: [{
            label: String,
            address: String,
            city: String,
            country: String,
            isPrimary: Boolean
        }],
        socialMedia: {
            facebook: String,
            instagram: String,
            youtube: String,
            twitter: String,
            whatsapp: String,
            linkedin: String
        },
        workingHours: String
    },

    // SEO
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String],
        ogImage: String
    },

    // Status
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived'],
        default: 'Draft',
        index: true
    },

    // Version Control
    version: {
        type: Number,
        default: 1
    },

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register'
    },
    publishedAt: Date,
    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register'
    }
}, {
    timestamps: true
});

// Indexes
contentSchema.index({ pageKey: 1, status: 1 });

// Method to publish content
contentSchema.methods.publish = function(userId) {
    this.status = 'Published';
    this.publishedAt = new Date();
    this.publishedBy = userId;
    return this.save();
};

const Content = mongoose.model('Content', contentSchema);
export default Content;
