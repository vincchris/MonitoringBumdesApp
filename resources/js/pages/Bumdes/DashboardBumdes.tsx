import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Banknote, PiggyBank, Wallet, TrendingUp, Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

const data = [
  { name: '2015', uv: 0, pv: 25 },
  { name: '2016', uv: 60, pv: 55 },
  { name: '2017', uv: 45, pv: 35 },
  { name: '2018', uv: 50, pv: 45 },
  { name: '2019', uv: 95, pv: 90 },
];

type DashboardProps = {
  auth: {
    user: {
      image?: string;
      name: string;
      roles: string;
    };
  };
};

export default function Dashboard({ auth }: DashboardProps) {
  const user = auth.user;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      {/* Header atas: Selamat datang dan data user */}
      <div className="flex items-center justify-between px-6 pt-6 text-black">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <img
            src={user.image || '/assets/images/avatar.png'}
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-black">{user.name}</p>
            <p className="text-xs text-gray-600 mr-3">{user.roles}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cards Row 1 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Pendapatan */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Pemasukan Keseluruhan (bulan ini)</p>
              <p className="text-2xl font-bold text-blue-800">Rp. 20.000</p>
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Pengeluaran Keseluruhan (bulan ini)</p>
              <p className="text-2xl font-bold text-red-800">Rp. 20.000</p>
            </div>
          </div>

          {/* Total untuk unit usaha */}
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <PiggyBank className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Total Saldo Unit Usaha</p>
              <p className="text-2xl font-bold text-yellow-800">Rp. 9.000.000</p>
            </div>
          </div>
        </div>

        {/* Small indicator card */}
        <div className="flex justify-end">
          <div className="bg-green-100 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">Selisih pendapatan - pengeluaran</span>
            <span className="text-sm font-bold text-green-800">+Rp. 3.500.000</span>
            <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded">87.5%</span>
            <span className="text-xs text-gray-500">Periode: Maret 2025</span>
          </div>
        </div>

        {/* Cards Row 2 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Total saldo PAD sektor */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="bg-gray-100 p-2 rounded-lg w-fit mb-2">
              <Banknote className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total saldo Mini Soccer</p>
              <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
            </div>
            <button className="mt-2 bg-orange-400 text-white text-xs px-3 py-1 rounded hover:bg-orange-500">
              Atur Saldo Awal
            </button>
          </div>

          {/* Total saldo dana pengelolaan */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="bg-gray-100 p-2 rounded-lg w-fit mb-2">
              <Wallet className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total saldo Bumi Perkemahan</p>
              <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
            </div>
            <button className="mt-2 bg-orange-400 text-white text-xs px-3 py-1 rounded hover:bg-orange-500">
              Atur Saldo Awal
            </button>
          </div>

          {/* Total saldo ANS */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="bg-gray-100 p-2 rounded-lg w-fit mb-2">
              <PiggyBank className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Saldo Kios</p>
              <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
            </div>
            <button className="mt-2 bg-orange-400 text-white text-xs px-3 py-1 rounded hover:bg-orange-500">
              Atur Saldo Awal
            </button>
          </div>

          {/* Total saldo 4th week */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="bg-gray-100 p-2 rounded-lg w-fit mb-2">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Saldo Air Weslik</p>
              <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
            </div>
            <button className="mt-2 bg-orange-400 text-white text-xs px-3 py-1 rounded hover:bg-orange-500">
              Atur Saldo Awal
            </button>
          </div>

          {/* Total saldo Internet desa */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="bg-gray-100 p-2 rounded-lg w-fit mb-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Saldo Internet Desa</p>
              <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
            </div>
            <button className="mt-2 bg-orange-400 text-white text-xs px-3 py-1 rounded hover:bg-orange-500">
              Atur Saldo Awal
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Pendapatan Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Pendapatan selama 6 bulan terakhir</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="pv" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pengeluaran Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Pengeluaran selama 6 bulan terakhir</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="pv" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}