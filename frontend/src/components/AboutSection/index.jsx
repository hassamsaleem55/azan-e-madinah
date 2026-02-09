import { BsArrowRight } from 'react-icons/bs';
import aboutUsImg from '../../assets/images/about-us.avif';

export default function AboutSection() {
    return (
        <section id="about" className="relative overflow-hidden bg-gray-50">
            <div className="relative main-container flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 py-20 md:py-32 z-10">

                {/* Left: Image with brand styling */}
                <div className="group relative w-full lg:w-1/2">
                    <div className="relative z-10 overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                        <img
                            src={aboutUsImg}
                            alt="Professional Travel Planning"
                            className="w-full h-100 md:h-137.5 object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#C9A536]/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8">
                            <h3 className="text-3xl text-white font-bold">15+ Years Excellence</h3>
                        </div>
                    </div>
                    {/* Decorative shapes using brand colors */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#C9A536]/5 rounded-full -z-10"></div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gray-200 rounded-full -z-10"></div>
                </div>

                {/* Right: Content */}
                <div className="w-full lg:w-1/2">
                    <div className="inline-block px-4 py-1 bg-[#C9A536]/10 text-[#C9A536] font-bold text-sm tracking-widest uppercase rounded-full mb-6">
                        Our Legacy
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B0E1A] leading-tight mb-8">
                        Trusted Partners for Your <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#C9A536] to-[#A68A2E]">Next Adventure</span>
                    </h2>

                    <p className="text-[#545454] text-lg mb-8 leading-relaxed">
                        If you are looking for a dependable and professional travel partner, AZAN-E-MADINA Travel is your premier choice. With years of industry expertise, we have built a reputation for excellence and integrity in every journey we plan.
                    </p>

                    <div className="space-y-6">
                        <div className="flex gap-4 p-4 rounded-xl bg-white border-l-4 border-[#C9A536] shadow-sm">
                            <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#C9A536]/5 rounded-lg">
                                <svg className="w-6 h-6 text-[#C9A536]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-[#0B0E1A] font-bold text-lg">Expert Travel Solutions</h4>
                                <p className="text-sm text-[#545454]">Our experienced team ensures smooth bookings, route planning, and exclusive deals.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-white border-l-4 border-[#545454] shadow-sm">
                            <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                                <svg className="w-6 h-6 text-[#545454]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-[#0B0E1A] font-bold text-lg">Personalized Support</h4>
                                <p className="text-sm text-[#545454]">We focus on individual customer needs, providing one-on-one assistance always.</p>
                            </div>
                        </div>
                    </div>

                    <button className="group mt-10 flex items-center gap-3 bg-linear-to-r from-[#C9A536] to-[#A68A2E] text-white px-8 py-4 rounded-full font-bold hover:from-[#A68A2E] hover:to-[#C9A536] transition-all shadow-xl hover:shadow-2xl shadow-[#C9A536]/30">
                        Discover More
                        <BsArrowRight className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>

            {/* Background decorations */}
            <img src="https://www.transparenttextures.com/patterns/cubes.png" className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none" alt="" />
        </section>
    );
};
