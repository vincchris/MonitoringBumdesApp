import { FooterInfo } from '@/components/footer-dashboard';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, Lightbulb, Save, Target } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

export default function TentangBumdes({ profile }: { profile: any }) {
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
            case 'update':
                return <CheckCircle className="h-5 w-5 text-white" />;
            default:
                return <CheckCircle className="h-5 w-5 text-white" />;
        }
    };
    const { data, setData, put, processing, errors, wasSuccessful } = useForm({
        keunggulan: profile?.keunggulan || '',
        visi: profile?.visi || '',
        misi: profile?.misi || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('tentang.update', profile?.id));
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
                            Kelola informasi tentang Bumdes dengan mudah. Isi keunggulan, visi, dan misi untuk memberikan gambaran yang jelas kepada
                            masyarakat.
                        </p>
                    </div>
                    
                    {/* Main Form Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                            <h2 className="text-xl font-semibold text-white">Informasi Bumdes</h2>
                        </div>

                        <form onSubmit={submit} className="space-y-8 p-8">
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
                                        placeholder="Deskripsikan misi dan langkah-langkah strategis..."
                                        className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                            errors.misi
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                        }`}
                                        rows={5}
                                    />
                                </div>
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
