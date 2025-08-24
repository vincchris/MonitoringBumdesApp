import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Banknote, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard Admin', href: '/dashboard-admin' }];

// ----- DATA DUMMY -----
const dummyData = {
    pendapatan_bulan_ini: 12500000,
    pengeluaran_bulan_ini: 7200000,
    net_profit_bulan_ini: 5300000,
    total_saldo_unit_usaha: 45000000,
    monthly_chart_pendapatan: [
        { name: 'Mar', pendapatan: 8000000 },
        { name: 'Apr', pendapatan: 9500000 },
        { name: 'Mei', pendapatan: 10000000 },
        { name: 'Jun', pendapatan: 11000000 },
        { name: 'Jul', pendapatan: 12000000 },
        { name: 'Agu', pendapatan: 12500000 },
    ],
    monthly_chart_pengeluaran: [
        { name: 'Mar', pengeluaran: 5000000 },
        { name: 'Apr', pengeluaran: 6000000 },
        { name: 'Mei', pengeluaran: 6500000 },
        { name: 'Jun', pengeluaran: 7000000 },
        { name: 'Jul', pengeluaran: 7100000 },
        { name: 'Agu', pengeluaran: 7200000 },
    ],
    last_updated: '24 Agustus 2025',
};

export default function DashboardAdmin() {
    const data = dummyData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />

            <div className="space-y-6 p-6">
                {/* Ringkasan */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-blue-50 p-4">
                        <Banknote className="mb-2 text-blue-600" />
                        <p className="text-sm text-blue-600">Pendapatan Bulan Ini</p>
                        <p className="text-xl font-bold">{formatRupiah(data.pendapatan_bulan_ini)}</p>
                    </div>
                    <div className="rounded-xl border bg-red-50 p-4">
                        <Wallet className="mb-2 text-red-600" />
                        <p className="text-sm text-red-600">Pengeluaran Bulan Ini</p>
                        <p className="text-xl font-bold">{formatRupiah(data.pengeluaran_bulan_ini)}</p>
                    </div>
                    <div className="rounded-xl border bg-green-50 p-4">
                        <TrendingUp className="mb-2 text-green-600" />
                        <p className="text-sm text-green-600">Net Profit</p>
                        <p className="text-xl font-bold">{formatRupiah(data.net_profit_bulan_ini)}</p>
                    </div>
                    <div className="rounded-xl border bg-yellow-50 p-4">
                        <PiggyBank className="mb-2 text-yellow-600" />
                        <p className="text-sm text-yellow-600">Total Saldo Unit Usaha</p>
                        <p className="text-xl font-bold">{formatRupiah(data.total_saldo_unit_usaha)}</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-xl border bg-white p-4">
                        <h2 className="mb-2 text-sm font-semibold">Pendapatan (6 bulan)</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.monthly_chart_pendapatan}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(v: any) => formatRupiah(v)} />
                                <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                        <h2 className="mb-2 text-sm font-semibold">Pengeluaran (6 bulan)</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.monthly_chart_pengeluaran}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(v: any) => formatRupiah(v)} />
                                <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-sm text-gray-500">Terakhir diperbarui: {data.last_updated}</div>
            </div>
        </AppLayout>
    );
}
