import mongoose from 'mongoose';

/**
 * Visa Application Model - Track visa application submissions and processing
 */

const visaApplicationSchema = new mongoose.Schema({
    // Reference Number
    applicationNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Applicant Information
    applicant: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true
        },
        whatsapp: String,
        nationality: {
            type: String,
            required: true
        },
        dateOfBirth: Date,
        passportNumber: String,
        passportExpiry: Date,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        }
    },

    // Visa Details
    visa: {
        visaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Visa',
            required: true
        },
        country: {
            type: String,
            required: true
        },
        visaType: {
            type: String,
            required: true
        },
        duration: Number, // for UAE type visas
        entryType: String
    },

    // Travel Details
    travelDetails: {
        preferredTravelDate: Date,
        returnDate: Date,
        purposeOfVisit: String,
        durationOfStay: Number
    },

    // Travelers
    travelers: {
        adults: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        children: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // Documents Submitted
    documents: [{
        documentType: {
            type: String,
            required: true
        },
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Pending Review', 'Approved', 'Rejected', 'Resubmit Required'],
            default: 'Pending Review'
        },
        remarks: String
    }],

    // Additional Information
    additionalMessage: String,
    specialRequirements: String,

    // Applicant Category
    applicantCategory: {
        type: String,
        enum: ['Business Owner', 'Job Holder', 'Retired Person', 'Student', 'Dependent'],
        required: true
    },

    // Pricing
    pricing: {
        basePrice: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'PKR'
        },
        additionalCharges: [{
            description: String,
            amount: Number
        }],
        totalAmount: {
            type: Number,
            required: true
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
            default: 'Pending',
            index: true
        }
    },

    // Application Status
    status: {
        type: String,
        enum: [
            'Draft',
            'Submitted',
            'Under Review',
            'Documents Required',
            'Processing',
            'Interview Scheduled',
            'Approved',
            'Rejected',
            'Cancelled',
            'On Hold'
        ],
        default: 'Submitted',
        index: true
    },

    // Status History (Tracking)
    statusHistory: [{
        status: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        },
        remarks: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Interview Details (if required)
    interview: {
        required: {
            type: Boolean,
            default: false
        },
        scheduledDate: Date,
        location: String,
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']
        },
        result: {
            type: String,
            enum: ['Passed', 'Failed', 'Pending']
        },
        notes: String
    },

    // Processing Information
    processing: {
        startedAt: Date,
        expectedCompletionDate: Date,
        completedAt: Date,
        processingDays: Number,
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        }
    },

    // Result
    result: {
        status: {
            type: String,
            enum: ['Approved', 'Rejected', 'Pending']
        },
        visaNumber: String,
        issueDate: Date,
        expiryDate: Date,
        validityPeriod: String,
        remarks: String,
        rejectionReason: String
    },

    // Communication
    communications: [{
        type: {
            type: String,
            enum: ['Email', 'SMS', 'Phone Call', 'WhatsApp', 'Note']
        },
        subject: String,
        message: String,
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        },
        sentAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Source
    source: {
        type: String,
        enum: ['Website', 'Agent Portal', 'Admin Panel', 'Walk-in', 'Phone', 'Email'],
        default: 'Website'
    },

    // Agent Information (if booked through agent)
    agent: {
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        },
        agentCode: String,
        commission: Number
    },

    // Priority
    priority: {
        type: String,
        enum: ['Normal', 'Urgent', 'VIP'],
        default: 'Normal',
        index: true
    },

    // Notes (Internal)
    internalNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

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
visaApplicationSchema.index({ applicationNumber: 1 });
visaApplicationSchema.index({ 'applicant.email': 1, status: 1 });
visaApplicationSchema.index({ 'visa.country': 1, status: 1 });
visaApplicationSchema.index({ status: 1, priority: -1, createdAt: -1 });
visaApplicationSchema.index({ 'agent.agentId': 1, status: 1 });
visaApplicationSchema.index({ createdAt: -1 });

// Generate application number
visaApplicationSchema.pre('save', async function(next) {
    if (this.isNew && !this.applicationNumber) {
        const count = await mongoose.model('VisaApplication').countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const num = (count + 1).toString().padStart(5, '0');
        this.applicationNumber = `VA${year}${month}${num}`;
    }
    next();
});

// Virtual for days in processing
visaApplicationSchema.virtual('daysInProcessing').get(function() {
    if (!this.processing.startedAt) return 0;
    const end = this.processing.completedAt || new Date();
    const diff = end - this.processing.startedAt;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

const VisaApplication = mongoose.model('VisaApplication', visaApplicationSchema);
export default VisaApplication;
