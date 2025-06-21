import { Button } from "@/components/ui/button";
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Selamat datang, Pengelola Mini soccer',
    href: '/dashboard',
  },
];

const data = [
  // ... data kamu
];

export default function PemasukanMiniSoc({ auth }: PageProps) {
  const user = auth.user;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

       {/* Header atas: Selamat datang dan data user */}
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

       {/* Heading untuk halaman Pemasukan */}
      <div className="px-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Pengeluaran - Mini Soccer</h2>
      </div>


      <div className="flex justify-end mb-4">
        <h1>Pengeluaran - Mini soccer</h1>
        <Button className="bg-[#3B82F6] text-white hover:bg-blue-700">
          Tambah pendapatan harian +
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full bg-white text-sm text-black">
          <thead className="bg-gray-100 text-black font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Penyewa</th>
              <th className="px-4 py-3 text-left">Durasi (jam)</th>
              <th className="px-4 py-3 text-left">Tipe penyewa</th>
              <th className="px-4 py-3 text-left">Tarif per jam</th>
              <th className="px-4 py-3 text-left">Total bayar</th>
              <th className="px-4 py-3 text-left">Keterangan</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{item.tanggal}</td>
                <td className="px-4 py-3">{item.penyewa}</td>
                <td className="px-4 py-3">{item.durasi}</td>
                <td className="px-4 py-3">{item.tipe}</td>
                <td className="px-4 py-3">
                  Rp. {item.tarif.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  Rp. {item.total.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.keterangan}</td>
                <td className="px-4 py-3 space-x-2">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
