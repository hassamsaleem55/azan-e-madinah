// import React from 'react'
// import { BiSolidPlane } from "react-icons/bi";
// import { FaGlobe } from "react-icons/fa";
// import { GiFalconMoon } from "react-icons/gi";
// import { LuHotel } from "react-icons/lu";

// export default function ChooseUsSection() {
//     return (
//         <section className='main-container py-18 sm:py-24'>
//             <div className='flex flex-col items-center'>
//                 <h3 className='text-center text-[#003366] font-semibold!'>WHY CHOOSE US?</h3>
//                 <div className='flex justify-center mt-2 mb-6'>
//                     <div className='relative w-fit'>
//                         <h2 className='relative text-center text-[#003366] text-3xl sm:text-4xl md:text-5xl z-1'>Why Choose Rihla Access</h2>
//                         <div className='absolute bottom-0 left-0 w-full h-[35%] bg-[#d6d30b]/50 rounded-md z-0'></div>
//                     </div>
//                 </div>
//                 <p className='w-full max-w-5xl sm:text-lg text-center text-neutral-600'>We are a trusted travel agency providing comprehensive services including airline group tickets, visa assistance, Umrah packages, and hotel bookings. Here’s why travelers prefer us:</p>
//             </div>

//             <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12'>
//                 <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#003366]/5 border border-[#003366] rounded-3xl overflow-hidden'>
//                     <div className='bg-[#003366] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
//                         <BiSolidPlane className='text-5xl text-[#d6d30b] rotate-90' />
//                     </div>

//                     <h2 className='text-2xl text-[#003366] mt-3 mb-4'>Airline Tickets</h2>
//                     <p className='text-center text-neutral-600'>Get instant access to worldwide destinations with competitive pricing and 24/7 booking support for a hassle-free journey.</p>

//                     <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
//                 </div>
//                 <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#003366]/5 border border-[#003366] rounded-3xl overflow-hidden'>
//                     <div className='bg-[#003366] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
//                         <FaGlobe className='text-5xl text-[#d6d30b]' />
//                     </div>

//                     <h2 className='text-2xl text-[#003366] mt-3 mb-4'>Visa Services</h2>
//                     <p className='text-center text-neutral-600'>Simplify your travel with our high-success visa processing. We handle the paperwork so you can focus on your trip.</p>

//                     <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
//                 </div>
//                 <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#003366]/5 border border-[#003366] rounded-3xl overflow-hidden'>
//                     <div className='bg-[#003366] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
//                         <GiFalconMoon className='text-5xl text-[#d6d30b]' />
//                     </div>

//                     <h2 className='text-2xl text-[#003366] mt-3 mb-4'>Umrah Packages</h2>
//                     <p className='text-center text-neutral-600'>All-inclusive, spiritually-focused packages featuring premium locations and seamless logistics for a peaceful pilgrimage.</p>

//                     <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
//                 </div>
//                 <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#003366]/5 border border-[#003366] rounded-3xl overflow-hidden'>
//                     <div className='bg-[#003366] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
//                         <LuHotel className='text-5xl text-[#d6d30b]' />
//                     </div>

//                     <h2 className='text-2xl text-[#003366] mt-3 mb-4'>Hotel Booking</h2>
//                     <p className='text-center text-neutral-600'>From luxury resorts to budget-friendly rooms, we offer vetted accommodations at exclusive rates across the globe.</p>

//                     <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
//                 </div>
//             </div>
//         </section>
//     )
// }


import React from 'react';
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
        <section className="py-24 bg-[#003366] text-white overflow-hidden relative">
            {/* Decorative patterns */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00AEEF]/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="main-container relative z-10">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-[#00AEEF] font-bold tracking-widest uppercase text-sm block mb-4">Why Rihla Access</span>
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
                            className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white hover:text-[#003366] transition-all duration-500 cursor-default shadow-xl"
                        >
                            <div className="w-16 h-16 bg-[#00AEEF] group-hover:bg-[#003366] text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-16 border-t border-white/10">
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#00AEEF]">50k+</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Happy Clients</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#00AEEF]">120+</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Destinations</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#00AEEF]">15</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Years Experience</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-4xl font-extrabold mb-2 text-[#00AEEF]">24/7</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Support</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
