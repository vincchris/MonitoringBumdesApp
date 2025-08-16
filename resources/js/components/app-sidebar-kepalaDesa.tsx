import { NavFooter } from '@/components/nav-footer';
import NavMainKepalaDesa from '@/components/nav-main-kepala-desa';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowDown, BookOpenCheck, LayoutGrid, LogOut, Volleyball } from 'lucide-react';
import AppLogo from './app-logo';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard-KepalaDesa',
        icon: LayoutGrid,
    },
    {
        title: 'User',
        href: '/user',
        icon: LayoutGrid,
    },
    {
        title: 'Unit Usaha Mini Soc',
        href: '/MiniSoccer',
        icon: Volleyball,
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
        title: 'Keluar',
        href: '/Login',
        icon: LogOut,
    },
];

const footerNavItems: NavItem[] = [];

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
                <NavMainKepalaDesa />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
