import { usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import NavMainAirweslik from '@/components/nav-main-airweslik';
import NavMainBumdes from '@/components/nav-main-bumdes';
import NavMainBuper from '@/components/nav-main-buper';
import NavMainInterdesa from '@/components/nav-main-interdesa';
import NavMainMiniSoc from '@/components/nav-main-minisoc';
import NavMainSewaKios from '@/components/nav-main-sewakios';

export default function AppSidebarLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage<{ unit_id?: number; auth?: { user?: { name: string; roles: string; image?: string } } }>();
    const unitId = Number(props.unit_id ?? 0);
    const user = props.auth?.user;
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    const getNavComponent = () => {
        switch (unitId) {
            case 1:
                return <NavMainMiniSoc />;
            case 2:
                return <NavMainBuper />;
            case 3:
                return <NavMainSewaKios />;
            case 4:
                return <NavMainAirweslik />;
            case 5:
                return <NavMainInterdesa />;
            default:
                return <NavMainBumdes />;
        }
    };

    const unitName = (() => {
        switch (unitId) {
            case 1:
                return 'Mini Soccer';
            case 2:
                return 'Bumi Perkemahan';
            case 3:
                return 'Kios';
            case 4:
                return 'Air Weslik';
            case 5:
                return 'Internet Desa';
            default:
                return ''; // Kepala Desa tidak punya unit
        }
    })();

    const roleFormatted = user?.roles
        ?.split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-30 w-64 transform border-r bg-white transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-20 items-center justify-center border-b px-4">
                    <img src="/assets/images/Bumdes Logo.png" className="h-10" alt="Logo Bumdes" />
                    <img src="/assets/images/SumberJaya Logo.png" className="h-10" alt="Logo Sumber Jaya" />
                </div>
                {getNavComponent()}
            </aside>

            {/* Main Content */}
            <div className={`flex flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <header className="flex h-20 items-center justify-between border-b bg-white px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="bg-opacity-60 hover:bg-opacity-100 relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 text-black transition-all duration-200"
                            title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
                        >
                            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            <span className="absolute inset-0 rounded-xl bg-black/10 opacity-0 transition-opacity duration-200 hover:opacity-100" />
                        </button>

                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Dashboard {roleFormatted ? `- ${roleFormatted}` : ''}</h1>
                            {unitName && <p className="text-sm text-gray-500">Selamat datang, Pengelola Unit Usaha {unitName}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <img
                            src={user?.image || '/assets/images/avatar.png'}
                            alt="User Avatar"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                        />
                        <div className="text-right">
                            <p className="text-sm font-semibold text-black">{user?.name}</p>
                            <p className="text-xs text-gray-600">{roleFormatted}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-100 p-6">{children}</main>
            </div>
        </div>
    );
}
