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
    pagination?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Laporan - Bumi Perkemahan',
        href: '/KelolaLaporanBuper',
    },
];

export default function KelolaLaporan({ auth, unit_id, laporanKeuangan, pagination }: PageProps) {
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Laporan Buper" />

            <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
                <h1 className="text-lg font-semibold text-black">Selamat datang, Pengelola Buper</h1>
                <div className="flex items-center gap-3">
                    <img src={user.image || '/assets/images/avatar.png'} alt="User Avatar" className="h-9 w-9 rounded-full object-cover" />
                    <div className="text-right">
                        <p className="text-sm font-semibold text-black">{user.name}</p>
                        <p className="text-xs text-black">{user.roles}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-white px-2 py-4">
                <div className="mb-4 px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Kelola Laporan Keuangan - Bumi Perkemahan</h2>
                </div>

                <div className="mb-4 flex justify-end gap-2 px-6">
                    <a href={`/unit/${unit_id}/kelolalaporan-buper/export-pdf`} className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                        Download PDF
                    </a>
                    <a
                        href={`/unit/${unit_id}/kelolalaporan-buper/export-excel`}
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
                            {pagination && pagination.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={pagination.current_page === 1}
                                        onClick={() => {
                                            if (pagination.current_page > 1) {
                                                router.get(route().current()!, { page: pagination.current_page - 1 }, { preserveState: true });
                                            }
                                        }}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === pagination.current_page ? 'default' : 'outline'}
                                            onClick={() => {
                                                router.get(route().current()!, { page }, { preserveState: true });
                                            }}
                                        >
                                            {page}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={() => {
                                            if (pagination.current_page < pagination.last_page) {
                                                router.get(route().current()!, { page: pagination.current_page + 1 }, { preserveState: true });
                                            }
                                        }}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-gray-500 text-lg mb-2">Tidak ada data laporan</p>
                                <p className="text-gray-400 text-sm">Belum ada transaksi yang tercatat untuk unit ini</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}