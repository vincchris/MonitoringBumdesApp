import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface PemasukanItem {
    id: number;
    tanggal: string;
    penyewa: string;
    durasi: number;
    tipe_penyewa: string;
    tarif_per_jam: number;
    total_bayar: number;
    keterangan: string;
}

interface Props {
    unit_id: number;
    user: {
        id_users: number;
        name: string;
        email: string;
        roles: string;
        image?: string;
    };
    pemasukan: PemasukanItem[];
}

export default function PemasukanMiniSoc({ user, unit_id, pemasukan }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<null | number>(null);

    const {
        data: formData,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        tanggal: '',
        penyewa: '',
        tipe: 'Member',
        durasi: 1,
        tarif: 200000,
        total: 0,
        keterangan: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const method = editing === null ? post : put;
        const url = editing === null
            ? `/unit/${unit_id}/pemasukan`
            : `/unit/${unit_id}/pemasukan/${editing}`;

        method(url, {
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditing(null);
            },
        });
    };

    const handleEdit = (item: PemasukanItem) => {
        setData({
            tanggal: item.tanggal,
            penyewa: item.penyewa,
            tipe: item.tipe_penyewa,
            durasi: item.durasi,
            tarif: item.tarif_per_jam,
            total: item.total_bayar,
            keterangan: item.keterangan,
        });
        setEditing(item.id);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        console.log(`Deleting: /unit/${unit_id}/pemasukan/${id}`);
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/unit/${unit_id}/pemasukan/${id}`);
        }
        console.log("Unit ID:", unit_id);
    };

    return (
        <AppLayout>
            <Head title="Pemasukan Mini Soccer" />

            <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
                <h1 className="text-lg font-semibold text-black">Selamat datang, Pengelola Mini Soccer</h1>
                <div className="flex items-center gap-3">
                    <img src={user.image || '/assets/images/avatar.png'} alt="User Avatar" className="h-9 w-9 rounded-full object-cover" />
                    <div className="text-right">
                        <p className="text-sm font-semibold text-black">{user.name}</p>
                        <p className="mr-3 text-xs text-black">{user.roles}</p>
                    </div>
                </div>
            </div>

            <div className="mt-3 mb-4 flex items-center justify-between px-6">
                <h2 className="text-xl font-semibold text-gray-800">Pemasukan - Mini Soccer</h2>
                <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
                    Tambah pendapatan harian +
                </Button>
            </div>

            {showModal && (
                <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
                    <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
                        <button onClick={() => { setShowModal(false); setEditing(null); }} className="absolute top-4 right-4 text-gray-500 hover:text-black">✕</button>
                        <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit Pendapatan' : 'Tambah Pendapatan'} Mini Soccer</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                <input type="date" className="w-full rounded border bg-gray-100 px-4 py-2 outline-none" value={formData.tanggal} onChange={(e) => setData('tanggal', e.target.value)} required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Penyewa</label>
                                <input type="text" placeholder="Nama penyewa" className="w-full rounded border bg-gray-100 px-4 py-2 outline-none" value={formData.penyewa} onChange={(e) => setData('penyewa', e.target.value)} required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Durasi sewa (jam)</label>
                                <input type="number" className="w-full rounded border bg-gray-100 px-4 py-2 outline-none" value={formData.durasi} onChange={(e) => setData('durasi', Number(e.target.value))} required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Penyewa</label>
                                <select className="w-full rounded border bg-gray-100 px-4 py-2 outline-none" value={formData.tipe} onChange={(e) => {
                                    const tipe = e.target.value;
                                    const tarif = tipe === 'Member' ? 200000 : 300000;
                                    setData('tipe', tipe);
                                    setData('tarif', tarif);
                                }}>
                                    <option value="Member">Member</option>
                                    <option value="Non Member">Umum</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Keterangan</label>
                                <input type="text" className="w-full rounded border bg-gray-100 px-4 py-2 outline-none" value={formData.keterangan} onChange={(e) => setData('keterangan', e.target.value)} />
                            </div>

                            <p className="mt-2 text-sm">
                                Total bayar: <strong>Rp. {(formData.durasi * formData.tarif).toLocaleString('id-ID')}</strong>
                            </p>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-500">
                                    {editing ? 'Update' : 'Tambah'}
                                </Button>
                                <Button type="button" className="bg-gray-300 text-black" onClick={() => { setShowModal(false); setEditing(null); }}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mx-6 overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full bg-white text-sm text-black">
                    <thead className="bg-gray-100 font-semibold text-black">
                        <tr>
                            <th className="px-4 py-3 text-center">No</th>
                            <th className="px-4 py-3 text-center">Tanggal</th>
                            <th className="px-4 py-3 text-center">Penyewa</th>
                            <th className="px-4 py-3 text-center">Durasi (jam)</th>
                            <th className="px-4 py-3 text-center">Tipe penyewa</th>
                            <th className="px-4 py-3 text-center">Tarif per jam</th>
                            <th className="px-4 py-3 text-center">Total bayar</th>
                            <th className="px-4 py-3 text-center">Keterangan</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pemasukan.map((item, i) => (
                            <tr key={i} className="border-t">
                                <td className="px-4 py-3 text-center">{i + 1}</td>
                                <td className="px-4 py-3 text-center">{item.tanggal}</td>
                                <td className="px-4 py-3 text-center">{item.penyewa}</td>
                                <td className="px-4 py-3 text-center">{item.durasi}</td>
                                <td className="px-4 py-3 text-center">{item.tipe_penyewa}</td>
                                <td className="px-4 py-3 text-center">Rp. {item.tarif_per_jam.toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3 text-center">Rp. {item.total_bayar.toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3 text-center">{item.keterangan}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button type="button" onClick={() => handleEdit(item)} className="rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(item.id)} className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700" title="Hapus">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
