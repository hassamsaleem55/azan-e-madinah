// Common types for the admin panel

export interface Package {
    _id: string;
    name: string;
    slug: string;
    type: string;
    description?: string;
    duration?: {
        days: number;
        nights: number;
    };
    accommodation?: Array<{
        city: string;
        hotel?: any;
        nights: number;
    }>;
    pricing?: Array<{
        tier?: string;
        tierType?: string;
        price: number;
    }>;
    inclusions?: string[];
    exclusions?: string[];
    status: string;
    featured?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Hotel {
    _id: string;
    name: string;
    nameArabic?: string;
    slug: string;
    description?: string;
    location?: {
        address?: string;
        city: string;
        distanceFromHaram?: number;
        walkingTime?: number;
        coordinates?: {
            latitude?: number;
            longitude?: number;
        };
    };
    starRating: number;
    category?: string;
    amenities?: Array<{
        name: string;
        icon?: string;
        category?: string;
    }> | string[];
    services?: {
        shuttleService?: boolean;
        breakfast?: boolean;
        wifi?: boolean;
        parking?: boolean;
        ac?: boolean;
        elevator?: boolean;
        restaurant?: boolean;
        roomService?: boolean;
        laundry?: boolean;
    };
    images?: Array<{
        url: string;
        caption?: string;
        category?: string;
        isPrimary?: boolean;
    }>;
    contact?: {
        phone?: string;
        email?: string;
        website?: string;
    };
    policies?: {
        checkInTime?: string;
        checkOutTime?: string;
        cancellationPolicy?: string;
        childPolicy?: string;
        petPolicy?: string;
    };
    isFeatured?: boolean;
    featured?: boolean; // for backward compatibility
    status: string;
    partnerId?: string;
    commission?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentRequirement {
    category: 'Business Owner' | 'Job Holder' | 'Retired Person' | 'Student' | 'Dependent' | 'All';
    documents: Array<{
        name: string;
        description?: string;
        isMandatory?: boolean;
    }>;
}

export interface Visa {
    _id: string;
    country: {
        name: string;
        code: string;
        flagUrl?: string;
    };
    visaType: string;
    entryType?: string;
    processingTime: {
        min: number;
        max?: number;
        unit: string;
    };
    validityDuration?: {
        value: number;
        unit: string;
    };
    durationOptions?: Array<{
        days: number;
        pricing: {
            adult: number;
            child?: number;
            currency?: string;
        };
    }>;
    pricing: {
        adult: number;
        child?: number;
        currency?: string;
    };
    documentRequirements?: DocumentRequirement[];
    requirements?: string[];
    importantNotes?: string[];
    interviewRequired?: boolean;
    bankStatementRequired?: boolean;
    minimumBankBalance?: {
        amount: number;
        currency: string;
    };
    invitationRequired?: boolean;
    servicesIncluded?: string[];
    status: string;
    processingStatus?: string;
    isFeatured?: boolean;
    popularityScore?: number;
    applicationCount?: number;
    successRate?: number;
    images?: Array<{
        url: string;
        caption?: string;
        isPrimary?: boolean;
    }>;
    tags?: string[];
    slug?: string;
    metaDescription?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Tour {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    type: string;
    category: string;
    seasonalCategory?: string;
    destination?: {
        country: string;
        countries?: string[];
        cities?: string[];
        region?: string;
    };
    duration?: {
        days: number;
        nights: number;
    };
    pricing?: {
        basePrice: number;
        currency?: string;
        pricePerPerson?: boolean;
        discountedPrice?: number;
        childPrice?: number;
    };
    itinerary?: Array<{
        dayNumber: number;
        title: string;
        description: string;
        activities?: Array<{
            time?: string;
            activity: string;
            location?: string;
        }>;
        meals?: {
            breakfast: boolean;
            lunch: boolean;
            dinner: boolean;
        };
        accommodation?: string;
    }>;
    inclusions?: Array<{
        category: string;
        description: string;
        icon?: string;
    }>;
    exclusions?: string[];
    features?: {
        returnTickets?: boolean;
        visa?: boolean;
        hotel?: boolean;
        hotelRating?: number;
        meals?: string;
        transport?: boolean;
        guide?: boolean;
        insurance?: boolean;
    };
    images?: Array<{
        url: string;
        caption?: string;
        isPrimary?: boolean;
    }>;
    reviews?: {
        averageRating: number;
        totalReviews: number;
    };
    isFeatured?: boolean;
    isBestSeller?: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Testimonial {
    _id: string;
    customer?: {
        name: string;
        email: string;
    };
    title?: string;
    content: string;
    rating: number;
    serviceType: string;
    status: string;
    isFeatured: boolean;
    response?: {
        content: string;
        respondedBy: string;
        respondedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ContentSection {
    heading: string;
    content: string;
    order: number;
}

export interface ContentStatistic {
    label: string;
    value: string;
    icon: string;
}

export interface ContentCoreValue {
    title: string;
    description: string;
    icon: string;
}

export interface Content {
    _id: string;
    page: string;
    title: string;
    sections: ContentSection[];
    statistics: ContentStatistic[];
    coreValues: ContentCoreValue[];
    companyNetwork: any[];
    seo?: {
        metaTitle: string;
        metaDescription: string;
    };
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}
