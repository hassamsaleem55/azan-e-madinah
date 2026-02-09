// Common types for the admin panel

export interface Package {
    _id: string;
    name: string;
    slug: string;
    type: string;
    departureCities?: string[];
    duration?: {
        days: number;
        nights: number;
    };
    pricing?: Array<{
        tier: string;
        price: number;
    }>;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Hotel {
    _id: string;
    name: string;
    slug: string;
    location?: {
        city: string;
        distanceFromHaram?: number;
    };
    starRating: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Visa {
    _id: string;
    country?: {
        name: string;
        code: string;
    };
    visaType: string;
    processingTime?: {
        min: number;
        max?: number;
        unit: string;
    };
    pricing?: {
        adult: number;
        child?: number;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tour {
    _id: string;
    name: string;
    slug: string;
    type: string;
    category: string;
    destination?: {
        country: string;
        cities: string[];
    };
    duration?: {
        days: number;
        nights: number;
    };
    pricing?: {
        basePrice: number;
    };
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
