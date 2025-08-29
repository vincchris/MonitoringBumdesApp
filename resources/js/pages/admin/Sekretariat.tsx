import { FooterInfo } from '@/components/footer-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Image, RefreshCw, Trash2, Upload, X, XCircle } from 'lucide-react';
import React, { ChangeEvent, useEffect, useState } from 'react';

export default function Sekretariat() {
    const { desa, bumdes, flash } = usePage<{
        desa: { logo_desa: string | null; foto_kantor_desa: string | null };
        bumdes: { logo_bumdes: string | null; foto_sekretariat: string | null };
        flash: { info?: { message?: string; method?: string } };
    }>().props;

    const { data, setData, post, processing, errors } = useForm({
        logo_desa: null as File | null,
        foto_kantor_desa: null as File | null,
        logo_bumdes: null as File | null,
        foto_sekretariat: null as File | null,
        logo_desa_preview: '',
        foto_kantor_desa_preview: '',
        logo_bumdes_preview: '',
        foto_sekretariat_preview: '',
    });

    // State untuk notifikasi flash info
    const [flashMessage, setFlashMessage] = useState<string | null>(null);
    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');

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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof data) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData(field, file);
            const reader = new FileReader();
            reader.onload = () => {
                const previewField = `${field}_preview` as keyof typeof data;
                setData(previewField, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = (field: keyof typeof data) => {
        setData(field, null);
        const previewField = `${field}_preview` as keyof typeof data;
        setData(previewField, '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sekretariat.store'), {
            forceFormData: true,
            onSuccess: () => {
                setData({
                    logo_desa: null,
                    foto_kantor_desa: null,
                    logo_bumdes: null,
                    foto_sekretariat: null,
                    logo_desa_preview: '',
                    foto_kantor_desa_preview: '',
                    logo_bumdes_preview: '',
                    foto_sekretariat_preview: '',
                });
            },
        });
    };

    const getExistingImage = (field: keyof typeof data): string | null => {
        switch (field) {
            case 'logo_desa':
                return desa?.logo_desa || null;
            case 'foto_kantor_desa':
                return desa?.foto_kantor_desa || null;
            case 'logo_bumdes':
                return bumdes?.logo_bumdes || null;
            case 'foto_sekretariat':
                return bumdes?.foto_sekretariat || null;
            default:
                return null;
        }
    };

    const renderUpload = (label: string, field: keyof typeof data, preview: string | undefined, error: string | undefined) => {
        const existingImage = getExistingImage(field);
        const displayImage = preview || existingImage;
        return (
            <motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Label className="text-sm font-medium text-gray-700">{label}</Label>
                {!displayImage ? (
                    <div className="group relative">
                        <input type="file" accept="image/*" className="hidden" id={field as string} onChange={(e) => handleFileChange(e, field)} />
                        <label
                            htmlFor={field as string}
                            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-100/70"
                        >
                            <Upload className="mb-2 h-8 w-8 text-blue-400" />
                            <p className="text-sm font-medium text-blue-600">Klik untuk upload</p>
                            <p className="mt-1 text-xs text-blue-400">atau drag & drop file gambar</p>
                        </label>
                    </div>
                ) : (
                    <motion.div
                        className="group relative overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="group relative aspect-video w-full overflow-hidden">
                            {/* Gambar */}
                            <img src={displayImage} alt={label} className="h-full w-full object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100">
                                {preview && (
                                    <button type="button" onClick={() => handleRemoveFile(field)} className="rounded-full bg-red-500 p-2 text-white">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                                {!preview && existingImage && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id={`${field}_replace`}
                                            onChange={(e) => handleFileChange(e, field)}
                                        />
                                        <label htmlFor={`${field}_replace`} className="cursor-pointer">
                                            <Upload className="h-12 w-12 rounded-full bg-blue-500 p-3 text-white" />
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="truncate text-sm font-medium text-white">
                                {label}
                                {!preview && existingImage && <span className="ml-2 text-xs text-blue-200">(Gambar saat ini)</span>}
                                {preview && <span className="ml-2 text-xs text-green-200">(Gambar baru)</span>}
                            </p>
                        </div>
                    </motion.div>
                )}
                {error && (
                    <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {error}
                    </motion.p>
                )}
            </motion.div>
        );
    };

    return (
        <AppLayout>
            <Head title="Edit Foto Sekretariat" />

            {/* Flash Notification */}
            <AnimatePresence>
                {flashMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-md px-4 py-3 text-white shadow-lg ${flashColor}`}
                    >
                        {renderFlashIcon()}
                        <p className="text-sm font-medium">{flashMessage}</p>
                        <button onClick={() => setFlashMessage(null)} className="ml-2 rounded-full p-1 hover:bg-white/20">
                            <XCircle className="h-4 w-4 text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-screen py-8">
                <div className="mx-auto">
                    <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="mb-2 text-3xl font-bold text-gray-800">Kelola Foto & Logo</h1>
                        <p className="font-medium text-blue-600">Desa & BUMDes</p>
                        <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-blue-500"></div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="overflow-hidden rounded-2xl border-0 bg-white/80 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 text-white">
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                    <Image className="h-6 w-6" />
                                    Upload Media
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                        {renderUpload('Logo Desa', 'logo_desa', data.logo_desa_preview, errors.logo_desa)}
                                        {renderUpload('Foto Kantor Desa', 'foto_kantor_desa', data.foto_kantor_desa_preview, errors.foto_kantor_desa)}
                                        {renderUpload('Logo BUMDes', 'logo_bumdes', data.logo_bumdes_preview, errors.logo_bumdes)}
                                        {renderUpload(
                                            'Foto Sekretariat BUMDes',
                                            'foto_sekretariat',
                                            data.foto_sekretariat_preview,
                                            errors.foto_sekretariat,
                                        )}
                                    </div>
                                    <motion.div className="border-t border-gray-200 pt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full rounded-xl bg-blue-600 p-5 py-3 text-lg font-medium text-white hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Simpan Perubahan'
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
            {/* Footer section */}
            <FooterInfo />
        </AppLayout>
    );
}
