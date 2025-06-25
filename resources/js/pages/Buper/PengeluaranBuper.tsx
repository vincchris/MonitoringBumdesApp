import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import { CheckCircle, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpenseItem {
    id: number;
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
    pengeluaran: ExpenseItem[];
}

interface FlashInfo {
    message?: string;
    method?: 'create' | 'update' | 'delete';
}

export default function PengeluaranBuper({ user, unit_id, pengeluaran }: Props) {
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
        data,
        setData,
        post,
        put,
        reset,
    } = useForm({
        tanggal: '',
        kategori: '',
        deskripsi: '',
        biaya: 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const method = editing === null ? post : put;
        const url = editing === null
            ? `/unit/${unit_id}/pengeluaran`
            : `/unit/${unit_id}/pengeluaran/${editing}`;

        method(url, {
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditing(null);
            },
        });
    };

    const handleEdit = (item: ExpenseItem) => {
        setData({
            tanggal: item.tanggal,
            kategori: item.kategori,
            deskripsi: item.deskripsi,
            biaya: item.biaya,
        });
        setEditing(item.id);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/unit/${unit_id}/pengeluaran/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Pengeluaran Buper" />
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

            <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
                <h1 className="text-lg font-semibold text-black">Selamat datang, Pengelola Bumi Perkemahan</h1>
                <div className="flex items-center gap-3">
                    <img
                        src={user.image || '/assets/images/avatar.png'}
                        alt="User Avatar"
                        className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="text-right">
                        <p className="text-sm font-semibold text-black">{user.name}</p>
                        <p className="mr-3 text-xs text-black">{user.roles}</p>
                    </div>
                </div>
            </div>

            <div className='bg-white px-2 py-4 rounded-2xl'>
                <div className="mt-3 mb-4 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Pengeluaran - Bumi Perkemahan</h2>
                    <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
                        Tambah pengeluaran harian +
                    </Button>
                </div>




                {showModal && (
                    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
                        <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditing(null);
                                }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={data.tanggal}
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
                                        value={data.kategori}
                                        onChange={(e) => setData('kategori', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
                                    <input
                                        type="text"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Biaya</label>
                                    <input
                                        type="number"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={data.biaya}
                                        onChange={(e) => setData('biaya', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-500">
                                        Simpan
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditing(null);
                                        }}
                                        className="bg-gray-300"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="mx-6 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-sm bg-white text-black">
                        <thead className="bg-gray-100 text-black">
                            <tr>
                                <th className="px-4 py-3 text-center">No</th>
                                <th className="px-4 py-3 text-center">Tanggal</th>
                                <th className="px-4 py-3 text-center">Kategori</th>
                                <th className="px-4 py-3 text-center">Deskripsi</th>
                                <th className="px-4 py-3 text-center">Biaya</th>
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
                                    <td className="px-4 py-3 text-center">Rp {item.biaya.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-white">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
