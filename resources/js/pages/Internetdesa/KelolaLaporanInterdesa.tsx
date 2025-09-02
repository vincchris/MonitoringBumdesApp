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
        saldo: number | string;
    }[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    tanggal_dipilih?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Laporan - Internet Desa',
        href: '/KelolaLaporanInterDesa',
    },
];

export default function KelolaLaporan({ auth, unit_id, laporanKeuangan, pagination, tanggal_dipilih }: PageProps) {
    const user = auth.user;

    const handlePageChange = (page: number) => {
            const params: any = { page };
            if (tanggal_dipilih) {
                params.tanggal = tanggal_dipilih;
            }

            router.get(`/unit/${unit_id}/kelolalaporan-interdesa`, params, {
                preserveState: true,
                preserveScroll: true
            });
        };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Laporan Internet Desa" />

            <div className="rounded-2xl bg-white px-2 py-4">
                <div className="mb-4 px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Kelola Laporan Keuangan - Internet Desa</h2>
                </div>

                <div className="mb-4 flex justify-end gap-2 px-6">
                    <a
                        href={`/unit/${unit_id}/kelolalaporan-interdesa/export-pdf`}
                        className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                        Download PDF
                    </a>
                    <a
                        href={`/unit/${unit_id}/kelolalaporan-interdesa/export-excel`}
                        className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                    >
                        Download Excel
                    </a>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 px-6">
                    {laporanKeuangan && laporanKeuangan.length > 0 ? (
                        <>
                            <table className="min-w-full bg-white text-sm text-black">
                                <thead className="bg-gray-100 font-semibold text-black">
                                    <tr>
                                        <th className="px-4 py-3 text-left">No</th>
                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                        <th className="px-4 py-3 text-left">Keterangan</th>
                                        <th className="px-4 py-3 text-left">Jenis Transaksi</th>
                                        <th className="px-4 py-3 text-left">Nominal</th>
                                        <th className="px-4 py-3 text-left">Jumlah Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {laporanKeuangan.map((item, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-4 py-3">{i + 1}</td>
                                            <td className="px-4 py-3">{item.tanggal || '-'}</td>
                                            <td className="px-4 py-3">{item.keterangan || '-'}</td>
                                            <td className="px-4 py-3">{item.jenis || '-'}</td>
                                            <td className={`px-4 py-3 ${item.jenis === 'Pendapatan' ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.jenis === 'Pendapatan' ? '+' : '-'} Rp. {Math.abs(item.selisih || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                Rp. {typeof item.saldo === 'string' ? item.saldo : (item.saldo || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
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
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="mb-2 text-lg text-gray-500">Tidak ada data laporan</p>
                                <p className="text-sm text-gray-400">Belum ada transaksi yang tercatat untuk unit ini</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
