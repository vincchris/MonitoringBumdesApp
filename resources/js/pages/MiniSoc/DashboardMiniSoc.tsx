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
import { Banknote, PiggyBank, Wallet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Selamat datang, Pengelola Mini soccer',
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
        <h1 className="text-lg font-semibold text-black">
          Selamat datang, Pengelola Mini soccer
        </h1>
        <div className="flex items-center gap-3">
          <img
            src={user.image || '/assets/images/avatar.png'}
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-black">{user.name}</p>
            <p className="text-xs text-black mr-3">{user.roles}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Pendapatan */}
          <div className="rounded-xl bg-white dark:bg-white text-black shadow p-4 flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendapatan (hari ini)</p>
              <p className="text-xl font-bold">Rp. 20,000</p>
            </div>
          </div>
          {/* Pengeluaran */}
          <div className="rounded-xl bg-white dark:bg-white text-black shadow p-4 flex items-center gap-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-full">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pengeluaran (hari ini)</p>
              <p className="text-xl font-bold">Rp. 180,000</p>
            </div>
          </div>
          {/* Saldo Kas */}
          <div className="rounded-xl bg-white dark:bg-white text-black shadow p-4 flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Kas</p>
              <p className="text-xl font-bold">Rp. 40,000</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Mingguan */}
          <div className="bg-white dark:bg-white text-black shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Pendapatan Minggu ini</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pv" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bulanan */}
          <div className="bg-white dark:bg-white text-black shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Pendapatan Bulan ini</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pv" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
