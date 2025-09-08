import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, X } from 'lucide-react';
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

    // Get current URL from Inertia
    const { url } = usePage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    const menuItems: MenuItem[] = [
        { name: 'Beranda', href: '/Home' },
        {
            name: 'Profil',
            href: '/profil',
            submenu: [
                { name: 'Tentang Kami', href: '/profil/tentang-kami' },
                { name: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
                { name: 'Legalitas', href: '/profil/dokumen-legalitas' },
            ],
        },
        { name: 'Unit Usaha', href: '/unit-usaha' },
        // { name: 'Galeri', href: '/galeri' },
        { name: 'Laporan & Transparansi', href: '/laporan-transparansi' },
        { name: 'Kontak', href: '/kontak' },
    ];

    const toggleDropdown = (index: number) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    const closeMenu = () => {
        setIsOpen(false);
        setActiveDropdown(null);
    };

    // Check if current path matches menu item
    const isActive = (href: string): boolean => {
        if (href === '/') {
            return url === '/';
        }
        return url.startsWith(href);
    };

    // Check if any submenu item is active
    const hasActiveSubmenu = (submenu?: MenuItem[]): boolean => {
        if (!submenu) return false;
        return submenu.some((item) => isActive(item.href));
    };

    const getNavLinkClasses = (href: string, isSubmenu: boolean = false) => {
        const baseClasses = isSubmenu
            ? 'block px-4 py-2 text-sm transition-colors duration-200'
            : 'px-3 py-2 text-sm font-medium transition-colors duration-200';

        const activeClasses = isSubmenu ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600' : 'text-blue-600 font-semibold';

        const inactiveClasses = isSubmenu ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' : 'text-gray-700 hover:text-blue-600';

        return `${baseClasses} ${isActive(href) ? activeClasses : inactiveClasses}`;
    };

    const getMobileNavLinkClasses = (href: string, isSubmenu: boolean = false) => {
        const baseClasses = isSubmenu
            ? 'block rounded-md px-3 py-2 text-sm transition-colors duration-200'
            : 'block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200';

        const activeClasses = 'bg-blue-50 text-blue-600 font-semibold';
        const inactiveClasses = isSubmenu
            ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600';

        return `${baseClasses} ${isActive(href) ? activeClasses : inactiveClasses}`;
    };

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                isScrolled ? 'border-b border-gray-100 bg-white shadow-lg' : 'border-b border-gray-100/50 bg-white/95 backdrop-blur-sm'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center space-x-3 transition-opacity duration-200 hover:opacity-80">
                        <div className="flex h-10 items-center space-x-3 sm:h-12 sm:space-x-4">
                            {/* Logo Bumdes */}
                            <div className="flex h-full flex-shrink-0 items-center">
                                <img src="/assets/images/Bumdes Logo.png" alt="Logo Bumdes" className="h-full w-auto object-contain" />
                            </div>

                            {/* Logo SumberJaya */}
                            <div className="flex h-full flex-shrink-0 items-center">
                                <img src="/assets/images/SumberJaya Logo.png" alt="Logo SumberJaya" className="h-full w-auto object-contain" />
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden items-center space-x-1 xl:flex">
                        {menuItems.map((item, index) => (
                            <div key={item.name} className="relative">
                                {item.submenu ? (
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setActiveDropdown(index)}
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDropdown(index);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                                hasActiveSubmenu(item.submenu)
                                                    ? 'bg-blue-50 font-semibold text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                            }`}
                                        >
                                            {item.name}
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === index ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div
                                            className={`absolute top-full left-0 mt-1 w-64 rounded-lg border border-gray-100 bg-white py-2 shadow-lg transition-all duration-200 ${
                                                activeDropdown === index
                                                    ? 'visible translate-y-0 transform opacity-100'
                                                    : 'pointer-events-none invisible -translate-y-2 transform opacity-0'
                                            }`}
                                        >
                                            {item.submenu.map((subItem) => (
                                                <Link key={subItem.name} href={subItem.href} className={getNavLinkClasses(subItem.href, true)}>
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link href={item.href} className={getNavLinkClasses(item.href)}>
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Login Button - Desktop */}
                    <div className="hidden xl:block">
                        <Button
                            asChild
                            variant="default"
                            className="bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700"
                            size="default"
                        >
                            <Link href="/login">Dashboard</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600 xl:hidden"
                        aria-label="Toggle navigation menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`border-t border-gray-200 bg-white transition-all duration-300 xl:hidden ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                }`}
            >
                <div className="max-h-80 space-y-1 overflow-y-auto px-4 py-4">
                    {menuItems.map((item, index) => (
                        <div key={item.name}>
                            {item.submenu ? (
                                <div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDropdown(index);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                            hasActiveSubmenu(item.submenu)
                                                ? 'bg-blue-50 font-semibold text-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                        }`}
                                    >
                                        {item.name}
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === index ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <div
                                        className={`mt-1 ml-4 space-y-1 overflow-hidden transition-all duration-200 ${
                                            activeDropdown === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        {item.submenu.map((subItem) => (
                                            <Link
                                                key={subItem.name}
                                                href={subItem.href}
                                                className={getMobileNavLinkClasses(subItem.href, true)}
                                                onClick={closeMenu}
                                            >
                                                {subItem.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link href={item.href} className={getMobileNavLinkClasses(item.href)} onClick={closeMenu}>
                                    {item.name}
                                </Link>
                            )}
                        </div>
                    ))}

                    {/* Mobile Login Button */}
                    <div className="mt-4 border-t border-gray-200 pt-2">
                        <Button
                            asChild
                            variant="default"
                            className="w-full bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700"
                            size="default"
                        >
                            <Link href="/login" onClick={closeMenu}>
                                Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
