import { FooterInfo } from '@/components/footer-dashboard';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, FileText, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface Legalitas {
    id: number;
    name: string;
    number: string;
    document_image?: string;
}

export interface PageProps {
    flash?: {
        success?: string;
        error?: string;
        info?: { message?: string; method?: string };
    };
    legalitas?: Legalitas[];
    [key: string]: any;
}

export default function LegalitasBumdes() {
    const { legalitas = [], flash } = usePage<PageProps>().props;

    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Legalitas | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [legalitasToDelete, setLegalitasToDelete] = useState<Legalitas | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);

    useEffect(() => {
        if (flash?.info?.message) {
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
        } else if (flash?.success) {
            setFlashMessage(flash.success);
            setFlashMethod('create');
            setFlashColor('bg-green-600');

            const timeout = setTimeout(() => {
                setFlashMessage(null);
                setFlashMethod('');
            }, 3000);

            return () => clearTimeout(timeout);
        } else if (flash?.error) {
            setFlashMessage(flash.error);
            setFlashMethod('error');
            setFlashColor('bg-red-600');

            const timeout = setTimeout(() => {
                setFlashMessage(null);
                setFlashMethod('');
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [flash]);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        number: '',
        document_image: null as File | null,
    });

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

    const handleOpenModal = (item?: Legalitas) => {
        if (item) {
            setSelected(item);
            setData({
                name: item.name,
                number: item.number,
                document_image: null,
            });
            setPreviewImage(item.document_image ? `/storage/${item.document_image}` : null);
            setImageRemoved(false);
        } else {
            setSelected(null);
            reset();
            setPreviewImage(null);
            setImageRemoved(false);
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('number', data.number);
        if (data.document_image) formData.append('document_image', data.document_image);

        if (selected) {
            router.put(route('legalitas.update', selected.id), formData, {
                onSuccess: () => closeModal(),
            });
        } else {
            router.post(route('legalitas.store'), formData, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openDeleteModal = (item: Legalitas) => {
        setLegalitasToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setLegalitasToDelete(null);
    };

    const confirmDelete = () => {
        if (!legalitasToDelete) return;

        router.delete(route('legalitas.destroy', legalitasToDelete.id), {
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

    return (
        <AppLayout>
            <Head title="Legalitas BUMDes" />

            {/* Flash Message */}
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
                            <h1 className="text-3xl font-bold text-gray-900">Legalitas BUMDes</h1>
                            <p className="mt-2 text-gray-600">Kelola dokumen legalitas Badan Usaha Milik Desa</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Legalitas
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
                                    <p className="text-3xl font-bold text-gray-900">{legalitas.length}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Dengan Dokumen</p>
                                    <p className="text-3xl font-bold text-gray-900">{legalitas.filter((item) => item.document_image).length}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tanpa Dokumen</p>
                                    <p className="text-3xl font-bold text-gray-900">{legalitas.filter((item) => !item.document_image).length}</p>
                                </div>
                                <div className="rounded-full bg-orange-100 p-3">
                                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Kelengkapan</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {legalitas.length > 0
                                            ? Math.round((legalitas.filter((item) => item.document_image).length / legalitas.length) * 100)
                                            : 0}
                                        %
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Dokumen</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nomor</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status Dokumen</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {legalitas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <FileText className="mb-3 h-12 w-12 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada dokumen legalitas</h3>
                                                    <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan dokumen legalitas pertama.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        legalitas.map((item) => (
                                            <tr key={item.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-blue-100 p-2">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                                                        {item.number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.document_image ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                                Ada Dokumen
                                                            </span>
                                                            <a
                                                                href={`/storage/${item.document_image}`}
                                                                target="_blank"
                                                                className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-600"
                                                                title="Lihat dokumen"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                Lihat
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            Belum Ada
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm text-white transition-colors hover:bg-amber-600"
                                                            title="Edit legalitas"
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
                                                            onClick={() => openDeleteModal(item)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-sm text-white transition-colors hover:bg-red-600"
                                                            title="Hapus legalitas"
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-2xl transform flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900">{selected ? 'Edit Legalitas' : 'Tambah Legalitas Baru'}</h2>
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
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Nama Dokumen *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                        }`}
                                        placeholder="Contoh: Akta Pendirian, SIUP"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Nomor Dokumen *</label>
                                    <input
                                        type="text"
                                        value={data.number}
                                        onChange={(e) => setData('number', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                            errors.number ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                                        }`}
                                        placeholder="Masukkan nomor dokumen"
                                        required
                                    />
                                    {errors.number && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.number}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Upload Dokumen</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setData('document_image', file);
                                            if (file && file.type.startsWith('image/')) {
                                                const url = URL.createObjectURL(file);
                                                setPreviewImage(url);
                                            } else {
                                                setPreviewImage(null);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
                                        accept="image/*"
                                    />

                                    {previewImage && (
                                        <div className="relative mt-4 inline-block">
                                            <img src={previewImage} alt="Preview" className="max-h-48 rounded-lg border border-gray-300 shadow-md" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage(null);
                                                    setData('document_image', null);
                                                    setImageRemoved(true);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="absolute top-2 right-2 rounded-lg bg-red-500 p-2 text-white shadow-md hover:bg-red-600"
                                                title="Hapus gambar"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    {/* Info Card */}
                                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
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
                                                <h4 className="mb-1 font-medium text-blue-900">Tips Upload Dokumen</h4>
                                                <ul className="space-y-1 text-sm text-blue-800">
                                                    <li>• Format yang didukung: JPG, PNG, JPEG</li>
                                                    <li>• Ukuran maksimal file: 5MB</li>
                                                    <li>• Pastikan dokumen jelas dan dapat dibaca</li>
                                                    <li>• Dokumen akan disimpan dengan aman</li>
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
                                    disabled={processing}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 4v5h.582m15.356 2.582A8.985 8.985 0 0121 12a8.966 8.966 0 01-1.226 4.513L18.36 15.82A6.5 6.5 0 109.64 4.18L8.226 2.768A8.985 8.985 0 014 4v5h.582z"
                                                />
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : selected ? (
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

            {/* Delete Confirmation Modal */}
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
                                    Apakah Anda yakin ingin menghapus dokumen legalitas{' '}
                                    <strong className="font-semibold text-gray-800">{legalitasToDelete?.name}</strong>?
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

            <FooterInfo />
        </AppLayout>
    );
}
