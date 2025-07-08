import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Banknote, Calendar, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard-KepalaBumdes',
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Cards Row 1 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Pendapatan */}
                    <div className="relative rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Banknote className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600">Pemasukan Keseluruhan (bulan ini)</p>
                            <p className="text-2xl font-bold text-blue-800">Rp. 20.000</p>
                        </div>
                    </div>

                    {/* Pengeluaran */}
                    <div className="relative rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-red-100 p-2">
                                <Wallet className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-600">Pengeluaran Keseluruhan (bulan ini)</p>
                            <p className="text-2xl font-bold text-red-800">Rp. 20.000</p>
                        </div>
                    </div>

                    {/* Total untuk unit usaha */}
                    <div className="relative rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-yellow-100 p-2">
                                <PiggyBank className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-yellow-600">Total Saldo Unit Usaha</p>
                            <p className="text-2xl font-bold text-yellow-800">Rp. 9.000.000</p>
                        </div>
                    </div>
                </div>

                {/* Cards Row 2 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {/* Total saldo PAD sektor */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 w-fit rounded-lg bg-gray-100 p-2">
                            <Banknote className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total saldo Mini Soccer</p>
                            <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
                        </div>
                        <button className="mt-2 rounded bg-orange-400 px-3 py-1 text-xs text-white hover:bg-orange-500">Atur Saldo Awal</button>
                    </div>

                    {/* Total saldo dana pengelolaan */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 w-fit rounded-lg bg-gray-100 p-2">
                            <Wallet className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total saldo Bumi Perkemahan</p>
                            <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
                        </div>
                        <button className="mt-2 rounded bg-orange-400 px-3 py-1 text-xs text-white hover:bg-orange-500">Atur Saldo Awal</button>
                    </div>

                    {/* Total saldo ANS */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 w-fit rounded-lg bg-gray-100 p-2">
                            <PiggyBank className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Saldo Kios</p>
                            <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
                        </div>
                        <button className="mt-2 rounded bg-orange-400 px-3 py-1 text-xs text-white hover:bg-orange-500">Atur Saldo Awal</button>
                    </div>

                    {/* Total saldo 4th week */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 w-fit rounded-lg bg-gray-100 p-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Saldo Air Weslik</p>
                            <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
                        </div>
                        <button className="mt-2 rounded bg-orange-400 px-3 py-1 text-xs text-white hover:bg-orange-500">Atur Saldo Awal</button>
                    </div>

                    {/* Total saldo Internet desa */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 w-fit rounded-lg bg-gray-100 p-2">
                            <TrendingUp className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Saldo Internet Desa</p>
                            <p className="text-lg font-bold text-gray-800">Rp. 120.000</p>
                        </div>
                        <button className="mt-2 rounded bg-orange-400 px-3 py-1 text-xs text-white hover:bg-orange-500">Atur Saldo Awal</button>
                    </div>
                </div>

                {/* Small indicator card */}
                <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-100 px-4 py-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Selisih pendapatan - pengeluaran</span>
                        <span className="text-sm font-bold text-green-800">+Rp. 3.500.000</span>
                        <span className="rounded bg-green-200 px-2 py-1 text-xs text-green-600">87.5%</span>
                        <span className="text-xs text-gray-500">Periode: Maret 2025</span>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Pendapatan Chart */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Pendapatan selama 6 bulan terakhir</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Line type="monotone" dataKey="pv" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                                <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pengeluaran Chart */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Pengeluaran selama 6 bulan terakhir</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
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
