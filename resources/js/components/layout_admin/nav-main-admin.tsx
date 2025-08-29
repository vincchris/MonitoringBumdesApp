import { Link, router, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { Building, FileText, FolderOpen, Home, LayoutDashboard, LogOut, UserCog, Users } from 'lucide-react';

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

export default function NavMainAdmin() {
    const { props } = usePage<{ unit_id: number }>();

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <nav className="space-y-6 p-4">
            <div className="space-y-2">
                <NavLink href={`/dashboard-admin`} icon={LayoutDashboard} label="Dashboard" />
            </div>

            <div>
                <div className="px-4 text-xs text-gray-500 uppercase">Profil BUMDes</div>
                <div className="mt-2 space-y-2">
                    <NavLink href={`/profil/data-umum`} icon={Home} label="Data Umum" />
                    <NavLink href={`/profil/sekretariat`} icon={Building} label="Sekretariat" />
                    <NavLink href={`/profil/tentang`} icon={FileText} label="Tentang BUMDes" />
                    <NavLink href={`/profil/pengurus-bumdes`} icon={Users} label="Pengurus BUMDes" />
                    <NavLink href={`/profil/legalitas`} icon={FolderOpen} label="Dokumen Legalitas" />
                </div>
            </div>

            <div>
                <div className="px-4 text-xs text-gray-500 uppercase">Pengaturan Akun</div>
                <div className="mt-2 space-y-2">
                    <NavLink href={`/akun/edit`} icon={UserCog} label="Edit Akun Admin" />
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
