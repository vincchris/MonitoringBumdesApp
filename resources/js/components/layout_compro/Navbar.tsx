import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronDown, Menu, X } from 'lucide-react'; // Ubah ke Lucide
import React, { useEffect, useState } from 'react';

interface MenuItem {
    name: string;
    href: string;
    submenu?: MenuItem[];
}

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems: MenuItem[] = [
        { name: 'Beranda', href: '#' },
        {
            name: 'Profil',
            href: '/profil',
            submenu: [
                { name: 'Tentang Kami', href: '/profil' },
                { name: 'Visi & Misi', href: '/profil/visi-misi' },
                { name: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
                { name: 'Legalitas', href: '/profil/legalitas' },
            ],
        },
        { name: 'Unit Usaha', href: '/unit-usaha' },
        { name: 'Galeri', href: '/galeri' },
        { name: 'Laporan & Transparansi', href: '/laporan-transparansi' },
        { name: 'Kontak', href: '/kontak' },
    ];

    const toggleDropdown = (index: number) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="#" className="flex items-center space-x-3">
                        <div className="flex h-12 items-center space-x-4">
                            {/* Logo Bumdes */}
                            <div className="flex h-full flex-shrink-0 items-center">
                                <img
                                    src="/assets/images/Bumdes Logo.png"
                                    alt="Logo Bumdes"
                                    height={48}
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

                    <div className="hidden items-center space-x-1 lg:flex">
                        {menuItems.map((item, index) => (
                            <div key={item.name} className="relative">
                                {item.submenu ? (
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setActiveDropdown(index)}
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                            {item.name}
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        </button>

                                        {activeDropdown === index && (
                                            <div className="absolute top-full left-0 mt-1 w-56 rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                                                {item.submenu.map((subItem) => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="hidden lg:block">
                        <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" size="default" onClick={() => setIsOpen(false)}>
                            <Link href="/Login">Login</Link>
                        </Button>
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600 lg:hidden"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-gray-200 bg-white lg:hidden">
                    <div className="space-y-2 px-4 py-4">
                        {menuItems.map((item, index) => (
                            <div key={item.name}>
                                {item.submenu ? (
                                    <div>
                                        <button
                                            onClick={() => toggleDropdown(index)}
                                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                                        >
                                            {item.name}
                                            <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} />
                                        </button>
                                        {activeDropdown === index && (
                                            <div className="mt-2 ml-4 space-y-1">
                                                {item.submenu.map((subItem) => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className="block rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                        <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" size="default" onClick={() => setIsOpen(false)}>
                            <Link href="#">Login</Link>
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;