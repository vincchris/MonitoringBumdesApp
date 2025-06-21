import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
type PageProps = {
  auth: {
    user: {
      name: string;
      role: string;
      image?: string;
    };
  };
};
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Kelola Laporan - Mini soccer',
    href: '/kelola-laporan',
  },
];

const laporanKeuangan = [
  {
    tanggal: '2025-03-27',
    keterangan: 'Sewa mini soccer (3 jam)',
    jenis: 'Pendapatan',
    nominal: 500000,
    saldo: 500000,
  },
  {
    tanggal: '2025-03-27',
    keterangan: 'Aqua gelas 1 dus',
    jenis: 'Pengeluaran',
    nominal: 12000,
    saldo: 488000,
  },
  {
    tanggal: '2025-03-27',
    keterangan: 'Tambahan sewa malam',
    jenis: 'Pendapatan',
    nominal: 200000,
    saldo: 688000,
  },
];

export default function KelolaLaporan({ auth }: PageProps) {
  const user = auth.user;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kelola Laporan" />

      {/* Header atas */}
      <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
        <h1 className="text-lg font-semibold text-black">
          Selamat datang, Pengelola Mini soccer
        </h1>
        <div className="flex items-center gap-3">
          <img
            src={user.image || '/assets/images/avatar.png'}
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-black">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Heading halaman */}
      <div className="px-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Kelola Laporan Keuangan - Mini Soccer</h2>
      </div>

      {/* Tombol download */}
      <div className="flex justify-end gap-2 px-6 mb-4">
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          Download PDF
        </Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Download Excel
        </Button>
      </div>

      {/* Tabel laporan */}
      <div className="px-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full bg-white text-sm text-black">
          <thead className="bg-gray-100 text-black font-semibold">
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
            {laporanKeuangan.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{item.tanggal}</td>
                <td className="px-4 py-3">{item.keterangan}</td>
                <td className="px-4 py-3">{item.jenis}</td>
                <td className="px-4 py-3">
                  Rp. {item.nominal.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  Rp. {item.saldo.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
