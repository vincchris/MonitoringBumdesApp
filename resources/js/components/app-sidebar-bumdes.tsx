import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main-bumdes';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, ArrowDown, ArrowUp, BookOpenCheck, LogOut } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Unit Usaha Mini Soc',
        href: '/MiniSoccer',
        icon: ArrowUp,
    },
    {
        title: 'Unit Usaha Bumi Perkemahan',
        href: '/Buper',
        icon: ArrowDown,
    },
    {
        title: 'Unit Usaha Kios',
        href: '/Kios',
        icon: BookOpenCheck,
    },
    {
        title: 'Unit Usaha Air Weslik',
        href: '/Airweslik',
        icon: BookOpenCheck,
    },
    {
        title: 'Unit Usaha Internet Desa',
        href: '/InternetDesa',
        icon: BookOpenCheck,
    },
    {
        title: 'Keluar',
        href: '/Login',
        icon: LogOut,
    },
];

const footerNavItems: NavItem[] = [
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
