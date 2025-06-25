import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
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
    // nominal: number;
    selisih: number;
    saldo: number;
  }[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  }
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Kelola Laporan - Mini soccer',
    href: '/KelolaLaporanMiniSoc',
  },
];

export default function KelolaLaporan({ auth, unit_id, laporanKeuangan, pagination }: PageProps) {
  const user = auth.user;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kelola Laporan" />

      <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
        <h1 className="text-lg font-semibold text-black">Selamat datang, Pengelola Mini Soccer</h1>
        <div className="flex items-center gap-3">
          <img
            src={user.image || '/assets/images/avatar.png'}
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-black">{user.name}</p>
            <p className="text-xs text-black">{user.roles}</p>
          </div>
        </div>
      </div>

      <div className='bg-white px-2 py-4 rounded-2xl'>
        <div className="px-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Kelola Laporan Keuangan - Mini Soccer</h2>
        </div>

        <div className="flex justify-end gap-2 px-6 mb-4">
          <a
            href={`/unit/${unit_id}/kelolalaporan/export-pdf`}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Download PDF
          </a>
          <a
            href={`/unit/${unit_id}/kelolalaporan/export-excel`}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Download Excel
          </a>
        </div>


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
                  {/* <td className="px-4 py-3">Rp. {item.nominal.toLocaleString('id-ID')}</td> */}
                  <td className={`px-4 py-3 ${item.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.selisih >= 0 ? '+' : '-'} Rp. {Math.abs(item.selisih).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">Rp. {item.saldo.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end gap-2 items-center">
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
              <ChevronLeft className="w-4 h-4" />
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
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
