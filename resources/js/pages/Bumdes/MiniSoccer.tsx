import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';

export default function MiniSoc() {
  const laporanDummy = Array(6).fill({
    tanggal: '07 Februari 2025',
    keterangan: 'Laporan Transaksi penjualan',
  });

  const [showModalSaldo, setShowModalSaldo] = useState(false);
  const [showModalTarif, setShowModalTarif] = useState(false);

  const [tanggal, setTanggal] = useState('');
  const [penyewa, setPenyewa] = useState('Reguler');
  const [saldoAwal, setSaldoAwal] = useState('120000');
  const [tarifAwal, setTarifAwal] = useState('250000');

  return (
    <AppLayout>
      <Head title="Unit Usaha - Mini Soccer" />

      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Unit usaha - Mini soccer</h1>

        {/* Ringkasan Kartu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Saldo */}
          <div className="rounded-xl bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600">Saldo saat ini</p>
            <p className="text-xl font-semibold text-black mt-1">Rp. 120,000</p>
            <p className="text-sm text-yellow-500 mt-1">Terakhir diubah : 05-06-2025</p>
            <Button onClick={() => setShowModalSaldo(true)} className="mt-3 bg-blue-500 text-white hover:bg-blue-600">
              Atur saldo awal
            </Button>
          </div>

          {/* Tarif sewa */}
          <div className="rounded-xl bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600">Tarif sewa per kegiatan</p>
            <p className="text-sm text-yellow-500 mt-1">Terakhir diubah : 05-06-2025</p>
            <div className="mt-3 flex gap-2">
              <Button className="bg-blue-500 text-white hover:bg-blue-600">Lihat tarif sewa</Button>
              <Button onClick={() => setShowModalTarif(true)} className="bg-blue-500 text-white hover:bg-blue-600">
                Atur tarif sewa
              </Button>
            </div>
          </div>

          {/* Ringkasan Bulan */}
          <div className="rounded-xl bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600 mb-1">Ringkasan bulan ini</p>
            <p>Pendapatan: <span className="font-semibold">Rp 3.250.000</span></p>
            <p>Pengeluaran: <span className="font-semibold">Rp 850.000</span></p>
            <p className="text-green-600 font-semibold">Selisih: +Rp 2.400.000</p>
          </div>
        </div>

        {/* Filter Tanggal */}
        <div className="mb-4 flex justify-end">
          <input
            type="date"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none"
          />
        </div>

        {/* Tabel Laporan */}
        <div className="rounded-xl border border-gray-200 overflow-x-auto bg-white">
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3 text-center">Tanggal</th>
                <th className="px-4 py-3 text-center">Keterangan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {laporanDummy.map((item, index) => (
                <tr key={index} className="border-t text-center">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{item.tanggal}</td>
                  <td className="px-4 py-3">{item.keterangan}</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                      onClick={() => router.visit('/detaillaporanminisoc')}
                    >
                      Detail Laporan
                    </Button>
                    <Button className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 flex items-center gap-1">
                      <FileDown className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 flex items-center gap-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {laporanDummy.length === 0 && (
            <div className="p-6 text-center text-gray-500">Belum ada data laporan transaksi</div>
          )}
        </div>
      </div>

      {/* Modal: Saldo */}
      {showModalSaldo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowModalSaldo(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Atur saldo awal Mini soccer</h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded border bg-gray-100 px-4 py-2 outline-none text-gray-800"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-1">Nominal saldo awal</label>
              <input
                type="text"
                value={`Rp. ${Number(saldoAwal).toLocaleString('id-ID')}`}
                readOnly
                className="w-full rounded border bg-gray-100 px-4 py-2 outline-none text-gray-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
              <Button className="bg-gray-300 hover:bg-gray-400 text-black" onClick={() => setShowModalSaldo(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tarif Sewa */}
      {showModalTarif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowModalTarif(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Atur tarif sewa Mini soccer</h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Berlaku Mulai Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded border bg-gray-100 px-4 py-2 outline-none text-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Jenis penyewa</label>
              <select
                value={penyewa}
                onChange={(e) => setPenyewa(e.target.value)}
                className="w-full rounded border bg-gray-100 px-4 py-2 outline-none text-gray-800"
              >
                <option value="Reguler">Reguler</option>
                <option value="Member">Member</option>
                <option value="Komunitas">Komunitas</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-1">Tarif per jam</label>
              <input
                type="text"
                value={`Rp. ${Number(tarifAwal).toLocaleString('id-ID')}`}
                readOnly
                className="w-full rounded border bg-gray-100 px-4 py-2 outline-none text-gray-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
              <Button className="bg-gray-300 hover:bg-gray-400 text-black" onClick={() => setShowModalTarif(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
