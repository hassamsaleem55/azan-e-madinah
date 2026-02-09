import { Link } from 'react-router-dom';
import {
    MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin,
    ChevronRight, Globe, Shield
} from 'lucide-react';
import logo from '../../assets/images/azan-e-madinah-logo.png';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
        { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
        { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
        { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
    ];

    const footerLinks = {
        company: [
            { label: "About Us", href: "#" },
            { label: "Our Services", href: "#" },
            { label: "Destinations", href: "#" },
            { label: "Latest News", href: "#" },
        ],
        support: [
            { label: "Help Center", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "Privacy Policy", href: "#" },
            { label: "Contact Support", href: "#" },
        ]
    };

    return (
        <footer className="bg-gradient-to-b from-[#0B0E1A] via-[#151B2E] to-[#0B0E1A] border-t-2 border-[#C9A536]/30 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Brand & Contact Column (Width: 5/12) */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="h-13 w-13 rounded-xl shadow-xl shadow-[#C9A536]/40 group-hover:shadow-2xl group-hover:shadow-[#C9A536]/50 transition-all">
                                <img src={logo} alt="AZAN-E-MADINA Travel" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-extrabold tracking-tight text-[#E6C35C] leading-none">AZAN-E-MADINA</span>
                                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C9A536] mt-1">Your Journey, Guided with Faith</span>
                            </div>
                        </Link>

                        <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
                            Your trusted partner for faith-based travel experiences. From Umrah packages to global destinations, we handle every detail with care and devotion.
                        </p>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-3 group">
                                <div className="p-2.5 bg-gradient-to-br from-[#C9A536]/20 to-[#A68A2E]/20 text-[#E6C35C] rounded-full mt-0.5 group-hover:bg-gradient-to-br group-hover:from-[#C9A536] group-hover:to-[#E6C35C] group-hover:text-[#0B0E1A] group-hover:shadow-lg group-hover:shadow-[#C9A536]/50 transition-all border border-[#C9A536]/30">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm text-gray-300 leading-relaxed group-hover:text-[#E6C35C] transition-colors">
                                    Sultan Plaza, First Floor, Near Habbits,<br />
                                    East Canal Road, Faisalabad
                                </span>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2.5 bg-gradient-to-br from-[#C9A536]/20 to-[#A68A2E]/20 text-[#E6C35C] rounded-full group-hover:bg-gradient-to-br group-hover:from-[#C9A536] group-hover:to-[#E6C35C] group-hover:text-[#0B0E1A] group-hover:shadow-lg group-hover:shadow-[#C9A536]/50 transition-all border border-[#C9A536]/30">
                                    <Phone size={16} />
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-[#E6C35C] transition-colors font-semibold">
                                    0324 7271544
                                </span>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2.5 bg-gradient-to-br from-[#C9A536]/20 to-[#A68A2E]/20 text-[#E6C35C] rounded-full group-hover:bg-gradient-to-br group-hover:from-[#C9A536] group-hover:to-[#E6C35C] group-hover:text-[#0B0E1A] group-hover:shadow-lg group-hover:shadow-[#C9A536]/50 transition-all border border-[#C9A536]/30">
                                    <Mail size={16} />
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-[#E6C35C] transition-colors">
                                    arslanaslam9797@gmail.com
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 md:col-span-1">
                        <h4 className="text-[#E6C35C] font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Globe size={16} className="text-[#C9A536]" /> Company
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm text-gray-400 hover:text-[#E6C35C] hover:translate-x-2 transition-all flex items-center gap-2 group">
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#C9A536]" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 md:col-span-1">
                        <h4 className="text-[#E6C35C] font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Shield size={16} className="text-[#C9A536]" /> Support
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm text-gray-400 hover:text-[#E6C35C] hover:translate-x-2 transition-all flex items-center gap-2 group">
                                        <ChevronRight size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Column (Width: 3/12) */}
                    <div className="lg:col-span-3">
                        <h4 className="text-[#E6C35C] font-bold text-sm uppercase tracking-wider mb-6">Connect With Us</h4>
                        <p className="text-sm text-gray-400 mb-4">
                            Follow us on social media for exclusive travel deals and updates.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className="w-11 h-11 rounded-full border-2 border-[#C9A536]/40 flex items-center justify-center text-[#C9A536] hover:bg-gradient-to-br hover:from-[#C9A536] hover:to-[#E6C35C] hover:text-[#0B0E1A] hover:border-[#E6C35C] transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C9A536]/50"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t-2 border-[#C9A536]/30">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <p className="text-xs text-gray-400">
                            © {currentYear} <span className="font-bold text-[#E6C35C]">AZAN-E-MADINA Travel</span>. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-500">
                            Developed by <a href="https://nexagensolution.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C9A536] hover:text-[#E6C35C] transition-colors">Nexagen Solutions</a>
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-xs text-gray-500 hover:text-[#C9A536] transition-colors">Privacy Policy</a>
                            <a href="#" className="text-xs text-gray-500 hover:text-[#C9A536] transition-colors">Terms & Conditions</a>
                            <a href="#" className="text-xs text-gray-500 hover:text-[#C9A536] transition-colors">Sitemap</a>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};