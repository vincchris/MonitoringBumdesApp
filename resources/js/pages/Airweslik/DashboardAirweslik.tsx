import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Banknote, PiggyBank, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Selamat datang, Pengelola Air Weslik',
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
    dashboard_data?: DashboardData;
};

export default function DashboardAirweslik({ dashboard_data }: DashboardProps) {
    const [data, setData] = useState<DashboardData>(() => ({
        pendapatan_hari_ini: dashboard_data?.pendapatan_hari_ini ?? 0,
        pengeluaran_hari_ini: dashboard_data?.pengeluaran_hari_ini ?? 0,
        saldo_kas: dashboard_data?.saldo_kas ?? 0,
        weekly_chart: dashboard_data?.weekly_chart ?? [],
        monthly_chart: dashboard_data?.monthly_chart ?? [],
        last_updated: dashboard_data?.last_updated ?? '-',
    }));

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['dashboard_data'],
                onSuccess: (page) => {
                    const newData = (page.props as any).dashboard_data as DashboardData | undefined;

                    setData({
                        pendapatan_hari_ini: newData?.pendapatan_hari_ini ?? 0,
                        pengeluaran_hari_ini: newData?.pengeluaran_hari_ini ?? 0,
                        saldo_kas: newData?.saldo_kas ?? 0,
                        weekly_chart: newData?.weekly_chart ?? [],
                        monthly_chart: newData?.monthly_chart ?? [],
                        last_updated: newData?.last_updated ?? '-',
                    });
                },
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    if (!data) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="p-6 text-center text-red-500">Gagal Memuat data dashboard...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-black">
                    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow">
                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                            <Banknote className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Pendapatan (hari ini)</p>
                            <p className="text-xl font-bold">Rp. {data.pendapatan_hari_ini?.toLocaleString?.() ?? '0'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow">
                        <div className="rounded-full bg-red-100 p-3 text-red-600">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Pengeluaran (hari ini)</p>
                            <p className="text-xl font-bold">Rp. {data.pengeluaran_hari_ini?.toLocaleString?.() ?? '0'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow">
                        <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
                            <PiggyBank className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Saldo Kas</p>
                            <p className="text-xl font-bold">Rp. {data.saldo_kas?.toLocaleString?.() ?? '0'}</p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-white p-4 shadow">
                        <h2 className="mb-4 text-lg font-semibold">Pendapatan Minggu ini</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.weekly_chart ?? []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow">
                        <h2 className="mb-4 text-lg font-semibold">Pendapatan Bulan ini</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.monthly_chart ?? []}>
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

                <p className="text-right text-sm text-gray-500">Terakhir diperbarui: {data.last_updated ?? '-'}</p>
            </div>
        </AppLayout>
    );
}
