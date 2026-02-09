import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import contentApi from '../../../api/contentApi';
import './AboutUs.css';

const AboutUs = () => {
    const [content, setContent] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
        fetchTestimonials();
    }, []);

    const fetchContent = async () => {
        try {
            const data = await contentApi.getPageContent('ABOUT_US');
            setContent(data.content);
        } catch (error) {
            console.error('Failed to fetch content:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTestimonials = async () => {
        try {
            const data = await contentApi.getTestimonials({ limit: 6, isFeatured: true });
            setTestimonials(data.testimonials || []);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="about-us-page">
            {/* Hero Section */}
            <div className="hero-section" style={{
                background: 'linear-gradient(135deg, #6B1B3D 0%, #C9A536 100%)',
                padding: '100px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <div className="container mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        {content?.title || 'About Azan-e-Madinah'}
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Your trusted partner for spiritual journeys and travel experiences
                    </p>
                </div>
            </div>

            {/* Content Sections */}
            <div className="container mx-auto px-4 py-16">
                {content?.sections?.map((section, index) => (
                    <div key={index} className={`mb-12 ${index % 2 === 0 ? '' : 'bg-gray-50 rounded-lg p-8'}`}>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                        <p className="text-gray-700 leading-relaxed text-lg">{section.content}</p>
                    </div>
                ))}
            </div>

            {/* Statistics Section */}
            {content?.statistics?.length > 0 && (
                <div className="bg-primary-600 text-white py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {content.statistics.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-5xl font-bold mb-2">{stat.value}</div>
                                    <div className="text-xl opacity-90">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Core Values */}
            {content?.coreValues?.length > 0 && (
                <div className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {content.coreValues.map((value, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">{value.icon || '✨'}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Company Network */}
            {content?.companyNetwork?.length > 0 && (
                <div className="bg-gray-50 py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Presence</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {content.companyNetwork.map((location, index) => (
                                <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
                                    <div className="text-2xl font-bold text-primary-600 mb-2">
                                        {location.country}
                                    </div>
                                    <div className="text-gray-600">{location.city}</div>
                                    {location.officeCount > 1 && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            {location.officeCount} offices
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <div className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <Quote size={40} className="text-primary-200 mb-4" />
                                {testimonial.title && (
                                    <h3 className="font-bold text-gray-900 mb-2">{testimonial.title}</h3>
                                )}
                                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                                <div className="flex items-center gap-2 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="font-semibold text-gray-900">{testimonial.customer?.name}</div>
                                    <div className="text-gray-500">{testimonial.serviceType}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="bg-linear-to-r from-primary-600 to-accent-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-xl mb-8">Let us help you plan your next spiritual or leisure trip</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <a
                            href="/packages"
                            className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                        >
                            View Packages
                        </a>
                        <a
                            href="/contact"
                            className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-600 transition font-semibold"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
