import { Button } from "@/components/ui/button";
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { FormEvent } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Selamat datang, Pengelola Mini soccer', href: '/dashboard' },
];

interface TarifItem {
  id: number;
  tanggal: string;
  penyewa: string;
  tipe: string;
  durasi: number;
  tarif: number;
  total: number;
  keterangan: string;
}

interface Props extends PageProps {
  data: TarifItem[];
}

export default function PemasukanMiniSoc({ auth, data }: Props) {
  const user = auth.user;

  const { data: formData, setData, post, processing, reset } = useForm({
    tanggal: '',
    penyewa: '',
    tipe: 'Member',
    durasi: 1,
    tarif: 0,
    total: 0,
    keterangan: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/pemasukan', {
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pemasukan Mini Soccer" />

      {/* Header */}
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

      {/* Form input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mx-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="date" className="input" value={formData.tanggal} onChange={e => setData('tanggal', e.target.value)} required />
          <input type="text" placeholder="Nama Penyewa" className="input" value={formData.penyewa} onChange={e => setData('penyewa', e.target.value)} required />
          <select className="input" value={formData.tipe} onChange={e => setData('tipe', e.target.value)}>
            <option>Member</option>
            <option>Non Member</option>
          </select>
          <input type="number" placeholder="Durasi (jam)" className="input" value={formData.durasi} onChange={e => setData('durasi', Number(e.target.value))} required />
          <input type="number" placeholder="Tarif per jam" className="input" value={formData.tarif} onChange={e => setData('tarif', Number(e.target.value))} required />
          <input type="number" placeholder="Total bayar" className="input" value={formData.durasi * formData.tarif} onChange={e => setData('total', Number(e.target.value))} readOnly />
        </div>
        <textarea placeholder="Keterangan (opsional)" className="input mt-4 w-full" value={formData.keterangan} onChange={e => setData('keterangan', e.target.value)} />
        <div className="mt-4 text-right">
          <Button type="submit" disabled={processing} className="bg-blue-600 text-white">
            Simpan Pemasukan
          </Button>
        </div>
      </form>

      {/* Tabel data */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 mx-6">
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
                <td className="px-4 py-3">Rp. {item.tarif.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">Rp. {item.total.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">{item.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
