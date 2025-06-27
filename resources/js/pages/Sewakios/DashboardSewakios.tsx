import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Banknote, PiggyBank, Wallet } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    unit_id: number;
};

export default function Dashboard({ auth, unit_id }: DashboardProps) {
    const user = auth.user;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Selamat datang, Pengelola Sewa Kios',
            href: `/unit/${unit_id}/dashboard`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Header atas */}
            <div className="flex items-center justify-between px-6 pt-6 text-black">
                <h1 className="text-lg font-semibold">Selamat datang, Pengelola Sewa Kios</h1>
                <div className="flex items-center gap-3">
                    <img src={user.image || '/assets/images/avatar.png'} alt="User Avatar" className="h-9 w-9 rounded-full object-cover" />
                    <div className="text-right">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="mr-3 text-xs">{user.roles}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                {/* Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-4 rounded-xl bg-white p-4 text-black shadow">
                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                            <Banknote className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Pendapatan (hari ini)</p>
                            <p className="text-xl font-bold">Rp. 20,000</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl bg-white p-4 text-black shadow">
                        <div className="rounded-full bg-red-100 p-3 text-red-600">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Pengeluaran (hari ini)</p>
                            <p className="text-xl font-bold">Rp. 180,000</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl bg-white p-4 text-black shadow">
                        <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
                            <PiggyBank className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Saldo Kas</p>
                            <p className="text-xl font-bold">Rp. 40,000</p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-white p-4 text-black shadow">
                        <h2 className="mb-4 text-lg font-semibold">Pendapatan Minggu ini</h2>
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

                    <div className="rounded-xl bg-white p-4 text-black shadow">
                        <h2 className="mb-4 text-lg font-semibold">Pendapatan Bulan ini</h2>
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
