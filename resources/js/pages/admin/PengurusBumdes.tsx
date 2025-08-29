import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Pengurus {
    id: number;
    nama_pengurus: string;
    jabatan: string;
    jenis_kelamin: string;
    pekerjaan?: string;
    kategori: string;
    foto_pengurus?: string;
}

export default function PengurusBumdes() {
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

    const { pengurus_bumdes } = usePage().props as unknown as { pengurus_bumdes: Pengurus[] };
    const [isOpen, setIsOpen] = useState(false);
    const [editingData, setEditingData] = useState<Pengurus | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pengurusToDelete, setPengurusToDelete] = useState<Pengurus | null>(null);

    const { data, setData, post, put, reset, errors, progress } = useForm({
        nama_pengurus: '',
        jabatan: '',
        jenis_kelamin: 'L',
        pekerjaan: '',
        kategori: '',
        foto_pengurus: null as File | null,
    });

    const openModal = (pengurus?: Pengurus) => {
        if (pengurus) {
            setEditingData(pengurus);
            setData({
                nama_pengurus: pengurus.nama_pengurus,
                jabatan: pengurus.jabatan,
                jenis_kelamin: pengurus.jenis_kelamin,
                pekerjaan: pengurus.pekerjaan || '',
                kategori: pengurus.kategori,
                foto_pengurus: null,
            });
            // Set existing image preview if available
            setImagePreview(pengurus.foto_pengurus ? `/storage/${pengurus.foto_pengurus}` : null);
        } else {
            setEditingData(null);
            reset();
            setImagePreview(null);
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        reset();
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto_pengurus', file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('foto_pengurus', null);
            setImagePreview(editingData?.foto_pengurus || null);
        }
    };

    const removeImage = () => {
        setData('foto_pengurus', null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingData) {
            put(route('pengurus-bumdes.update', editingData.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('pengurus-bumdes.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (pengurus: Pengurus) => {
        setPengurusToDelete(pengurus);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setPengurusToDelete(null);
    };

    const confirmDelete = () => {
        if (!pengurusToDelete) return;

        router.delete(route('pengurus-bumdes.destroy', pengurusToDelete.id), {
            onSuccess: () => {
                closeDeleteModal();
                setFlashMessage('Data berhasil dihapus.');
                setFlashMethod('delete');
                setFlashColor('bg-red-600');

                setTimeout(() => {
                    setFlashMessage(null);
                    setFlashMethod('');
                }, 3000);
            },
            onError: (err) => {
                console.error('Gagal menghapus:', err);
                closeDeleteModal();
                setFlashMessage('Terjadi kesalahan saat menghapus data.');
                setFlashMethod('error');
                setFlashColor('bg-red-600');

                setTimeout(() => {
                    setFlashMessage(null);
                    setFlashMethod('');
                }, 3000);
            },
        });
    };

    const getGenderDisplay = (gender: string) => {
        return gender === 'L' ? 'Laki-laki' : 'Perempuan';
    };

    const getGenderIcon = (gender: string) => {
        return gender === 'L' ? '👨' : '👩';
    };

    return (
        <AppLayout>
            <Head title="Pengurus BUMDes" />

            {/* Improved Flash Message with Icons */}
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}
            <div className="min-h-screen rounded-lg bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Pengurus BUMDes</h1>
                            <p className="mt-2 text-gray-600">Kelola data pengurus Badan Usaha Milik Desa</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Data
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Pengurus</p>
                                    <p className="text-3xl font-bold text-gray-900">{pengurus_bumdes.length}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Laki-laki</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {pengurus_bumdes.filter((p) => p.jenis_kelamin === 'L').length}
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <span className="text-2xl">👨</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Perempuan</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {pengurus_bumdes.filter((p) => p.jenis_kelamin === 'P').length}
                                    </p>
                                </div>
                                <div className="rounded-full bg-pink-100 p-3">
                                    <span className="text-2xl">👩</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Dengan Foto</p>
                                    <p className="text-3xl font-bold text-gray-900">{pengurus_bumdes.filter((p) => p.foto_pengurus).length}</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Foto</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Jabatan</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Gender</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pekerjaan</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kategori</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pengurus_bumdes.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data pengurus</h3>
                                                    <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan pengurus pertama.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pengurus_bumdes.map((p) => (
                                            <tr key={p.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                                                        {p.foto_pengurus ? (
                                                            <img
                                                                src={`/storage/${p.foto_pengurus}`}
                                                                alt={p.nama_pengurus}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-lg font-semibold text-white">
                                                                {p.nama_pengurus.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{p.nama_pengurus}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                        {p.jabatan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span>{getGenderIcon(p.jenis_kelamin)}</span>
                                                        <span className="text-sm text-gray-900">{getGenderDisplay(p.jenis_kelamin)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{p.pekerjaan || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                        {p.kategori}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal(p)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm text-white transition-colors hover:bg-amber-600"
                                                            title="Edit pengurus"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(p)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-sm text-white transition-colors hover:bg-red-600"
                                                            title="Hapus pengurus"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-3xl transform flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900">{editingData ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}</h2>
                            <button
                                onClick={closeModal}
                                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Nama Pengurus *</label>
                                        <input
                                            type="text"
                                            value={data.nama_pengurus}
                                            onChange={(e) => setData('nama_pengurus', e.target.value)}
                                            className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                                errors.nama_pengurus ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                            placeholder="Masukkan nama pengurus"
                                        />
                                        {errors.nama_pengurus && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {errors.nama_pengurus}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Jabatan *</label>
                                        <input
                                            type="text"
                                            value={data.jabatan}
                                            onChange={(e) => setData('jabatan', e.target.value)}
                                            className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                                errors.jabatan ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                            placeholder="Contoh: Direktur, Sekretaris"
                                        />
                                        {errors.jabatan && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {errors.jabatan}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Jenis Kelamin *</label>
                                        <select
                                            value={data.jenis_kelamin}
                                            onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="L">👨 Laki-laki</option>
                                            <option value="P">👩 Perempuan</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Pekerjaan</label>
                                        <input
                                            type="text"
                                            value={data.pekerjaan}
                                            onChange={(e) => setData('pekerjaan', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Pekerjaan utama"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Kategori *</label>
                                        <input
                                            type="text"
                                            value={data.kategori}
                                            onChange={(e) => setData('kategori', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Kategori pengurus"
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Image Upload */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Foto Pengurus</label>

                                        {/* Image Preview Area */}
                                        <div className="mb-4">
                                            {imagePreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="h-64 w-full rounded-lg border-2 border-dashed border-gray-300 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                                                        title="Hapus foto"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100">
                                                    <svg
                                                        className="mb-4 h-12 w-12 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <p className="text-center text-gray-500">
                                                        <span className="font-medium">Klik untuk upload foto</span>
                                                        <br />
                                                        <span className="text-xs">PNG, JPG hingga 2MB</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
                                        />

                                        {progress && (
                                            <div className="mt-2">
                                                <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                                                    <span>Uploading...</span>
                                                    <span>{progress.percentage}%</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-200">
                                                    <div
                                                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                                        style={{ width: `${progress.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Info Card */}
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <svg
                                                className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <div>
                                                <h4 className="mb-1 font-medium text-blue-900">Tips Upload Foto</h4>
                                                <ul className="space-y-1 text-sm text-blue-800">
                                                    <li>• Gunakan foto dengan resolusi minimal 300x300px</li>
                                                    <li>• Format yang didukung: JPG, PNG, WEBP</li>
                                                    <li>• Ukuran maksimal file: 2MB</li>
                                                    <li>• Foto akan otomatis di-resize jika terlalu besar</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {editingData ? (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            Update Data
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Simpan Data
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DELETE - BARU */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <TriangleAlert className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Konfirmasi Penghapusan
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Apakah Anda yakin ingin menghapus data pengurus bernama{' '}
                                    <strong className="font-semibold text-gray-800">{pengurusToDelete?.nama_pengurus}</strong>?
                                    <br />
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                                onClick={closeDeleteModal}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                                onClick={confirmDelete}
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
