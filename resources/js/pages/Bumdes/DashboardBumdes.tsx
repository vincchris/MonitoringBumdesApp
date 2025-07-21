import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Banknote, Calendar, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard BUMDes',
        href: '/dashboard-bumdes',
    },
];

type ChartItem = {
    name: string;
    pendapatan?: number;
    pengeluaran?: number;
    bulan: string;
};

type UnitBalance = {
    unit_name: string;
    balance: number;
};

type Statistics = {
    pendapatan_bulan_ini: number;
    pendapatan_bulan_lalu: number;
    pertumbuhan_pendapatan: number;
    pengeluaran_bulan_ini: number;
    pengeluaran_bulan_lalu: number;
    net_profit_bulan_ini: number;
    net_profit_bulan_lalu: number;
    persentase_selisih: number;
    total_transaksi: number;
    rata_rata_pendapatan_harian: number;
};

type DashboardData = {
    pendapatan_bulan_ini: number;
    pengeluaran_bulan_ini: number;
    net_profit_bulan_ini: number;
    total_saldo_unit_usaha: number;
    unit_balances: UnitBalance[];
    monthly_chart_pendapatan: ChartItem[];
    monthly_chart_pengeluaran: ChartItem[];
    statistics: Statistics;
    last_updated: string;
};

type DashboardProps = {
    auth: {
        user: {
            image?: string;
            name: string;
            roles: string;
        };
    };
    dashboard_data?: DashboardData;
};

