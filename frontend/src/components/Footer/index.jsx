import { Link } from 'react-router-dom';
import {
    MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin,
    ChevronRight, Globe, Shield
} from 'lucide-react';
import logo from '../../assets/images/rihla_logo.png';

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
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Brand & Contact Column (Width: 5/12) */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="bg-[#003366] p-1.5 rounded-lg">
                                <img src={logo} alt="Rihla Access" className="w-10 h-10 object-contain bg-white rounded" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold tracking-tight text-[#003366] leading-none">RIHLA ACCESS</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mt-1">Simplifying Global Travel</span>
                            </div>
                        </Link>

                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                            Your trusted partner for seamless global travel. From visa assistance to luxury accommodation, we handle the details so you can enjoy the journey.
                        </p>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-3 group">
                                <div className="p-2 bg-blue-50 text-[#003366] rounded-full mt-0.5 group-hover:bg-[#003366] group-hover:text-white transition-colors">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm text-gray-600 leading-relaxed group-hover:text-[#003366] transition-colors">
                                    Sultan Plaza, First Floor, Near Habbits,<br />
                                    East Canal Road, Faisalabad
                                </span>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-blue-50 text-[#003366] rounded-full group-hover:bg-[#003366] group-hover:text-white transition-colors">
                                    <Phone size={16} />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-[#003366] transition-colors font-medium">
                                    0324 7271544
                                </span>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-blue-50 text-[#003366] rounded-full group-hover:bg-[#003366] group-hover:text-white transition-colors">
                                    <Mail size={16} />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-[#003366] transition-colors">
                                    arslanaslam9797@gmail.com
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 md:col-span-1">
                        <h4 className="text-[#003366] font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Globe size={16} /> Company
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm text-gray-500 hover:text-[#003366] hover:translate-x-1 transition-all flex items-center gap-2">
                                        <ChevronRight size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 md:col-span-1">
                        <h4 className="text-[#003366] font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Shield size={16} /> Support
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm text-gray-500 hover:text-[#003366] hover:translate-x-1 transition-all flex items-center gap-2">
                                        <ChevronRight size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Column (Width: 3/12) */}
                    <div className="lg:col-span-3">
                        <h4 className="text-[#003366] font-bold text-sm uppercase tracking-wider mb-6">Connect With Us</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            Follow us on social media for exclusive travel deals and updates.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all transform hover:-translate-y-1 shadow-sm"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <p className="text-xs text-gray-500">
                            © {currentYear} <span className="font-bold text-[#003366]">Rihla Access Travels</span>. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-400">
                            Developed by <a href="https://nexagensolution.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#003366] hover:text-blue-600 transition-colors">Nexagen Solutions</a>
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-xs text-gray-400 hover:text-[#003366]">Privacy Policy</a>
                            <a href="#" className="text-xs text-gray-400 hover:text-[#003366]">Terms & Conditions</a>
                            <a href="#" className="text-xs text-gray-400 hover:text-[#003366]">Sitemap</a>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};