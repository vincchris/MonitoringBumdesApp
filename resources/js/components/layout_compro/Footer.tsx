import { Link, usePage } from '@inertiajs/react';
import { Clock, Facebook, Instagram, LucideIcon, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import React from 'react';

interface FooterLink {
    name: string;
    href: string;
}
interface SocialLink {
    name: string;
    href: string;
    icon: LucideIcon;
}
interface ContactItem {
    name: string;
    value: string;
    href: string;
    icon: LucideIcon;
}

interface LogoData {
    logo_desa: string | null;
    logo_bumdes: string | null;
}

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    // Get logos from Inertia shared data
    let logos: LogoData | null = null;
    try {
        const pageData = usePage<{ logos?: LogoData }>().props;
        logos = pageData.logos || null;
    } catch (error) {
        console.error('Error accessing logos data in Footer:', error);
    }

    const quickLinks: FooterLink[] = [
        { name: 'Tentang Kami', href: '/profil/tentang-kami' },
        { name: 'Unit Usaha', href: '/unit-usaha' },
        { name: 'Legalitas', href: '/profil/dokumen-legalitas' },
        { name: 'Laporan Keuangan', href: '/laporan-transparansi' },
        { name: 'Kontak', href: '/kontak' },
    ];

    const unitUsaha: FooterLink[] = [
        { name: 'Mini Soccer', href: '/unit-usaha' },
        { name: 'Bumi perkemahan', href: '/unit-usaha' },
        { name: 'Kios Usaha', href: '/unit-usaha' },
        { name: 'Air Bersih (PDAM)', href: '/unit-usaha' },
        { name: 'Internet Desa', href: '/unit-usaha' },
    ];

    const socialLinks: SocialLink[] = [
        { name: 'Facebook', href: '#', icon: Facebook },
        { name: 'Instagram', href: '#', icon: Instagram },
        { name: 'YouTube', href: '#', icon: Youtube },
        { name: 'WhatsApp', href: 'https://wa.me/6281324030282', icon: MessageCircle },
    ];

    const contactInfo: ContactItem[] = [
        {
            name: 'Alamat',
            value: 'Jl. Raya Cihaurbeuti No. 440, Desa Sumberjaya, Ciamis',
            href: 'https://maps.google.com/?q=Jl.Raya+Cihaurbeuti+No.+440+Desa+Sumberjaya+Kecamatan+Cihaurbeuti+Kabupaten+Ciamis',
            icon: MapPin,
        },
        {
            name: 'Telepon',
            value: '081324030282',
            href: 'https://wa.me/6281324030282',
            icon: Phone,
        },
        {
            name: 'Email',
            value: 'bmdsbagjawaluya21@gmail.com',
            href: 'mailto:bmdsbagjawaluya21@gmail.com',
            icon: Mail,
        },
        {
            name: 'Jam Operasional',
            value: 'Senin - Jumat: 08:00 - 14:00',
            href: '#',
            icon: Clock,
        },
    ];

    const footerConfig = {
        owner: 'Desa Sumber Jaya, BUMDes Bagja Waluya',
        copyright: 'Hak Cipta Dilindungi.',
    };

    const supportImgs = [
        { src: '/assets/images/logobima.png', alt: 'Logo Bima' },
        { src: '/assets/images/logo-kemendiktisaintek.png', alt: 'Logo Kemendiktisaintek' },
        { src: '/assets/images/Logo UBSI.png', alt: 'Logo Ubsi' },
    ];

    // Handle image loading error with fallback
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.currentTarget;
        const isDesaLogo = img.alt.includes('Desa') || img.alt.includes('SumberJaya');

        // Set fallback image based on logo type
        if (isDesaLogo) {
            img.src = '/assets/images/SumberJaya Logo.png';
        } else {
            img.src = '/assets/images/Bumdes Logo.png';
        }

        // Prevent infinite error loop
        img.onerror = null;
    };

    return (
        <footer className="bg-white text-gray-900 border-t border-gray-200">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {/* Company Info */}
                    <div>
                        <Link href="#" className="mb-4 flex items-center space-x-3">
                            {/* Logo Bumdes - Dynamic */}
                            <img
                                src={logos?.logo_bumdes || '/assets/images/Bumdes Logo.png'}
                                alt="Logo Bumdes"
                                className="h-12 w-auto object-contain"
                                onError={handleImageError}
                            />
                            {/* Logo Desa - Dynamic */}
                            <img
                                src={logos?.logo_desa || '/assets/images/SumberJaya Logo.png'}
                                alt="Logo Desa SumberJaya"
                                className="h-12 w-auto object-contain"
                                onError={handleImageError}
                            />
                        </Link>
                        <p className="mb-6 text-sm leading-relaxed text-gray-600">
                            BUMDes yang berkomitmen membangun ekonomi desa melalui berbagai unit usaha untuk kesejahteraan masyarakat.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map(({ name, href, icon: Icon }) => (
                                <a
                                    key={name}
                                    href={href}
                                    title={name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition hover:bg-blue-600 hover:text-white"
                                    aria-label={name}
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Menu Utama</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-gray-600 transition hover:text-blue-600">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Unit Usaha */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Unit Usaha</h3>
                        <ul className="space-y-2">
                            {unitUsaha.map((unit) => (
                                <li key={unit.name}>
                                    <Link href={unit.href} className="text-sm text-gray-600 transition hover:text-blue-600">
                                        {unit.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Kontak Kami</h3>
                        <ul className="space-y-4">
                            {contactInfo.map(({ name, value, href, icon: Icon }) => (
                                <li key={name}>
                                    <a
                                        href={href}
                                        target={href.startsWith('http') ? '_blank' : undefined}
                                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        className="flex items-center space-x-3 text-gray-600 transition hover:text-blue-600"
                                    >
                                        <Icon className="h-5 w-5 text-blue-500" />
                                        <span className="text-sm">{value}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-200">
                <div className="mx-auto max-w-7xl px-4 py-6 text-center">
                    <p className="text-sm text-gray-500">
                        © {currentYear} {footerConfig.owner}. {footerConfig.copyright}
                    </p>
                    <div className="mt-4 flex justify-center gap-6">
                        {supportImgs.map((img) => (
                            <div key={img.src} className="flex h-20 w-20 items-center justify-center">
                                <img src={img.src} alt={img.alt} className="max-h-full max-w-full object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;