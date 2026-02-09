import { BiSolidPlane } from "react-icons/bi";
import { FaGlobe } from "react-icons/fa";
import { GiFalconMoon } from "react-icons/gi";
import { LuHotel } from "react-icons/lu";

const features = [
    {
        title: "Airline Tickets",
        desc: "Get instant access to worldwide destinations with competitive pricing and 24/7 booking support.",
        icon: <BiSolidPlane className="text-4xl" />
    },
    {
        title: "Visa Services",
        desc: "Simplify your travel with our high-success visa processing. We handle the paperwork for you.",
        icon: <FaGlobe className="text-4xl" />
    },
    {
        title: "Umrah Packages",
        desc: "All-inclusive, spiritually-focused packages featuring premium locations and seamless logistics.",
        icon: <GiFalconMoon className="text-4xl" />
    },
    {
        title: "Hotel Booking",
        desc: "From luxury resorts to budget-friendly rooms, we offer vetted accommodations at exclusive rates.",
        icon: <LuHotel className="text-4xl" />
    }
];

export default function ChooseUsSection() {
    return (
        <section className="py-24 bg-linear-to-br from-[#0B0E1A] via-[#151B2E] to-[#0B0E1A] text-white overflow-hidden relative">
            {/* Decorative patterns */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A536]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E6C35C]/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="main-container relative z-10">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-[#E6C35C] font-bold tracking-widest uppercase text-sm block mb-4">Why AZAN-E-MADINA</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                            The Preferred Choice for <br /> Modern Travelers
                        </h2>
                        <p className="text-gray-300 text-lg">
                            We combine years of industry expertise with a personalized approach to ensure every journey is perfect. Our commitment to excellence sets us apart.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <div className="w-20 h-20 border-2 border-white/20 rounded-full flex items-center justify-center animate-bounce">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-8 bg-white/5 border-2 border-white/10 rounded-3xl hover:bg-white hover:text-[#0B0E1A] transition-all duration-500 cursor-default shadow-xl hover:shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-linear-to-br from-[#C9A536] to-[#A68A2E] group-hover:bg-linear-to-br group-hover:from-[#A68A2E] group-hover:to-[#C9A536] text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 shadow-lg shadow-[#C9A536]/30">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-gray-400 group-hover:text-[#545454] transition-colors duration-500">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-16 border-t-2 border-white/10">
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#E6C35C]">50k+</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Happy Clients</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#E6C35C]">120+</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Destinations</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#E6C35C]">15</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Years Experience</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#E6C35C]">24/7</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Support</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
