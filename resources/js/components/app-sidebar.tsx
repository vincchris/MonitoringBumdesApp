import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main-minisoc';
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
        title: 'Pemasukan',
        href: '/PemasukanMiniSoc',
        icon: ArrowUp,
    },
    {
        title: 'Pengeluaran',
        href: '/PemasukanMiniSoc',
        icon: ArrowDown,
    },
    {
        title: 'Kelola Laporan',
        href: '/kelolaLaporan',
        icon: BookOpenCheck,
    },
    {
        title: 'Keluar',
        href: '/kelolaLaporan',
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
