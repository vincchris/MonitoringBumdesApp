import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import localeData from 'dayjs/plugin/localeData';
import { ArrowLeft, Calendar, Download, FileSpreadsheet, FileText, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

// Initialize dayjs
dayjs.locale('id');
dayjs.extend(localeData);

interface DetailItem {
    id: number;
    tanggal: string;
    tanggal_raw: string;
    keterangan: string;
    jenis: string;
    selisih: number;
    saldo: string;
    updated_at: string;
}

interface Unit {
    id: number;
    name: string;
}

interface PageProps {
    auth: {
        user: {
            name: string;
            role: string;
            image?: string;
        };
    };
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

export default function DetailLaporanInterDesa() {
    const { detailLaporan, bulan, unit, summary, auth } = usePage().props as unknown as PageProps;
    const [isDownloading, setIsDownloading] = useState({ pdf: false, excel: false });

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

    const handleBack = () => {
        history.back();
    };

    const handleExportPDF = async () => {
        try {
            setIsDownloading((prev) => ({ ...prev, pdf: true }));

            // Pastikan format bulan benar untuk parameter route
            let bulanParam = bulan;

            // Jika bulan dalam format "January 2024", konversi ke "2024-01"
            if (bulan.includes(' ')) {
                const [monthName, year] = bulan.split(' ');
                // Gunakan dayjs untuk konversi nama bulan Indonesia ke angka
                const monthIndex = dayjs().locale('id').localeData().months().indexOf(monthName);
                if (monthIndex !== -1) {
                    bulanParam = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
                }
            }

            // Langsung redirect ke URL download - lebih reliable daripada create element
            window.location.href = route('interdesa.downloadPdfDetail', { bulan: bulanParam });
        } catch (error) {
            alert('Terjadi kesalahan saat mendownload PDF. Silakan coba lagi.');
            setIsDownloading((prev) => ({ ...prev, pdf: false }));
        }

        // Reset loading state setelah delay (karena window.location.href tidak trigger onload)
        setTimeout(() => {
            setIsDownloading((prev) => ({ ...prev, pdf: false }));
        }, 3000);
    };

    // Handler untuk download Excel - DIPERBAIKI
    const handleExportExcel = async () => {
        try {
            setIsDownloading((prev) => ({ ...prev, excel: true }));

            // Pastikan format bulan benar untuk parameter route
            let bulanParam = bulan;

            // Jika bulan dalam format "January 2024", konversi ke "2024-01"
            if (bulan.includes(' ')) {
                const [monthName, year] = bulan.split(' ');
                // Gunakan dayjs untuk konversi nama bulan Indonesia ke angka
                const monthIndex = dayjs().locale('id').localeData().months().indexOf(monthName);
                if (monthIndex !== -1) {
                    bulanParam = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
                }
            }

            // Langsung redirect ke URL download - lebih reliable daripada create element
            window.location.href = route('interdesa.downloadExcelDetail', { bulan: bulanParam });
        } catch (error) {
            alert('Terjadi kesalahan saat mendownload Excel. Silakan coba lagi.');
            setIsDownloading((prev) => ({ ...prev, excel: false }));
        }

        // Reset loading state setelah delay (karena window.location.href tidak trigger onload)
        setTimeout(() => {
            setIsDownloading((prev) => ({ ...prev, excel: false }));
        }, 3000);
    };

    return (
        <AppLayout>
            <Head title={`Detail Laporan ${unit?.name || 'Mini Soccer'} - ${bulan}`} />

            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button onClick={handleBack} variant="outline" className="flex items-center gap-2 hover:bg-gray-100 ">
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Detail Laporan Transaksi</h1>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">{bulan}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-600">{unit?.name || 'Mini Soccer'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Export Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleExportPDF}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    disabled={isDownloading.pdf || detailLaporan.length === 0}
                                >
                                    {isDownloading.pdf ? (
                                        <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                    ) : (
                                        <Download className="mr-1 h-3 w-3" />
                                    )}
                                    PDF
                                </Button>
                                <Button
                                    onClick={handleExportExcel}
                                    variant="outline"
                                    size="sm"
                                    className="border-green-200 text-green-600 hover:bg-green-50"
                                    disabled={isDownloading.excel || detailLaporan.length === 0}
                                >
                                    {isDownloading.excel ? (
                                        <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                                    ) : (
                                        <FileSpreadsheet className="mr-1 h-3 w-3" />
                                    )}
                                    Excel
                                </Button>
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
                                                {summary.selisih >= 0 ? '+' : ''}
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
                    <Card className="shadow-sm p-2">
                        <CardHeader className='px-6 py-2'>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Rincian Transaksi Harian - {bulan}
                            </CardTitle>
                            <p className="text-sm text-gray-500">Menampilkan semua transaksi yang terjadi pada bulan {bulan}</p>
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
                                                <th className="px-6 py-4 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Waktu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {detailLaporan.map((item, index) => (
                                                <tr key={`${item.id}-${index}`} className="transition-colors hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{index + 1}</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                        <div className="font-medium">{item.tanggal}</div>
                                                        <div className="text-xs text-gray-500">{dayjs(item.tanggal_raw).format('dddd')}</div>
                                                    </td>
                                                    <td className="max-w-xs px-6 py-4 text-sm text-gray-900">
                                                        <div className="font-medium" title={item.keterangan}>
                                                            {item.keterangan || 'Transaksi'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getJenisBadge(item.jenis)}</td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <span
                                                            className={`font-semibold ${item.jenis === 'Pendapatan' ? 'text-green-600' : 'text-red-600'}`}
                                                        >
                                                            {item.jenis === 'Pendapatan' ? '+' : '-'}
                                                            {formatCurrency(Math.abs(item.selisih))}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap text-gray-900">
                                                        <div className="font-semibold">{formatCurrency(parseInt(item.saldo.replace(/,/g, '')))}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-xs whitespace-nowrap text-gray-500">
                                                        {dayjs(item.updated_at).format('HH:mm')}
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
                                        Belum ada transaksi untuk bulan {bulan} di unit {unit?.name || 'Mini Soccer'}.
                                    </p>
                                    <Button onClick={handleBack} variant="outline" className="mt-4">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Kembali ke Ringkasan
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    {detailLaporan.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Summary Info */}
                            <Card className='p-2'>
                                <CardHeader className='px-6 py-2'>
                                    <CardTitle className="text-base">Informasi Laporan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Periode:</span>
                                        <span className="text-sm font-medium text-gray-900">{bulan}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Unit:</span>
                                        <span className="text-sm font-medium text-gray-900">{unit?.name || 'Mini Soccer'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Transaksi:</span>
                                        <span className="text-sm font-medium text-gray-900">{summary.jumlahTransaksi} transaksi</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Rata-rata per Transaksi:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatCurrency(
                                                    summary.jumlahTransaksi > 0
                                                        ? (summary.totalPendapatan + summary.totalPengeluaran) / summary.jumlahTransaksi
                                                        : 0,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cash Flow Info */}
                            <Card className='p-2'>
                                <CardHeader className='px-6 py-2'>
                                    <CardTitle className="text-base">Aliran Kas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Masuk:</span>
                                        <span className="text-sm font-semibold text-green-600">+{formatCurrency(summary.totalPendapatan)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Keluar:</span>
                                        <span className="text-sm font-semibold text-red-600">-{formatCurrency(summary.totalPengeluaran)}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Net Cash Flow:</span>
                                            <span className={`text-sm font-bold ${summary.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {summary.selisih >= 0 ? '+' : ''}
                                                {formatCurrency(summary.selisih)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Status:</span>
                                            <span className={`font-medium ${summary.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {summary.selisih >= 0 ? 'Surplus' : 'Defisit'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Laporan ini dihasilkan secara otomatis dari sistem BUMDes</p>
                        <p className="mt-1">
                            Unit: {unit?.name || 'Mini Soccer'} • Periode: {bulan} • User: {auth?.user?.name}
                        </p>
                        <p className="mt-1 text-xs">Digenerate pada: {dayjs().format('dddd, DD MMMM YYYY HH:mm')} WIB</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
