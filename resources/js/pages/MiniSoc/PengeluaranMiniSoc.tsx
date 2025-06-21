import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface PengeluaranItem {
    tanggal: string;
    kategori: string;
    deskripsi: string;
    biaya: number;
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
    pengeluaran: PengeluaranItem[];
}

export default function PengeluaranMiniSoc({ user, unit_id, pengeluaran }: Props) {
    const [showModal, setShowModal] = useState(false);

    const {
        data: formData,
        setData,
        post,
        processing,
        reset,
    } = useForm({
        tanggal: '',
        kategori: '',
        deskripsi: '',
        biaya: 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/unit/${unit_id}/pengeluaran`, {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Pengeluaran Mini Soccer" />

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
                <h2 className="text-xl font-semibold text-gray-800">Pengeluaran - Mini Soccer</h2>
                <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
                    Tambah pengeluaran harian +
                </Button>
            </div>

            {/* Modal Input */}
            {showModal && (
                <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
                    <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                            ✕
                        </button>
                        <h2 className="mb-4 text-lg font-semibold">Tambah Pengeluaran</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                    value={formData.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Kategori Pengeluaran</label>
                                <input
                                    type="text"
                                    placeholder="Kategori pengeluaran"
                                    className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                    value={formData.kategori}
                                    onChange={(e) => setData('kategori', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
                                <input
                                    type="number"
                                    className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                    value={formData.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Biaya</label>
                                <input
                                    className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                    value={formData.biaya}
                                    onChange={(e) => setData('biaya', Number(e.target.value))}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-500">
                                    Tambah
                                </Button>
                                <Button type="button" className="bg-gray-300 text-black" onClick={() => setShowModal(false)}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabel Data Pengeluaran */}
            <div className="mx-6 overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full bg-white text-sm text-black">
                    <thead className="bg-gray-100 font-semibold text-black">
                        <tr>
                            <th className="px-4 py-3 text-center">No</th>
                            <th className="px-4 py-3 text-center">Tanggal</th>
                            <th className="px-4 py-3 text-center">Kategori</th>
                            <th className="px-4 py-3 text-center">Nominal</th>
                            <th className="px-4 py-3 text-center">Keterangan</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pengeluaran.map((item, i) => (
                            <tr key={i} className="border-t">
                                <td className="px-4 py-3 text-center">{i + 1}</td>
                                <td className="px-4 py-3 text-center">{item.tanggal}</td>
                                <td className="px-4 py-3 text-center">{item.kategori}</td>
                                <td className="px-4 py-3 text-center">{item.deskripsi}</td>
                                <td className="px-4 py-3 text-center">Rp. {item.biaya.toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button type="button" className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button type="button" className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700" title="Hapus">
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
