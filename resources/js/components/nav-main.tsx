// js/components/nav-main.tsx
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, FileText, LogOut } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
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
  return (
    <nav className="p-4 space-y-6">
      <div className="space-y-2">
        <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
      </div>

      <div>
        <div className="text-xs text-gray-500 uppercase px-4">Transaksi</div>
        <div className="mt-2 space-y-2">
          <NavLink href="/pemasukan" icon={ArrowUpRight} label="Pemasukan" />
          <NavLink href="/pengeluaran" icon={ArrowDownLeft} label="Pengeluaran" />
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500 uppercase px-4">Laporan</div>
        <div className="mt-2 space-y-2">
          <NavLink href="/laporan" icon={FileText} label="Kelola laporan" />
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500 uppercase px-4">Keluar</div>
        <div className="mt-2 space-y-2">
          <NavLink href="/logout" icon={LogOut} label="Keluar" />
        </div>
      </div>
    </nav>
  );
}
