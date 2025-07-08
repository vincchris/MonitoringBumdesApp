import {
  LayoutDashboard,
  ArrowDownLeft,
  LogOut,
  Volleyball,
  User,
  Tent,
  MapPinHouse,
  Droplet,
  Wifi,
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import clsx from 'clsx';

const NavLink = ({ href, icon: Icon, label }: any) => {
  const { url } = usePage();

  const isActive = url.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-4 py-2 rounded-lg transition-all',
        isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

export default function NavMain() {
  const { props } = usePage<{ unit_id: number }>();
  const unitId = props.unit_id;

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/logout');
  };

  return (
    <nav className="p-4 space-y-6">
      <div className="space-y-2">
        <NavLink href={`/dashboard-KepalaBumdes`} icon={LayoutDashboard} label="Dashboard" />
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase px-4">User</div>
        <div className="mt-2 space-y-2">
          <NavLink href={`/user`} icon={User} label="User" />
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500 uppercase px-4">Unit Usaha</div>
        <div className="mt-2 space-y-2">
          <NavLink href={`/MiniSoccer`} icon={Volleyball} label="Mini Soccer" />
          <NavLink href={`/buper`} icon={Tent} label="Buper" />
          <NavLink href={`/kios`} icon={MapPinHouse} label="Kios" />
          <NavLink href={`/airweslik`} icon={Droplet} label="Air Weslik" />
          <NavLink href={`/internetdesa`} icon={Wifi} label="Internet Desa" />
        </div>
      </div>



      <div>
        <div className="text-xs text-gray-500 uppercase px-4">Keluar</div>
        <div className="mt-2 space-y-2">
          <form onSubmit={handleLogout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
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
