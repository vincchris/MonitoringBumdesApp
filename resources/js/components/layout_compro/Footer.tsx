import { Link } from '@inertiajs/react';
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Tentang Kami', href: '/profil' },
        { name: 'Unit Usaha', href: '/unit-usaha' },
        { name: 'Berita & Kegiatan', href: '/berita' },
        { name: 'Galeri', href: '/galeri' },
        { name: 'Laporan Keuangan', href: '/laporan-transparansi' },
        { name: 'Kontak', href: '/kontak' },
    ];

    const unitUsaha = [
        { name: 'Mini Soccer', href: '/unit-usaha/mini-soccer' },
        { name: 'Balai Pertemuan', href: '/unit-usaha/balai-pertemuan' },
        { name: 'Kios Usaha', href: '/unit-usaha/kios-usaha' },
        { name: 'Air Bersih (PDAM)', href: '/unit-usaha/air-bersih' },
        { name: 'Internet Desa', href: '/unit-usaha/internet-desa' },
    ];

    const socialLinks = [
        { name: 'Facebook', href: '#', icon: Facebook },
        { name: 'Instagram', href: '#', icon: Instagram },
        { name: 'YouTube', href: '#', icon: Youtube },
        { name: 'WhatsApp', href: 'https://wa.me/6281234567890', icon: MessageCircle },
    ];

    return (
        <footer className="bg-gray-900 text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Company Info */}
                    <div className="lg:col-span-1">
                        <div className="mb-4 flex items-center space-x-3">
                            <Link href="#" className="flex items-center space-x-3">
                                <div className="flex h-12 items-center space-x-4">
                                    {/* Logo Bumdes */}
                                    <div className="flex h-full flex-shrink-0 items-center">
                                        <img
                                            src="/assets/images/Bumdes Logo.png"
                                            alt="Logo Bumdes"
                                            height={48} // pas dengan navbar
                                            style={{ width: 'auto', maxHeight: '100%' }}
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* Logo SumberJaya */}
                                    <div className="flex h-full flex-shrink-0 items-center">
                                        <img
                                            src="/assets/images/SumberJaya Logo.png"
                                            alt="Logo SumberJaya"
                                            height={48} // samain tinggi supaya balance
                                            style={{ width: 'auto', maxHeight: '100%' }}
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <p className="mb-6 text-sm leading-relaxed text-gray-300">
                            Badan Usaha Milik Desa yang berkomitmen membangun ekonomi desa melalui berbagai unit usaha dan layanan untuk kesejahteraan
                            masyarakat.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map(({ name, href, icon: Icon }) => (
                                <a
                                    key={name}
                                    href={href}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-blue-600"
                                    title={name}
                                >
                                    <Icon className="h-5 w-5 text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Menu Utama</h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-gray-300 transition-colors hover:text-white">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Unit Usaha */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Unit Usaha</h3>
                        <ul className="space-y-3">
                            {unitUsaha.map((unit) => (
                                <li key={unit.name}>
                                    <Link href={unit.href} className="text-sm text-gray-300 transition-colors hover:text-white">
                                        {unit.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Kontak Kami</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="mt-0.5 h-5 w-5 text-blue-400" />
                                <p className="text-sm text-gray-300">
                                    Kantor Desa Bagja waluya
                                    <br />
                                    Kecamatan Bagja waluya
                                    <br />
                                    Kabupaten Ciamis, Jawa Barat
                                </p>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-blue-400" />
                                <p className="text-sm text-gray-300">+62 812-3456-7890</p>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-blue-400" />
                                <p className="text-sm text-gray-300">info@Bagja waluya.id</p>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Clock className="mt-0.5 h-5 w-5 text-blue-400" />
                                <p className="text-sm text-gray-300">
                                    Senin - Jumat: 08:00 - 16:00
                                    <br />
                                    Sabtu: 08:00 - 12:00
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                        <div className="text-sm text-gray-400">© {currentYear} Bagja waluya. Hak Cipta Dilindungi.</div>
                        <div className="flex space-x-6 text-sm">
                            <Link href="/privacy-policy" className="text-gray-400 transition-colors hover:text-white">
                                Kebijakan Privasi
                            </Link>
                            <Link href="/terms-of-service" className="text-gray-400 transition-colors hover:text-white">
                                Syarat & Ketentuan
                            </Link>
                            <Link href="/sitemap" className="text-gray-400 transition-colors hover:text-white">
                                Peta Situs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;