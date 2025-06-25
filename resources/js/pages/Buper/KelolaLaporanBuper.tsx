import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
        // nominal: number;
        selisih: number;
        saldo: number;
    }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Laporan - Mini soccer',
        href: '/KelolaLaporanBuper',
    },
];

export default function KelolaLaporan({ auth, unit_id, laporanKeuangan }: PageProps) {
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Laporan" />

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

            <div className="mb-4 px-6">
                <h2 className="text-xl font-semibold text-gray-800">Kelola Laporan Keuangan - Buper</h2>
            </div>

            <div className="mb-4 flex justify-end gap-2 px-6">
                <a href={`/unit/${unit_id}/kelolalaporan/export-pdf`} className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                    Download PDF
                </a>
                <a href={`/unit/${unit_id}/kelolalaporan/export-excel`} className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                    Download Excel
                </a>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 px-6">
                <table className="min-w-full bg-white text-sm text-black">
                    <thead className="bg-gray-100 font-semibold text-black">
                        <tr>
                            <th className="px-4 py-3 text-left">No</th>
                            <th className="px-4 py-3 text-left">Tanggal</th>
                            <th className="px-4 py-3 text-left">Keterangan</th>
                            <th className="px-4 py-3 text-left">Jenis Transaksi</th>
                            {/* <th className="px-4 py-3 text-left">Nominal</th> */}
                            <th className="px-4 py-3 text-left">Selisih saldo</th>
                            <th className="px-4 py-3 text-left">Jumlah Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {laporanKeuangan.map((item, i) => (
                            <tr key={i} className="border-t">
                                <td className="px-4 py-3">{i + 1}</td>
                                <td className="px-4 py-3">{item.tanggal}</td>
                                <td className="px-4 py-3">{item.keterangan}</td>
                                <td className="px-4 py-3">{item.jenis}</td>
                                {/* <td className="px-4 py-3">Rp. {item.nominal.toLocaleString('id-ID')}</td> */}
                                <td className={`px-4 py-3 ${item.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.selisih >= 0 ? '+' : '-'} Rp. {Math.abs(item.selisih).toLocaleString('id-ID')}
                                </td>

                                <td className="px-4 py-3">Rp. {item.saldo.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
