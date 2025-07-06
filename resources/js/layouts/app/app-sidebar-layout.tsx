import NavMainBuper from '@/components/nav-main-buper';
import NavMainMiniSoc from '@/components/nav-main-minisoc';
import { usePage } from '@inertiajs/react';
// Import nav components lainnya sesuai kebutuhan
import NavMainSewaKios from '@/components/nav-main-sewakios';
import NavMainAirweslik from '@/components/nav-main-airweslik';
import NavMainInterdesa from '@/components/nav-main-interdesa';
import NavMainBumdes from '@/components/nav-main-bumdes';


export default function AppSidebarLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage<{ unit_id: number }>();
    const unitId = Number(props.unit_id);

    // Pilih komponen navigasi berdasarkan unit_id
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
            case 6:
                return <NavMainBumdes />;
            default:
                console.warn('Unknown unit_id:', unitId, 'fallback to MiniSoc nav');
                return <NavMainMiniSoc />;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside key={unitId} className="w-64 border-r bg-white">
                {/* Logo */}
                <div className="flex h-20 items-center justify-center border-b">
                    <img src="/assets/images/Bumdes Logo.png" className="h-10" alt="Logo" />
                    <img src="/assets/images/SumberJaya Logo.png" className="h-10" alt="Logo" />
                </div>

                {/* Dynamic Navigation based on unit_id */}
                {getNavComponent()}
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-100 p-6">{children}</main>
        </div>
    );
}
