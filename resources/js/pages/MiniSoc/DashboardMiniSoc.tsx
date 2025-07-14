import { Head, router } from '@inertiajs/react';
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
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Selamat datang, Pengelola Mini Soccer',
    href: '/dashboard',
  },
];

type ChartItem = {
  name: string;
  pendapatan: number;
  pengeluaran: number;
};

type DashboardData = {
  pendapatan_hari_ini: number;
  pengeluaran_hari_ini: number;
  saldo_kas: number;
  weekly_chart: ChartItem[];
  monthly_chart: ChartItem[];
  last_updated: string;
};

type DashboardProps = {
  unit_id: number;
  auth: {
    user: {
      image?: string;
      name: string;
      roles: string;
    };
  };
  dashboard_data: DashboardData;
};

export default function DashboardMiniSoc({ unit_id, dashboard_data }: DashboardProps) {
  const [data, setData] = useState<DashboardData>(dashboard_data);

  // Real-time update setiap 10 detik (polling)
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['dashboard_data'],
        onSuccess: (page) => {
          setData((page.props as any).dashboard_data);
        },
      });
    }, 10000); // 10 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Pendapatan */}
          <div className="rounded-xl bg-white shadow p-4 flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendapatan (hari ini)</p>
              <p className="text-xl font-bold">Rp. {data.pendapatan_hari_ini.toLocaleString()}</p>
            </div>
          </div>
          {/* Pengeluaran */}
          <div className="rounded-xl bg-white shadow p-4 flex items-center gap-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-full">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pengeluaran (hari ini)</p>
              <p className="text-xl font-bold">Rp. {data.pengeluaran_hari_ini.toLocaleString()}</p>
            </div>
          </div>
          {/* Saldo Kas */}
          <div className="rounded-xl bg-white shadow p-4 flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Kas</p>
              <p className="text-xl font-bold">Rp. {data.saldo_kas.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Mingguan */}
          <div className="bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Pendapatan Minggu ini</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.weekly_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bulanan */}
          <div className="bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Pendapatan Bulan ini</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.monthly_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 text-right">
          Terakhir diperbarui: {data.last_updated}
        </p>
      </div>
    </AppLayout>
  );
}
