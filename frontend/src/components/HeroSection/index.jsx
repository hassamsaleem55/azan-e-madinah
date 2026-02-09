import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Globe, Star } from 'lucide-react';
import { groupTypes } from '../../data/groupTypes';
import defaultImg from '../../assets/images/default-image.avif';
import allGroupsImg from '../../assets/images/all-groups.avif';
import uaeImg from '../../assets/images/uae.avif';
import ksaImg from '../../assets/images/ksa.avif';
import bahrainImg from '../../assets/images/bahrain.avif';
import muscatImg from '../../assets/images/muscat.avif';
import qatarImg from '../../assets/images/qatar.avif';
import ukImg from '../../assets/images/uk.avif';
import umrahImg from '../../assets/images/umrah.avif';

// Fallback image (General Travel / Airplane Wing)
const DEFAULT_IMAGE = defaultImg;

// Updated Image Map with reliable Unsplash IDs
const groupImages = {
    // General / Travel
    'All Groups': allGroupsImg,

    // UAE (Dubai Skyline)
    'UAE': uaeImg,

    // KSA (Riyadh/Saudi Architecture)
    'KSA': ksaImg,

    // Bahrain (Manama Skyline) - Specific reliable ID
    'Bahrain': bahrainImg,

    // Muscat (Oman Landscape/Architecture)
    'Muscat': muscatImg,

    // Qatar (Doha Skyline)
    'Qatar': qatarImg,
    // UK (London/Big Ben)
    'UK': ukImg,

    // Umrah (Makkah/Kaaba)
    'Umrah': umrahImg,
};

// Helper to get image regardless of whether label has "Groups" suffix or not
const getGroupImage = (label) => {
    if (!label) return DEFAULT_IMAGE;
    // Clean label (e.g., "UAE Groups" -> "UAE")
    const cleanKey = label.replace(' Groups', '').trim();
    // Return specific image or default
    return groupImages[cleanKey] || groupImages[label] || DEFAULT_IMAGE;
};

export default function HeroSection() {

    // Handler to replace broken images with the default one
    const handleImageError = (e) => {
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = DEFAULT_IMAGE;
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#001a33]">
            {/* --- Main Background Image & Overlay --- */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105"
                style={{
                    backgroundImage: `url('${DEFAULT_IMAGE}')`
                }}
            />

            {/* Sophisticated Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-[#003366]/80 via-[#001a33]/60 to-[#001a33]/95 z-0 backdrop-blur-[1px]" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">

                {/* --- Hero Header --- */}
                <div className="text-center mb-16 space-y-6 max-w-4xl mx-auto">
                    {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-200 text-xs sm:text-sm font-medium tracking-wide animate-fade-in-down">
                        <Globe size={14} className="text-blue-400" />
                        <span>Simplifying Global Travel Management</span>
                    </div> */}

                    {/* <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
                        Journey With
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-white to-blue-300"> Rihla Access</span>
                    </h1> */}

                    {/* <p className="max-w-2xl mx-auto text-lg text-slate-300 font-light leading-relaxed">
                        Your gateway to exclusive group flights and seamless travel experiences.
                        Choose your destination and let us handle the logistics.
                    </p> */}
                </div>

                {/* --- Cards Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {groupTypes.map((group) => (
                        <Link
                            key={group.value}
                            to={`/dashboard/${group.path}`}
                            className="group relative h-64 sm:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-500 ease-out border border-white/10 hover:-translate-y-2"
                        >
                            {/* Card Image */}
                            <img
                                src={getGroupImage(group.label)}
                                onError={handleImageError}
                                alt={group.label}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                loading="lazy"
                            />

                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300" />

                            {/* Blue Hover Tint */}
                            <div className="absolute inset-0 bg-[#003366]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[1px]" />

                            {/* Card Content */}
                            <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin size={12} />
                                            {group.label.includes('Umrah') ? 'Pilgrimage' : 'Destination'}
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between mt-1">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-blue-50 transition-colors">
                                            {group.label.replace(' Groups', '')}
                                        </h3>

                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}