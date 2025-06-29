import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface PemasukanItem {
    id: number;
    tanggal: string;
    penyewa: string;
    lokasi_kios: string;
    durasi_sewa: number;
    biaya_sewa: number;
    total_pembayaran: number;
}

interface Tarif {
    id_tarif: number;
    category_name: string;
    harga_per_unit: number;
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
    tarifs: Tarif[];
}

export default function PemasukanSewKios({ user, unit_id, pemasukan, tarifs }: Props) {
    const { flash, errors } = usePage().props as unknown as {
        flash: { info?: { message?: string; method?: string } };
        errors: Record<string, string>;
    };

    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!flash?.info?.message) return;

        const { message, method } = flash.info;

        setFlashMessage(message || '');
        setFlashMethod(method || '');

        switch (method) {
            case 'delete':
                setFlashColor('bg-red-600');
                break;
            case 'update':
                setFlashColor('bg-blue-600');
                break;
            case 'create':
            default:
                setFlashColor('bg-green-600');
                break;
        }

        const timeout = setTimeout(() => {
            setFlashMessage(null);
            setFlashMethod('');
        }, 3000);

        return () => clearTimeout(timeout);
    }, [flash]);

    // Function to render the appropriate icon based on flash method
    const renderFlashIcon = () => {
        switch (flashMethod) {
            case 'create':
                return <CheckCircle className="h-5 w-5 text-white" />;
            case 'update':
                return <RefreshCw className="h-5 w-5 text-white" />;
            case 'delete':
                return <Trash2 className="h-5 w-5 text-white" />;
            default:
                return <CheckCircle className="h-5 w-5 text-white" />;
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<null | number>(null);

    const {
        data: formData,
        setData,
        post,
        put,
        processing,
        reset,
        errors: formErrors,
    } = useForm({
        tanggal: '',
        penyewa: '',
        lokasi_kios: '',
        durasi_sewa: 1,
        biaya_sewa: 0,
        keterangan: '',
    });

    // Update biaya_sewa ketika lokasi_kios berubah
    useEffect(() => {
        if (formData.lokasi_kios) {
            const selectedTarif = tarifs.find(t => t.category_name === formData.lokasi_kios);
            if (selectedTarif) {
                setData('biaya_sewa', selectedTarif.harga_per_unit);
            }
        }
    }, [formData.lokasi_kios]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const method = editing === null ? post : put;
        const url = editing === null
            ? `/unit/${unit_id}/pemasukan-sewakios`
            : `/unit/${unit_id}/pemasukan-sewakios/${editing}`;

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditing(null);
            },
            onError: (err) => {
                console.log("Validation Errors:", err);
            }
        });
    };

    const handleEdit = (item: PemasukanItem) => {
        setData({
            tanggal: item.tanggal,
            penyewa: item.penyewa,
            lokasi_kios: item.lokasi_kios,
            durasi_sewa: item.durasi_sewa,
            biaya_sewa: item.biaya_sewa,
            keterangan: '',
        });
        setEditing(item.id);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/unit/${unit_id}/pemasukan-sewakios/${id}`);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditing(null);
        reset();
    };

    return (
        <AppLayout>
            <Head title="Pemasukan Sewa Kios" />

            {/* Flash Message */}
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

            <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
                <h1 className="text-lg font-semibold text-black">Selamat datang, Pengelola Sewa Kios</h1>
                <div className="flex items-center gap-3">
                    <img src={user.image || '/assets/images/avatar.png'} alt="User Avatar" className="h-9 w-9 rounded-full object-cover" />
                    <div className="text-right">
                        <p className="text-sm font-semibold text-black">{user.name}</p>
                        <p className="mr-3 text-xs text-black">{user.roles}</p>
                    </div>
                </div>
            </div>

            <div className='bg-white px-2 py-4 rounded-2xl'>
                <div className="mt-3 mb-4 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Pemasukan - Sewa Kios</h2>
                    <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
                        Tambah Pemasukan +
                    </Button>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
                        <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>
                            <h2 className="mb-4 text-lg font-semibold">
                                {editing ? 'Edit Pemasukan' : 'Tambah Pemasukan'} Sewa Kios
                            </h2>

                            {/* Display errors */}
                            {Object.keys(formErrors).length > 0 && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
                                    <ul>
                                        {Object.entries(formErrors).map(([key, value]) => (
                                            <li key={key}>{value}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

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
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Nama Penyewa</label>
                                    <input
                                        type="text"
                                        placeholder="Nama penyewa"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.penyewa}
                                        onChange={(e) => setData('penyewa', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi Kios</label>
                                    <select
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.lokasi_kios}
                                        onChange={(e) => setData('lokasi_kios', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Lokasi Kios</option>
                                        {tarifs.map((tarif) => (
                                            <option key={tarif.id_tarif} value={tarif.category_name}>
                                                {tarif.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Durasi Sewa (tahun)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.durasi_sewa}
                                        onChange={(e) => setData('durasi_sewa', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Biaya Sewa per Tahun</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.biaya_sewa}
                                        onChange={(e) => setData('biaya_sewa', Number(e.target.value))}
                                        required
                                        readOnly={formData.lokasi_kios !== ''}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Keterangan</label>
                                    <input
                                        type="text"
                                        placeholder="Keterangan tambahan (opsional)"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                    />
                                </div>

                                <p className="mt-2 text-sm">
                                    Total bayar: <strong>Rp. {(formData.durasi_sewa * formData.biaya_sewa).toLocaleString('id-ID')}</strong>
                                </p>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-500">
                                        {processing ? 'Memproses...' : (editing ? 'Update' : 'Tambah')}
                                    </Button>
                                    <Button
                                        type="button"
                                        className="bg-gray-300 text-black"
                                        onClick={handleCloseModal}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="mx-6 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full bg-white text-sm text-black">
                        <thead className="bg-gray-100 font-semibold text-black">
                            <tr>
                                <th className="px-4 py-3 text-center">No</th>
                                <th className="px-4 py-3 text-center">Tanggal</th>
                                <th className="px-4 py-3 text-center">Penyewa</th>
                                <th className="px-4 py-3 text-center">Lokasi Kios</th>
                                <th className="px-4 py-3 text-center">Durasi (tahun)</th>
                                <th className="px-4 py-3 text-center">Biaya per Tahun</th>
                                <th className="px-4 py-3 text-center">Total Pembayaran</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pemasukan.length > 0 ? (
                                pemasukan.map((item, i) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-3 text-center">{i + 1}</td>
                                        <td className="px-4 py-3 text-center">{item.tanggal}</td>
                                        <td className="px-4 py-3 text-center">{item.penyewa}</td>
                                        <td className="px-4 py-3 text-center">{item.lokasi_kios}</td>
                                        <td className="px-4 py-3 text-center">{item.durasi_sewa}</td>
                                        <td className="px-4 py-3 text-center">Rp. {item.biaya_sewa.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">Rp. {item.total_pembayaran.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(item)}
                                                    className="rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        Belum ada data pemasukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}