import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Calendar, DollarSign, FileDown, FileSpreadsheet, Settings, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

interface LaporanKeuangan {
    tanggal: string;
    keterangan: string;
    jenis: string;
    bulan: string;
}

export default function Kios() {
    const { laporanKeuangan = [] } = usePage().props as unknown as {
        laporanKeuangan: LaporanKeuangan[];
    };

    const [showModalSaldo, setShowModalSaldo] = useState(false);
    const [showModalTarif, setShowModalTarif] = useState(false);

    const [tanggal, setTanggal] = useState('');
    const [penyewa, setPenyewa] = useState('Reguler');
    const [saldoAwal, setSaldoAwal] = useState('120000');
    const [tarifAwal, setTarifAwal] = useState('250000');

    return (
        <AppLayout>
            <Head title="Unit Usaha - Buper" />

            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Unit Usaha - Sewa Kios</h1>
                    <p className="mt-2 text-sm text-gray-600">Kelola keuangan Sewa Kios Anda</p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Saldo Card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                                    <DollarSign className="h-4 w-4" />
                                    Saldo Saat Ini
                                </div>
                                <p className="mt-2 text-2xl font-bold text-gray-900">Rp. 120,000</p>
                                <p className="mt-1 text-xs text-gray-500">Terakhir diubah: 05-06-2025</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowModalSaldo(true)}
                            className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Atur Saldo Awal
                        </Button>
                    </div>

                    {/* Tarif Card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                                    <Calendar className="h-4 w-4" />
                                    Tarif Sewa
                                </div>
                                <p className="mt-2 text-lg font-semibold text-gray-900">Per Kegiatan</p>
                                <p className="mt-1 text-xs text-gray-500">Terakhir diubah: 05-06-2025</p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50">
                                Lihat Tarif
                            </Button>
                            <Button onClick={() => setShowModalTarif(true)} size="sm" className="flex-1 bg-purple-600 text-white hover:bg-purple-700">
                                <Settings className="mr-1 h-3 w-3" />
                                Atur
                            </Button>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    Bulan Ini
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Pendapatan:</span>
                                        <span className="font-semibold text-gray-900">Rp 3.250.000</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Pengeluaran:</span>
                                        <span className="font-semibold text-gray-900">Rp 850.000</span>
                                    </div>
                                    <div className="border-t border-green-200 pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Selisih:</span>
                                            <span className="font-bold text-green-600">+Rp 2.400.000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-full bg-green-100 p-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Report */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Laporan Transaksi</h2>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Tanggal Transaksi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Keterangan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Jenis</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {laporanKeuangan.length > 0 ? (
                                        laporanKeuangan.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{item.tanggal}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.keterangan}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                            item.jenis.toLowerCase() === 'pendapatan'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : item.jenis.toLowerCase() === 'pengeluaran'
                                                                  ? 'bg-red-100 text-red-800'
                                                                  : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {item.jenis.toLowerCase() === 'pendapatan' ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : item.jenis.toLowerCase() === 'pengeluaran' ? (
                                                            <ArrowDown className="h-3 w-3" />
                                                        ) : null}
                                                        {item.jenis}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm whitespace-nowrap">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                                            onClick={() => router.visit(`/Kios/${item.bulan}`)}
                                                        >
                                                            Detail
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                                            <FileDown className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-green-200 text-green-600 hover:bg-green-50"
                                                        >
                                                            <FileSpreadsheet className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <FileSpreadsheet className="h-12 w-12 text-gray-300" />
                                                    <p className="mt-2 text-sm text-gray-500">Belum ada data laporan transaksi</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Saldo */}
            {showModalSaldo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Atur Saldo Awal Buper</h3>
                            <button onClick={() => setShowModalSaldo(false)} className="rounded-full p-1 text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                <input
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Nominal Saldo Awal</label>
                                <input
                                    type="text"
                                    value={`Rp. ${Number(saldoAwal).toLocaleString('id-ID')}`}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowModalSaldo(false)}>
                                Batal
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Tarif Sewa */}
            {showModalTarif && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Atur Tarif Buper</h3>
                            <button onClick={() => setShowModalTarif(false)} className="rounded-full p-1 text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Berlaku Mulai Tanggal</label>
                                <input
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Penyewa</label>
                                <select
                                    value={penyewa}
                                    onChange={(e) => setPenyewa(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="Reguler">Reguler</option>
                                    <option value="Member">Member</option>
                                    <option value="Komunitas">Komunitas</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tarif per Jam</label>
                                <input
                                    type="text"
                                    value={`Rp. ${Number(tarifAwal).toLocaleString('id-ID')}`}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowModalTarif(false)}>
                                Batal
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
