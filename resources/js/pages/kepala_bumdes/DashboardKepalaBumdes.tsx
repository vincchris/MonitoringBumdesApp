import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Banknote, Calendar, CheckCircle, PiggyBank, RefreshCw, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard kepala Bumdes',
        href: '/dashboard-kepalaBumdes',
    },
];

type ChartItem = {
    name: string;
    pendapatan?: number;
    pengeluaran?: number;
    bulan: string;
};

type UnitBalance = {
    unit_id: number;
    unit_name: string;
    balance: number;
    initial_balance?: number;
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

interface FlashInfo {
    message?: string;
    method?: 'create' | 'update' | 'delete';
}

export default function DashboardBumdes({ dashboard_data }: DashboardProps) {
    const { flash } = usePage().props as unknown as {
        flash: { info?: { message?: string; method?: string } };
    };

    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!flash?.info?.message) return;

        const { message, method } = flash.info;

        setFlashMessage(message || '');
        setFlashMethod(method || '');

        switch (method) {
            case 'delete':
                setFlashColor('bg-red-600');
                break;
            case 'update':
                setFlashColor('bg-blue-600');
                break;
            case 'create':
            default:
                setFlashColor('bg-green-600');
                break;
        }

        const timeout = setTimeout(() => {
            setFlashMessage(null);
            setFlashMethod('');
        }, 3000);

        return () => clearTimeout(timeout);
    }, [flash]);

    // Function to render the appropriate icon based on flash method
    const renderFlashIcon = () => {
        switch (flashMethod) {
            case 'create':
                return <CheckCircle className="h-5 w-5 text-white" />;
            case 'update':
                return <RefreshCw className="h-5 w-5 text-white" />;
            case 'delete':
                return <Trash2 className="h-5 w-5 text-white" />;
            default:
                return <CheckCircle className="h-5 w-5 text-white" />;
        }
    };

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

    const [selectedUnit, setSelectedUnit] = useState<UnitBalance | null>(null);
    const [newSaldo, setNewSaldo] = useState<number>(0);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateSaldo = () => {
        // Validasi nilai input yang lebih ketat
        if (!selectedUnit || !selectedUnit.unit_id) {
            alert('Unit tidak valid. Silakan pilih unit yang benar.');
            return;
        }

        if (newSaldo < 0) {
            alert('Nominal tidak boleh negatif.');
            return;
        }

        const payload = {
            id_unit: selectedUnit.unit_id,
            nominal: newSaldo,
        };

        console.log('Payload yang dikirim:', payload);
        console.log('Selected Unit:', selectedUnit);

        setIsLoading(true);

        router.post(route('saldo-awal.update'), payload, {
            preserveScroll: true,
            preserveState: false,
            onStart: () => {
                setIsLoading(true);
            },
            onSuccess: (page) => {
                console.log('Update berhasil');
                setShowModal(false);
                setSelectedUnit(null);
                setNewSaldo(0);
                setIsLoading(false);

                // Reload dashboard data
                router.reload({
                    only: ['dashboard_data'],
                    onSuccess: (page) => {
                        const newData = (page.props as any).dashboard_data as DashboardData | undefined;
                        if (newData) {
                            setData(newData);
                        }
                    },
                });
            },
            onError: (errors) => {
                console.error('Error saat update saldo:', errors);
                setIsLoading(false);

                // Tampilkan pesan error yang lebih spesifik
                if (typeof errors === 'object' && errors !== null) {
                    const errorMessages = Object.values(errors).flat().join(', ');
                    alert(`Gagal mengupdate saldo: ${errorMessages}`);
                } else {
                    alert('Gagal mengupdate saldo. Silakan coba lagi.');
                }
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleOpenModal = (unit: UnitBalance) => {
        console.log('Opening modal for unit:', unit);
        setSelectedUnit(unit);
        setNewSaldo(unit.initial_balance ?? 0);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUnit(null);
        setNewSaldo(0);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['dashboard_data'],
                preserveUrl: true,
                onSuccess: (page) => {
                    const newData = (page.props as any).dashboard_data as DashboardData | undefined;
                    if (newData) {
                        setData(newData);
                    }
                },
                onError: (errors) => {
                    console.error('Error saat reload data:', errors);
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

            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

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
                            <p className="text-2xl font-bold text-blue-800">{formatRupiah(data.pendapatan_bulan_ini ?? 0)}</p>
                            <p className="mt-1 text-xs text-blue-500">
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
                            <p className="text-2xl font-bold text-red-800">{formatRupiah(data.statistics.pengeluaran_bulan_ini ?? 0)}</p>
                            <p className="mt-1 text-xs text-red-500">Bulan lalu: {formatRupiah(data.statistics.pengeluaran_bulan_lalu ?? 0)}</p>
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
                            <p className="text-2xl font-bold text-yellow-800">{formatRupiah(data.total_saldo_unit_usaha ?? 0)}</p>
                            <p className="mt-1 text-xs text-yellow-500">{data.unit_balances.length.toLocaleString()} Unit Usaha</p>
                        </div>
                    </div>
                </div>

                {/* Cards Row 2 - Unit Balances */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {data.unit_balances.map((unit, index) => (
                        // Kartu dengan efek mengambang saat di-hover dan gradien halus
                        <div
                            key={`unit-${unit.unit_id}-${index}`}
                            className="group flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-md shadow-gray-500/5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-500/10"
                        >
                            {/* Konten Atas */}
                            <div>
                                {/* Header: Nama Unit dan Ikon */}
                                <div className="mb-5 flex items-center justify-between">
                                    {/* Nama Unit */}
                                    <p className="text-sm font-semibold text-gray-800">{unit.unit_name}</p>

                                    {/* Ikon */}
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                                        {index === 0 && <Banknote className="h-5 w-5" />}
                                        {index === 1 && <Wallet className="h-5 w-5" />}
                                        {index === 2 && <PiggyBank className="h-5 w-5" />}
                                        {index === 3 && <Calendar className="h-5 w-5" />}
                                        {index === 4 && <TrendingUp className="h-5 w-5" />}
                                    </div>
                                </div>

                                {/* Saldo Saat Ini (Fokus Utama) */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Saldo Saat Ini</p>
                                    <div className="mt-1 flex items-center gap-x-2">
                                        <p className="text-2xl font-bold text-green-600">{formatRupiah(unit.balance)}</p>
                                    </div>
                                </div>

                                {/* Pemisah Visual */}
                                <hr className="my-3 border-gray-100" />

                                {/* Saldo Awal (Informasi Sekunder) */}
                                <div>
                                    <p className="text-xs text-gray-500">Saldo Awal</p>
                                    <p className="text-sm font-medium text-gray-600">{formatRupiah(unit.initial_balance ?? 0)}</p>
                                </div>
                            </div>

                            {/* Tombol Aksi dengan gaya modern */}
                            <button
                                onClick={() => handleOpenModal(unit)}
                                className="mt-5 w-full rounded-lg bg-orange-400 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-500 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
                                disabled={isLoading}
                            >
                                {isLoading && selectedUnit?.unit_id === unit.unit_id ? 'Memproses...' : 'Atur Saldo Awal'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Modal Input Saldo Awal */}
                {showModal && selectedUnit && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-lg font-bold text-black">Atur Saldo Awal - {selectedUnit.unit_name}</h2>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Nominal Saldo Awal:</label>
                                <input
                                    type="text"
                                    value={formatRupiah(newSaldo)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/[^0-9]/g, ''); // ambil angka saja
                                        setNewSaldo(Number(raw));
                                    }}
                                    className="w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                                    placeholder="Masukkan nominal saldo awal"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 disabled:opacity-50"
                                    onClick={handleCloseModal}
                                    disabled={isLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                    onClick={handleUpdateSaldo}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profit Indicator */}
                <div className="flex justify-start">
                    <div
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
                            data.statistics.net_profit_bulan_ini >= 0 ? 'border-green-200 bg-green-100' : 'border-red-200 bg-red-100'
                        }`}
                    >
                        <TrendingUp className={`h-4 w-4 ${data.statistics.net_profit_bulan_ini >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-sm ${data.statistics.net_profit_bulan_ini >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Selisih pendapatan - pengeluaran
                        </span>
                        <span className={`text-sm font-bold ${data.statistics.net_profit_bulan_ini >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                            {data.statistics.net_profit_bulan_ini >= 0 ? '+' : ''}
                            {formatRupiah(data.statistics.net_profit_bulan_ini ?? 0)}
                        </span>
                        <span
                            className={`rounded px-2 py-1 text-xs ${
                                data.statistics.persentase_selisih >= 0 ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'
                            }`}
                        >
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
                                    formatter={(value: any) => [formatRupiah(Number(value)), 'Pendapatan']}
                                />
                                <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
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
                                    formatter={(value: any) => [formatRupiah(Number(value)), 'Pengeluaran']}
                                />
                                <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between text-sm text-gray-500">
                    <div>
                        Total Transaksi Bulan Ini: {data.statistics.total_transaksi.toLocaleString()} | Rata-rata Pendapatan Harian:{' '}
                        {formatRupiah(data.statistics.rata_rata_pendapatan_harian ?? 0)}
                    </div>
                    <div>Terakhir diperbarui: {data.last_updated ?? '-'}</div>
                </div>
            </div>
        </AppLayout>
    );
}
