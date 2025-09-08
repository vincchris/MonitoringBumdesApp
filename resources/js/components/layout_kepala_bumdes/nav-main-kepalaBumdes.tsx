import { Link, router, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { Droplet, LayoutDashboard, LogOut, Wifi } from 'lucide-react';

const NavLink = ({ href, icon: Icon, label }: any) => {
    const { url } = usePage();

    const isActive = url.startsWith(href);

    return (
        <Link
            href={href}
            className={clsx(
                'flex items-center gap-3 rounded-lg px-4 py-2 transition-all',
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100',
            )}
        >
            <Icon size={18} />
            <span>{label}</span>
        </Link>
    );
};

export default function NavMainKepalaBumdes() {
    const { props } = usePage<{ unit_id: number }>();
    const unitId = props.unit_id;

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <nav className="space-y-6 p-4">
            <div className="space-y-2">
                <NavLink href={`/dashboard-kepalaBumdes`} icon={LayoutDashboard} label="Dashboard" />
            </div>

            <div>
                <div className="px-4 text-xs text-gray-500 uppercase">Unit Usaha</div>
                <div className="mt-2 space-y-2">
                    <NavLink href={`/InterDesa`} icon={Wifi} label="Internet Desa" />
                </div>
            </div>

            <div>
                <div className="px-4 text-xs text-gray-500 uppercase">Keluar</div>
                <div className="mt-2 space-y-2">
                    <form onSubmit={handleLogout}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                        >
                            <LogOut size={18} />
                            <span>Keluar</span>
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
