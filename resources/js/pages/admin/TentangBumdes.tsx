import { FooterInfo } from '@/components/footer-dashboard';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, Lightbulb, Save, Target, User, Mail, Phone, MapPin, Camera, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

export default function TentangBumdes({ profile }: { profile: any }) {
    const { flash } = usePage().props as unknown as {
        flash: { info?: { message?: string; method?: string } };
    };

    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
            case 'update':
                return <CheckCircle className="h-5 w-5 text-white" />;
            default:
                return <CheckCircle className="h-5 w-5 text-white" />;
        }
    };

    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        kepala_bumdes: profile?.kepala_bumdes || '',
        email: profile?.email || '',
        telepon: profile?.telepon || '',
        alamat: profile?.alamat || '',
        keunggulan: profile?.keunggulan || '',
        visi: profile?.visi || '',
        misi: profile?.misi || '',
        foto_kepala_bumdes: null as File | null,
        _method: 'PUT'
    });

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto_kepala_bumdes', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected image
    const removeImage = () => {
        setData('foto_kepala_bumdes', null);
        setPreviewImage(null);
        // Reset file input
        const fileInput = document.getElementById('foto_kepala_bumdes') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Get current image URL
    const getCurrentImageUrl = () => {
        if (previewImage) return previewImage;
        if (profile?.foto_kepala_bumdes) {
            return `/storage/${profile.foto_kepala_bumdes}`;
        }
        return null;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tentang.update', profile?.id), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Tentang Bumdes" />

            {/* Improved Flash Message with Icons */}
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    {/* Header Section */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Tentang Bumdes</h1>
                        <p className="mx-auto max-w-2xl text-gray-600">
                            Kelola informasi tentang Bumdes dengan mudah. Isi data kepala bumdes, kontak, keunggulan, visi, dan misi untuk memberikan gambaran yang jelas kepada masyarakat.
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                            <h2 className="text-xl font-semibold text-white">Informasi Bumdes</h2>
                        </div>

                        <form onSubmit={submit} className="space-y-8 p-8">
                            {/* Foto Kepala Bumdes */}
                            <div className="group">
                                <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                    <Camera className="h-5 w-5 text-indigo-500" />
                                    <span>Foto Kepala Bumdes</span>
                                </label>

                                {/* Current/Preview Image */}
                                {getCurrentImageUrl() && (
                                    <div className="mb-4 relative inline-block">
                                        <img
                                            src={getCurrentImageUrl()!}
                                            alt="Foto Kepala Bumdes"
                                            className="h-32 w-32 rounded-xl object-cover border-4 border-gray-200 shadow-lg"
                                        />
                                        {(previewImage || data.foto_kepala_bumdes) && (
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors duration-200"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* File Input */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="foto_kepala_bumdes"
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        onChange={handleFileChange}
                                        className={`w-full rounded-xl border-2 px-4 py-3 text-gray-700 transition-all duration-200 focus:outline-none ${
                                            errors.foto_kepala_bumdes
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                                        }`}
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        💡 Format yang didukung: JPG, PNG, GIF. Maksimal 2MB.
                                    </p>
                                </div>
                                {errors.foto_kepala_bumdes && (
                                    <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        <span>{errors.foto_kepala_bumdes}</span>
                                    </p>
                                )}
                            </div>

                            {/* Kepala Bumdes */}
                            <div className="group">
                                <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                    <User className="h-5 w-5 text-purple-500" />
                                    <span>Kepala Bumdes</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.kepala_bumdes}
                                        onChange={(e) => setData('kepala_bumdes', e.target.value)}
                                        placeholder="Masukkan nama kepala Bumdes..."
                                        className={`w-full rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                            errors.kepala_bumdes
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                        }`}
                                    />
                                </div>
                                {errors.kepala_bumdes && (
                                    <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        <span>{errors.kepala_bumdes}</span>
                                    </p>
                                )}
                            </div>

                            {/* Contact Information Section */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Email */}
                                <div className="group">
                                    <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                        <Mail className="h-5 w-5 text-blue-500" />
                                        <span>Email</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="contoh@email.com"
                                            className={`w-full rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                                errors.email
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                            }`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                            <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                            <span>{errors.email}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Telepon */}
                                <div className="group">
                                    <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                        <Phone className="h-5 w-5 text-green-500" />
                                        <span>No. Telepon</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={data.telepon}
                                            onChange={(e) => setData('telepon', e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className={`w-full rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                                errors.telepon
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                            }`}
                                        />
                                    </div>
                                    {errors.telepon && (
                                        <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                            <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                            <span>{errors.telepon}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="group">
                                <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                    <MapPin className="h-5 w-5 text-red-500" />
                                    <span>Alamat</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        placeholder="Masukkan alamat lengkap Bumdes..."
                                        className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                            errors.alamat
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                        }`}
                                        rows={3}
                                    />
                                </div>
                                {errors.alamat && (
                                    <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        <span>{errors.alamat}</span>
                                    </p>
                                )}
                            </div>

                            {/* Keunggulan */}
                            <div className="group">
                                <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                    <span>Keunggulan</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={data.keunggulan}
                                        onChange={(e) => setData('keunggulan', e.target.value)}
                                        placeholder="Jelaskan keunggulan dan keunikan Bumdes Anda..."
                                        className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                            errors.keunggulan
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                        }`}
                                        rows={4}
                                    />
                                </div>
                                {errors.keunggulan && (
                                    <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        <span>{errors.keunggulan}</span>
                                    </p>
                                )}
                            </div>

                            {/* Visi */}
                            <div className="group">
                                <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                    <Eye className="h-5 w-5 text-blue-500" />
                                    <span>Visi</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={data.visi}
                                        onChange={(e) => setData('visi', e.target.value)}
                                        placeholder="Tuliskan visi jangka panjang Bumdes..."
                                        className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                            errors.visi
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                        }`}
                                        rows={4}
                                    />
                                </div>
                                {errors.visi && (
                                    <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        <span>{errors.visi}</span>
                                    </p>
                                )}
                            </div>

                            {/* Misi */}
                            <div className="group">
                                <label className="mb-3 flex items-center space-x-2 text-base font-semibold text-gray-800">
                                    <Target className="h-5 w-5 text-green-500" />
                                    <span>Misi</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={data.misi}
                                        onChange={(e) => setData('misi', e.target.value)}
                                        placeholder="Deskripsikan misi dan langkah-langkah strategis... (pisahkan setiap poin dengan enter baru)"
                                        className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                            errors.misi
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                        }`}
                                        rows={6}
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    💡 Tips: Pisahkan setiap poin misi dengan baris baru untuk tampilan yang rapi
                                </p>
                                {errors.misi && (
                                    <p className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        <span>{errors.misi}</span>
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`flex-1 rounded-xl px-6 py-3 font-medium text-white transition-all duration-200 focus:ring-4 focus:outline-none ${
                                        processing
                                            ? 'cursor-not-allowed bg-gray-400'
                                            : 'bg-blue-600 shadow-lg hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl focus:ring-blue-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        {processing ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Simpan Perubahan</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Footer Section */}
                    <FooterInfo />
                </div>
            </div>
        </AppLayout>
    );
}