export default function DashboardBumdes({ dashboard_data }: DashboardProps) {
    const [data, setData] = useState<DashboardData>(() => ({
        pendapatan_bulan_ini: dashboard_data?.pendapatan_bulan_ini ?? 0,
        pengeluaran_bulan_ini: dashboard_data?.pengeluaran_bulan_ini ?? 0,
        net_profit_bulan_ini: dashboard_data?.net_profit_bulan_ini ?? 0,
        total_saldo_unit_usaha: dashboard_data?.total_saldo_unit_usaha ?? 0,
        unit_balances: dashboard_data?.unit_balances ?? [],
        monthly_chart_pendapatan: dashboard_data?.monthly_chart_pendapatan ?? [],
        monthly_chart_pengeluaran: dashboard_data?.monthly_chart_pengeluaran ?? [],
        statistics: dashboard_data?.statistics ?? {
            pendapatan_bulan_ini: 0,
            pendapatan_bulan_lalu: 0,
            pertumbuhan_pendapatan: 0,
            pengeluaran_bulan_ini: 0,
            pengeluaran_bulan_lalu: 0,
            net_profit_bulan_ini: 0,
            net_profit_bulan_lalu: 0,
            persentase_selisih: 0,
            total_transaksi: 0,
            rata_rata_pendapatan_harian: 0,
        },
        last_updated: dashboard_data?.last_updated ?? '-',
    }));

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['dashboard_data'],
                onSuccess: (page) => {
                    const newData = (page.props as any).dashboard_data as DashboardData | undefined;

                    if (newData) {
                        setData(newData);
                    }
                },
            });
        }, 30000); // Update setiap 30 detik

        return () => clearInterval(interval);
    }, []);

    if (!data) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard BUMDes" />
                <div className="p-6 text-center text-red-500">Gagal memuat data dashboard...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard BUMDes" />

            <div className="space-y-6 p-6">
                {/* Cards Row 1 - Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Pemasukan Keseluruhan */}
                    <div className="relative rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Banknote className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600">Pemasukan Keseluruhan (bulan ini)</p>
                            <p className="text-2xl font-bold text-blue-800">
                                Rp. {data.pendapatan_bulan_ini?.toLocaleString?.() ?? '0'}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                                Pertumbuhan: {data.statistics.pertumbuhan_pendapatan >= 0 ? '+' : ''}
                                {data.statistics.pertumbuhan_pendapatan.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Pengeluaran Keseluruhan */}
                    <div className="relative rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-red-100 p-2">
                                <Wallet className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-600">Pengeluaran Keseluruhan (bulan ini)</p>
                            <p className="text-2xl font-bold text-red-800">
                                Rp. {data.pengeluaran_bulan_ini?.toLocaleString?.() ?? '0'}
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                                Bulan lalu: Rp. {data.statistics.pengeluaran_bulan_lalu?.toLocaleString?.() ?? '0'}
                            </p>
                        </div>
                    </div>

                    {/* Total Saldo Unit Usaha */}
                    <div className="relative rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-yellow-100 p-2">
                                <PiggyBank className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-yellow-600">Total Saldo Unit Usaha</p>
                            <p className="text-2xl font-bold text-yellow-800">
                                Rp. {data.total_saldo_unit_usaha?.toLocaleString?.() ?? '0'}
                            </p>
                            <p className="text-xs text-yellow-500 mt-1">
                                {data.unit_balances.length} Unit Usaha
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cards Row 2 - Unit Balances */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {data.unit_balances.map((unit, index) => (
                        <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="mb-2 w-fit rounded-lg bg-gray-100 p-2">
                                {index === 0 && <Banknote className="h-4 w-4 text-gray-600" />}
                                {index === 1 && <Wallet className="h-4 w-4 text-gray-600" />}
                                {index === 2 && <PiggyBank className="h-4 w-4 text-gray-600" />}
                                {index === 3 && <Calendar className="h-4 w-4 text-gray-600" />}
                                {index === 4 && <TrendingUp className="h-4 w-4 text-gray-600" />}
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Saldo {unit.unit_name}</p>
                                <p className="text-lg font-bold text-gray-800">
                                    Rp. {unit.balance?.toLocaleString?.() ?? '0'}
                                </p>
                            </div>
                            <button className="mt-2 rounded bg-orange-400 px-3 py-1 text-xs text-white hover:bg-orange-500">
                                Atur Saldo Awal
                            </button>
                        </div>
                    ))}
                </div>

                {/* Profit Indicator */}
                <div className="flex justify-start">
                    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
                        data.statistics.net_profit_bulan_ini >= 0
                            ? 'border-green-200 bg-green-100'
                            : 'border-red-200 bg-red-100'
                    }`}>
                        <TrendingUp className={`h-4 w-4 ${
                            data.statistics.net_profit_bulan_ini >= 0 ? 'text-green-600' : 'text-red-600'
                        }`} />
                        <span className={`text-sm ${
                            data.statistics.net_profit_bulan_ini >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            Selisih pendapatan - pengeluaran
                        </span>
                        <span className={`text-sm font-bold ${
                            data.statistics.net_profit_bulan_ini >= 0 ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {data.statistics.net_profit_bulan_ini >= 0 ? '+' : ''}
                            Rp. {data.statistics.net_profit_bulan_ini?.toLocaleString?.() ?? '0'}
                        </span>
                        <span className={`rounded px-2 py-1 text-xs ${
                            data.statistics.persentase_selisih >= 0
                                ? 'bg-green-200 text-green-600'
                                : 'bg-red-200 text-red-600'
                        }`}>
                            {data.statistics.persentase_selisih >= 0 ? '+' : ''}
                            {data.statistics.persentase_selisih.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                            Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Pendapatan Chart */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Pendapatan selama 6 bulan terakhir</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.monthly_chart_pendapatan ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: any) => [`Rp. ${Number(value).toLocaleString()}`, 'Pendapatan']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pendapatan"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pengeluaran Chart */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Pengeluaran selama 6 bulan terakhir</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.monthly_chart_pengeluaran ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: any) => [`Rp. ${Number(value).toLocaleString()}`, 'Pengeluaran']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pengeluaran"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#ef4444', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between text-sm text-gray-500">
                    <div>
                        Total Transaksi Bulan Ini: {data.statistics.total_transaksi} |
                        Rata-rata Pendapatan Harian: Rp. {data.statistics.rata_rata_pendapatan_harian?.toLocaleString?.() ?? '0'}
                    </div>
                    <div>Terakhir diperbarui: {data.last_updated ?? '-'}</div>
                </div>
            </div>
        </AppLayout>
    );
}