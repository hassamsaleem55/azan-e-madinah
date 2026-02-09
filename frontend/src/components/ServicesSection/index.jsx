import airTicketsImg from "../../assets/images/air-tickets.avif"
import umrahPkgImg from "../../assets/images/umrah-packages.avif"
import visaServicesImg  from "../../assets/images/visa-services.avif"
import hotelPackagesImg from "../../assets/images/hotel-packages.avif"
import travelConsultancyImg from "../../assets/images/travel-consultancy.avif"
import meetAssistImg from "../../assets/images/meet-and-assist.avif"

const services = [
    {
        id: 1,
        title: 'Air Tickets',
        description: 'We arrange safe, comfortable air tickets, activities, and hotels for your stay.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
        ),
        image: airTicketsImg
    },
    {
        id: 2,
        title: 'Umrah Packages',
        description: 'We offer spiritually fulfilling Umrah packages for groups and individuals.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        // UPDATED IMAGE: View of the Holy Mosque / Kaaba crowd
        image: umrahPkgImg
    },
    {
        id: 3,
        title: 'Visa Services',
        description: 'Efficient visa services for seamless international travel with expert guidance.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        image: visaServicesImg
    },
    {
        id: 4,
        title: 'Hotel Packages',
        description: 'Luxurious hotel stays with curated experiences at top destinations worldwide.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        image: hotelPackagesImg
    },
    {
        id: 5,
        title: 'Travel Consultancy',
        description: 'Expert guidance and personalized bookings for unforgettable adventures.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        // UPDATED IMAGE: Travel planning map/compass vibe
        image: travelConsultancyImg
    },
    {
        id: 6,
        title: 'Meet & Assist',
        description: 'Seamless meet and assist services for stress-free airport experiences.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
        ),
        image: meetAssistImg
    },
];

export default function ServicesSection() {
    return (
        <section id="services" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-[#C9A536] font-bold tracking-[0.3em] uppercase text-sm block mb-4">What We Offer</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0B0E1A] mb-6">World Class Travel Services</h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-[#C9A536] via-[#E6C35C] to-[#C9A536] mx-auto rounded-full shadow-lg shadow-[#C9A536]/30"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => (
                        <div key={service.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
                            {/* Image Header */}
                            <div className="relative h-60 overflow-hidden">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-[#0B0E1A]/30 group-hover:bg-[#0B0E1A]/0 transition-colors duration-500"></div>

                                {/* Icon Badge */}
                                <div className="absolute -bottom-6 left-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#C9A536] group-hover:bg-gradient-to-br group-hover:from-[#C9A536] group-hover:via-[#E6C35C] group-hover:to-[#C9A536] group-hover:text-[#0B0E1A] group-hover:shadow-2xl group-hover:shadow-[#C9A536]/40 transition-all duration-300">
                                    {service.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 pt-12 grow">
                                <h3 className="text-2xl font-bold text-[#0B0E1A] mb-4">{service.title}</h3>
                                <p className="text-[#545454] leading-relaxed mb-6">
                                    {service.description}
                                </p>
                                <a href="#" className="inline-flex items-center text-[#C9A536] font-bold gap-2 group/link hover:text-[#E6C35C] transition-colors">
                                    Learn More
                                    <span className="w-6 h-px bg-[#C9A536] transition-all group-hover/link:w-10 group-hover/link:bg-[#E6C35C]"></span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};