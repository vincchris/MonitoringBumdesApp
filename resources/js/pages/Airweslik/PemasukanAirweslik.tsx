import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Pencil, RefreshCw, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface PemasukanItem {
    id: number;
    tanggal: string;
    pelanggan: string;
    kategori: string;
    pemakaian: number;
    tarif: number;
    total: number;
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
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    pemasukan: PemasukanItem[];
    tarifs: Tarif[];
}

export default function PemasukanAirweslik({ user, unit_id, pemasukan, tarifs, pagination }: Props) {
    console.log('Data pemasukan dari backend:', pemasukan);
    console.log('Data tarifs:', tarifs);

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
        pelanggan: '',
        kategori: '',
        pemakaian: 1,
        tarif: 0,
        total: '',
    });

    // Update biaya_sewa ketika lokasi_kios berubah
    // useEffect(() => {
    //     if (formData.lokasi_kios) {
    //         const selectedTarif = tarifs.find(t => t.category_name === formData.lokasi_kios);
    //         if (selectedTarif) {
    //             setData('biaya_sewa', selectedTarif.harga_per_unit);
    //         }
    //     }
    // }, [formData.lokasi_kios]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const method = editing === null ? post : put;
        const url = editing === null ? `/unit/${unit_id}/pemasukan-airweslik` : `/unit/${unit_id}/pemasukan-airweslik/${editing}`;

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditing(null);
            },
            onError: (err) => {
                console.log('Validation Errors:', err);
            },
        });
    };

    const handleEdit = (item: PemasukanItem) => {
        setData({
            tanggal: item.tanggal,
            pelanggan: item.pelanggan,
            kategori: item.kategori,
            pemakaian: item.pemakaian,
            tarif: item.tarif,
            total: '',
        });
        setEditing(item.id);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/unit/${unit_id}/pemasukan-airweslik/${id}`);
        }
    };

    // Function to handle pagination navigation
    const handlePageChange = (page: number) => {
        router.get(
            `/unit/${unit_id}/pemasukan-airweslik`,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditing(null);
        reset();
    };

    return (
        <AppLayout>
            <Head title="Pemasukan Air Weslik" />

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
                <h1 className="text-lg font-semibold text-black">Selamat datang, Pengelola Air Weslik</h1>
            </div>

            <div className="rounded-2xl bg-white px-2 py-4">
                <div className="mt-3 mb-4 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Pemasukan - Air Weslik</h2>
                    <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
                        Tambah Pemasukan +
                    </Button>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
                        <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
                            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                                ✕
                            </button>
                            <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit Pemasukan' : 'Tambah Pemasukan'} Sewa Kios</h2>

                            {/* Display errors */}
                            {Object.keys(formErrors).length > 0 && (
                                <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
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
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Nama Pelanggan</label>
                                    <input
                                        type="text"
                                        placeholder="Nama pelanggan"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.pelanggan}
                                        onChange={(e) => setData('pelanggan', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
                                    <select
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.kategori}
                                        onChange={(e) => {
                                            const selected = e.target.value;
                                            setData('kategori', selected);
                                            const tarif = tarifs.find((t) => t.category_name === selected);
                                            if (tarif) setData('tarif', tarif.harga_per_unit);
                                        }}
                                        required
                                    >
                                        <option value="">Pilih kategori</option>
                                        {tarifs.map((tarif) => (
                                            <option key={tarif.id_tarif} value={tarif.category_name}>
                                                {tarif.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Pemakaian (m³)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.pemakaian}
                                        onChange={(e) => setData('pemakaian', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Tarif / m³</label>
                                    <input
                                        type="number"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.tarif}
                                        onChange={(e) => setData('tarif', Number(e.target.value))}
                                        readOnly
                                    />
                                </div>

                                <p className="mt-2 text-sm">
                                    Total bayar: <strong>Rp. {(formData.pemakaian * formData.tarif).toLocaleString('id-ID')}</strong>
                                </p>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-500">
                                        {processing ? 'Memproses...' : editing ? 'Update' : 'Tambah'}
                                    </Button>
                                    <Button type="button" className="bg-gray-300 text-black" onClick={handleCloseModal}>
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
                                <th className="px-4 py-3 text-center">Pelanggan</th>
                                <th className="px-4 py-3 text-center">Kategori</th>
                                <th className="px-4 py-3 text-center">Pemakaian (m³)</th>
                                <th className="px-4 py-3 text-center">Tarif/m³</th>
                                <th className="px-4 py-3 text-center">Total Bayar</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pemasukan.length > 0 ? (
                                pemasukan.map((item, i) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-3 text-center">{i + 1}</td>
                                        <td className="px-4 py-3 text-center">{item.tanggal}</td>
                                        <td className="px-4 py-3 text-center">{item.pelanggan}</td>
                                        <td className="px-4 py-3 text-center">{item.kategori}</td>
                                        <td className="px-4 py-3 text-center">{item.pemakaian} m³</td> {/* Pastikan menampilkan nilai yang benar */}
                                        <td className="px-4 py-3 text-center">Rp. {item.tarif.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">Rp. {item.total.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
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

                    {/* Fixed Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t px-4 py-3">
                            <div className="text-sm text-gray-700">
                                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} -{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
                            </div>

                            <div className="flex items-center gap-2 text-black">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
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
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={page === pagination.current_page ? 'bg-blue-700 text-white' : ''}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    className="flex items-center gap-1"
                                >
                                    Next
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
