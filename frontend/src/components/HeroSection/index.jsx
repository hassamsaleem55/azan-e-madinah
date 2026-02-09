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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-b from-[#0B0E1A] via-[#151B2E] to-[#0B0E1A]">
            {/* --- Main Background Image & Overlay --- */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 opacity-15"
                style={{
                    backgroundImage: `url('${DEFAULT_IMAGE}')`
                }}
            />

            {/* Sophisticated Gradient Overlay with Islamic Pattern Effect */}
            <div className="absolute inset-0 bg-linear-to-b from-[#0B0E1A]/95 via-[#151B2E]/85 to-[#0B0E1A]/95 z-0" />
            
            {/* Vibrant Gold Glow Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,165,54,0.15),transparent_60%)] z-0" />
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#C9A536] to-transparent opacity-50" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
                {/* --- Cards Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {groupTypes.map((group) => (
                        <Link
                            key={group.value}
                            to={`/dashboard/${group.path}`}
                            className="group relative h-64 sm:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-[#C9A536]/40 transition-all duration-500 ease-out border-2 border-[#C9A536]/40 hover:border-[#E6C35C] hover:-translate-y-3 hover:scale-[1.02]"
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
                            <div className="absolute inset-0 bg-linear-to-t from-[#0B0E1A]/98 via-[#151B2E]/60 to-transparent opacity-85 transition-opacity duration-300" />

                            {/* Vibrant Gold Hover Tint */}
                            <div className="absolute inset-0 bg-linear-to-br from-[#C9A536]/40 via-[#E6C35C]/30 to-[#C9A536]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Card Content */}
                            <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-[#E6C35C] uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin size={12} />
                                            {group.label.includes('Umrah') ? 'Pilgrimage' : 'Destination'}
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between mt-1">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-[#E6C35C] transition-colors">
                                            {group.label.replace(' Groups', '')}
                                        </h3>

                                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#C9A536]/30 to-[#E6C35C]/30 backdrop-blur-md flex items-center justify-center text-[#E6C35C] border-2 border-[#C9A536]/50 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-linear-to-br group-hover:from-[#C9A536] group-hover:to-[#E6C35C] group-hover:text-[#0B0E1A] group-hover:shadow-lg group-hover:shadow-[#C9A536]/50 transition-all duration-300">
                                            <ArrowRight size={16} className="font-bold" />
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