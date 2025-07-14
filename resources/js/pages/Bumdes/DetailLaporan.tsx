import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface DetailItem {
    tanggal: string;
    keterangan: string;
    jenis: string;
    selisih: number;
    saldo: string;
}

interface Unit {
    id: number;
    name: string;
}

interface PageProps {
    detailLaporan: DetailItem[];
    bulan: string;
    unit: Unit;
    summary: {
        totalPendapatan: number;
        totalPengeluaran: number;
        selisih: number;
        jumlahTransaksi: number;
    };
}

export default function DetailLaporanMiniSoccer() {
    const { detailLaporan, bulan, unit, summary } = usePage().props as unknown as PageProps;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getJenisBadge = (jenis: string) => {
        if (jenis === 'Pendapatan') {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Pendapatan
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                    <TrendingDown className="mr-1 h-3 w-3" />
                    Pengeluaran
                </Badge>
            );
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail Laporan ${unit?.name || 'Unit'} - ${bulan}`} />

            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => router.visit("/MiniSoccer")}
                                    variant="outline"
                                    className="flex items-center gap-2 hover:bg-gray-100"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Detail Laporan Transaksi</h1>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">{bulan}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-600">{unit?.name || 'Unit'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summary && (
                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Total Pendapatan</p>
                                            <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.totalPendapatan)}</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-600">Total Pengeluaran</p>
                                            <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.totalPengeluaran)}</p>
                                        </div>
                                        <TrendingDown className="h-8 w-8 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">Selisih</p>
                                            <p className={`text-2xl font-bold ${summary.selisih >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {formatCurrency(summary.selisih)}
                                            </p>
                                        </div>
                                        <Wallet className="h-8 w-8 text-blue-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">Jumlah Transaksi</p>
                                            <p className="text-2xl font-bold text-purple-700">{summary.jumlahTransaksi}</p>
                                        </div>
                                        <FileText className="h-8 w-8 text-purple-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Transaction Table */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Rincian Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {detailLaporan.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">No</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Tanggal
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Keterangan
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Jenis
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Nominal
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Saldo Kas
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {detailLaporan.map((item, index) => (
                                                <tr key={index} className="transition-colors hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{index + 1}</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{item.tanggal}</td>
                                                    <td className="max-w-xs px-6 py-4 text-sm text-gray-900">
                                                        <div className="truncate" title={item.keterangan}>
                                                            {item.keterangan}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getJenisBadge(item.jenis)}</td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <span className={`${item.jenis === 'Pendapatan' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {item.jenis === 'Pendapatan' ? '+' : '-'}
                                                            {formatCurrency(Math.abs(item.selisih))}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap text-gray-900">
                                                        {formatCurrency(parseInt(item.saldo.replace(/,/g, '')))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada transaksi</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Belum ada transaksi untuk bulan {bulan} di unit {unit?.name || 'ini'}.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Footer Info */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Laporan ini dihasilkan secara otomatis dari sistem BUMDes</p>
                        <p className="mt-1">
                            Unit: {unit?.name || 'Unit'} • Periode: {bulan}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
