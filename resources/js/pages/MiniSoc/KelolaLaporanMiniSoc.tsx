import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PageProps = {
    auth: {
        user: {
            id_users: number;
            name: string;
            roles: string;
            image?: string;
        };
    };
    unit_id: number;
    laporanKeuangan: {
        tanggal: string;
        keterangan: string;
        jenis: string;
        selisih: number;
        saldo: number;
    }[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    tanggal_dipilih?: string;
    initial_balance: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Laporan - Mini soccer',
        href: '/KelolaLaporanMiniSoc',
    },
];

export default function KelolaLaporan({
    auth,
    unit_id,
    laporanKeuangan,
    pagination,
    tanggal_dipilih,
    initial_balance
}: PageProps) {
    const user = auth.user;

    // Function to handle pagination navigation
    const handlePageChange = (page: number) => {
        const params: any = { page };
        if (tanggal_dipilih) {
            params.tanggal = tanggal_dipilih;
        }

        router.get(`/unit/${unit_id}/kelolalaporan-minisoc`, params, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Function to handle date filter
    const handleDateFilter = (tanggal: string) => {
        const params: any = {};
        if (tanggal) {
            params.tanggal = tanggal;
        }

        router.get(`/unit/${unit_id}/kelolalaporan-minisoc`, params, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Laporan" />

            <div className="rounded-2xl bg-white px-4 py-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-6">
                    {/* Kolom kiri: Judul */}
                    <div className="min-w-[200px] flex-1">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Kelola Laporan Keuangan - Mini Soccer
                        </h2>
                        <p className="text-sm text-gray-600">
                            Saldo Awal: {formatCurrency(initial_balance)}
                        </p>
                    </div>

                    {/* Kolom tengah: Filter tanggal */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="tanggal" className="text-sm font-medium text-gray-700">
                            Filter Tanggal:
                        </label>
                        <input
                            type="date"
                            id="tanggal"
                            value={tanggal_dipilih || ''}
                            onChange={(e) => handleDateFilter(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {tanggal_dipilih && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDateFilter('')}
                                className="text-xs"
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Kolom kanan: Tombol export */}
                    <div className="flex gap-2">
                        <a
                            href={`/unit/${unit_id}/kelolalaporan-minisoc/export-pdf`}
                            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
                        >
                            Download PDF
                        </a>
                        <a
                            href={`/unit/${unit_id}/kelolalaporan-minisoc/export-excel`}
                            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors"
                        >
                            Download Excel
                        </a>
                    </div>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-gray-200 lg:overflow-x-visible">
                    <table className="min-w-full bg-white text-sm text-black">
                        <thead className="bg-gray-100 font-semibold text-black">
                            <tr>
                                <th className="px-4 py-3 text-left">No</th>
                                <th className="px-4 py-3 text-left">Tanggal</th>
                                <th className="px-4 py-3 text-left">Keterangan</th>
                                <th className="px-4 py-3 text-left">Jenis Transaksi</th>
                                <th className="px-4 py-3 text-left">Nominal</th>
                                <th className="px-4 py-3 text-left">Saldo Kas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporanKeuangan.length > 0 ? (
                                laporanKeuangan.map((item, i) => (
                                    <tr key={i} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {(pagination.current_page - 1) * pagination.per_page + i + 1}
                                        </td>
                                        <td className="px-4 py-3">{item.tanggal}</td>
                                        <td className="px-4 py-3">{item.keterangan || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                item.jenis === 'Pendapatan'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.jenis}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 font-medium ${
                                            item.jenis === 'Pendapatan' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {item.jenis === 'Pendapatan' ? '+' : '-'} {formatCurrency(Math.abs(item.selisih))}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {formatCurrency(item.saldo)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        {tanggal_dipilih
                                            ? `Tidak ada data untuk tanggal ${tanggal_dipilih}`
                                            : 'Belum ada data transaksi'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t px-4 py-3">
                            <div className="text-sm text-gray-700">
                                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} -{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    let page;
                                    if (pagination.last_page <= 5) {
                                        page = i + 1;
                                    } else if (pagination.current_page <= 3) {
                                        page = i + 1;
                                    } else if (pagination.current_page >= pagination.last_page - 2) {
                                        page = pagination.last_page - 4 + i;
                                    } else {
                                        page = pagination.current_page - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant={page === pagination.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={page === pagination.current_page ? 'bg-blue-700 text-white' : ''}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}