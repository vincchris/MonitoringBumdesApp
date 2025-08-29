import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

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

interface TarifOption {
    tipe: string;
    tarif: number;
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
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    pemasukan: PemasukanItem[];
    tarifs: TarifOption[]; // Data tarif langsung dari database
}

interface FlashInfo {
    message?: string;
    method?: 'create' | 'update' | 'delete';
}

export default function PemasukanMiniSoc({ user, unit_id, pemasukan, pagination, tarifs }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { info?: { message?: string; method?: string } };
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
        delete: destroy,
        processing,
        reset,
    } = useForm({
        tanggal: '',
        penyewa: '',
        tipe: '',
        durasi: 1,
        tarif: 0,
        total: 0,
        keterangan: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const method = editing === null ? post : put;
        const url = editing === null ? `/unit/${unit_id}/pemasukan-minisoc` : `/unit/${unit_id}/pemasukan-minisoc/${editing}`;

        method(url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditing(null);
            },
            onError: (err) => {
                console.log('Validation Errors : ', err);
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
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/unit/${unit_id}/pemasukan-minisoc/${id}`);
        }
    };

    // Menggunakan data tarifs yang dikirim dari backend
    const tipeOptions = tarifs || [];

    // Update tarif ketika tipe berubah
    useEffect(() => {
        const selected = tipeOptions.find((opt) => opt.tipe === formData.tipe);
        if (selected) {
            setData('tarif', selected.tarif);
        }
    }, [formData.tipe]);

    // Update total bayar ketika durasi atau tarif berubah
    useEffect(() => {
        const total = formData.durasi * formData.tarif;
        setData('total', total);
    }, [formData.durasi, formData.tarif]);

    return (
        <AppLayout>
            <Head title="Pemasukan Mini Soccer" />

            {/* Improved Flash Message with Icons */}
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

            <div className="rounded-2xl bg-white px-2 py-4">
                <div className="mt-3 mb-4 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Pemasukan - Mini Soccer</h2>
                    <Button
                        onClick={() => {
                            // Cari tipe Member, jika tidak ada ambil yang pertama
                            const memberTarif = tipeOptions.find((opt) => opt.tipe === 'Member') || tipeOptions[0];
                            const today = new Date().toISOString().split('T')[0];

                            if (memberTarif) {
                                setData({
                                    tanggal: today,
                                    penyewa: '',
                                    tipe: memberTarif.tipe,
                                    durasi: 1,
                                    tarif: memberTarif.tarif,
                                    total: memberTarif.tarif * 1, // durasi default 1
                                    keterangan: '',
                                });
                            } else {
                                // Fallback jika tidak ada tarif sama sekali
                                setData({
                                    tanggal: today,
                                    penyewa: '',
                                    tipe: '',
                                    durasi: 1,
                                    tarif: 0,
                                    total: 0,
                                    keterangan: '',
                                });
                            }

                            setShowModal(true);
                            setEditing(null);
                        }}
                        className="bg-blue-700 text-white hover:bg-blue-500"
                    >
                        Tambah pendapatan harian +
                    </Button>
                </div>

                {showModal && (
                    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[4px]">
                        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 text-black shadow-lg">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditing(null);
                                }}
                                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>
                            <h2 className="mb-6 text-lg font-semibold">{editing ? 'Edit Pendapatan' : 'Tambah Pendapatan'} Mini Soccer</h2>
                            <form onSubmit={handleSubmit}>
                                {/* Grid Layout 2 kolom */}
                                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Kolom Kiri */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                            <input
                                                type="date"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                value={formData.tanggal}
                                                onChange={(e) => setData('tanggal', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Penyewa</label>
                                            <input
                                                type="text"
                                                placeholder="Masukkan nama penyewa"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                value={formData.penyewa}
                                                onChange={(e) => setData('penyewa', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Durasi sewa (jam)</label>
                                            <input
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                placeholder="0"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                value={formData.durasi}
                                                onChange={(e) => setData('durasi', Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Kolom Kanan */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Penyewa</label>
                                            <select
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                value={formData.tipe}
                                                onChange={(e) => setData('tipe', e.target.value)}
                                                required
                                            >
                                                <option value="">Pilih Tipe Penyewa</option>
                                                {tipeOptions.map((opt) => (
                                                    <option key={opt.tipe} value={opt.tipe}>
                                                        {opt.tipe} - Rp. {opt.tarif.toLocaleString('id-ID')}/jam
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Tarif per jam</label>
                                            <input
                                                type="text"
                                                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-200 px-4 py-2.5 text-gray-600 outline-none"
                                                value={`Rp. ${formData.tarif.toLocaleString('id-ID')}`}
                                                readOnly
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Keterangan</label>
                                            <input
                                                type="text"
                                                placeholder="Keterangan (opsional)"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                value={formData.keterangan}
                                                onChange={(e) => setData('keterangan', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Bayar - Full Width */}
                                <div className="mb-6">
                                    <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mb-1 text-sm font-medium text-blue-700">Total Pembayaran</p>
                                                <p className="text-2xl font-bold text-blue-800">Rp. {formData.total.toLocaleString('id-ID')}</p>
                                            </div>
                                            <div className="text-right text-sm text-blue-600">
                                                <p>
                                                    {formData.durasi} jam × Rp. {formData.tarif.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6 py-2.5"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditing(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-700 px-6 py-2.5 text-white hover:bg-blue-600 disabled:opacity-70"
                                    >
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Menyimpan...
                                            </div>
                                        ) : editing ? (
                                            'Update Data'
                                        ) : (
                                            'Tambah Data'
                                        )}
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
                            {pemasukan.length > 0 ? (
                                pemasukan.map((item, i) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 text-center">{(pagination.current_page - 1) * pagination.per_page + i + 1}</td>
                                        <td className="px-4 py-3 text-center">{item.tanggal}</td>
                                        <td className="px-4 py-3 text-center">{item.penyewa}</td>
                                        <td className="px-4 py-3 text-center">{item.durasi}</td>
                                        <td className="px-4 py-3 text-center">{item.tipe_penyewa}</td>
                                        <td className="px-4 py-3 text-center">Rp. {item.tarif_per_jam.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">Rp. {item.total_bayar.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">{item.keterangan || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(item)}
                                                    className="rounded bg-yellow-500 px-2 py-1 text-white transition-colors hover:bg-yellow-600"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded bg-red-600 px-2 py-1 text-white transition-colors hover:bg-red-700"
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
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                        Belum ada data pemasukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t px-4 py-3">
                            <div className="text-sm text-gray-700">
                                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} -{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
                            </div>

                            <div className="flex items-center gap-2">
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

                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    let page;
                                    if (pagination.last_page <= 5) {
                                        page = i + 1;
                                    } else if (pagination.current_page <= 3) {
                                        page = i + 1;
                                    } else if (pagination.current_page >= pagination.last_page - 2) {
                                        page = pagination.last_page - 4 + i;
                                    } else {
                                        page = pagination.current_page - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant={page === pagination.current_page ? 'default' : 'outline'}
                                            onClick={() => {
                                                router.get(route().current()!, { page }, { preserveState: true });
                                            }}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}

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
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
