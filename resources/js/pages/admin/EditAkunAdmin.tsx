import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    CheckCircleIcon,
    EyeClosed,
    EyeIcon,
    InfoIcon,
    LockIcon,
    MailIcon,
    RefreshCw,
    ShieldCheckIcon,
    Trash2,
    UserIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EditAkunAdminProps {
    admin: {
        id: number;
        name: string;
        email: string;
    };
}

interface FlashProps {
    info?: {
        message: string;
        method: string;
    };
    success?: string;
    error?: string;
}

export default function EditAkunAdmin({ admin }: EditAkunAdminProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: admin?.name || '',
        email: admin?.email || '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const { flash } = usePage<{ flash: FlashProps }>().props;
    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('edit.update', admin.id), { preserveScroll: true });
    };

    const handleInputChange = (field: string, value: string) => {
        setData(field as any, value);
    };

    const validatePassword = (password: string) => {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
        };

        return requirements;
    };

    const passwordRequirements = data.password ? validatePassword(data.password) : null;
    const isPasswordStrong = passwordRequirements ? Object.values(passwordRequirements).every(Boolean) : false;

    return (
        <AppLayout>
            <Head title="Edit Akun Admin" />

            {/* Flash Message */}
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Form Column */}
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
                                {/* Form Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                    <div className="flex items-center">
                                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                            <UserIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-white">Informasi Akun</h2>
                                            <p className="text-sm text-blue-100">Perbarui detail profil Anda</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <div className="px-8 py-8">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Name Field */}
                                        <div className="group">
                                            <label htmlFor="name" className="mb-3 block text-sm font-semibold text-gray-700">
                                                Nama Lengkap
                                            </label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    <UserIcon className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                                                </div>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="Masukkan nama lengkap"
                                                    className="w-full rounded-xl border-2 border-gray-200 py-4 pr-4 pl-12 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
                                                />
                                            </div>
                                            {errors.name && (
                                                <div className="mt-2 flex items-center text-red-600">
                                                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        ></path>
                                                    </svg>
                                                    <span className="text-sm font-medium">{errors.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="group">
                                            <label htmlFor="email" className="mb-3 block text-sm font-semibold text-gray-700">
                                                Alamat Email
                                            </label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    <MailIcon className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    placeholder="admin@example.com"
                                                    className="w-full rounded-xl border-2 border-gray-200 py-4 pr-4 pl-12 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
                                                />
                                            </div>
                                            {errors.email && (
                                                <div className="mt-2 flex items-center text-red-600">
                                                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        ></path>
                                                    </svg>
                                                    <span className="text-sm font-medium">{errors.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Password Fields Section */}
                                        <div className="space-y-6 rounded-xl">
                                            <div className="mb-4 flex items-center">
                                                <LockIcon className="mr-2 h-5 w-5 text-gray-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">Ubah Password</h3>
                                                <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-500">Opsional</span>
                                            </div>

                                            {/* New Password */}
                                            <div className="group">
                                                <label htmlFor="password" className="mb-3 block text-sm font-semibold text-gray-700">
                                                    Password Baru
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                        <LockIcon className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                                                    </div>
                                                    <input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                                        placeholder="Masukkan password baru"
                                                        className="w-full rounded-xl border-2 border-gray-200 py-4 pr-12 pl-12 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-0 flex items-center pr-4"
                                                    >
                                                        {showPassword ? (
                                                            <EyeClosed className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Confirm Password - Only show when password is being typed */}
                                                {data.password && (
                                                    <div className="group animate-in slide-in-from-top-2 mt-4 duration-300">
                                                        <label
                                                            htmlFor="password_confirmation"
                                                            className="mb-3 block text-sm font-semibold text-gray-700"
                                                        >
                                                            Konfirmasi Password
                                                        </label>
                                                        <div className="relative">
                                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                                <LockIcon className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                                                            </div>
                                                            <input
                                                                id="password_confirmation"
                                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                                value={data.password_confirmation}
                                                                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                                                placeholder="Ulangi password baru"
                                                                className="w-full rounded-xl border-2 border-gray-200 py-4 pr-12 pl-12 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                                className="absolute inset-y-0 right-0 flex items-center pr-4"
                                                            >
                                                                {showPasswordConfirmation ? (
                                                                    <EyeClosed className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                                ) : (
                                                                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* Password Match Indicator */}
                                                        {data.password_confirmation && (
                                                            <div className="mt-2 flex items-center">
                                                                {data.password === data.password_confirmation ? (
                                                                    <div className="flex items-center text-green-600">
                                                                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                                                                        <span className="text-sm font-medium">Password cocok</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center text-red-600">
                                                                        <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                                clipRule="evenodd"
                                                                            ></path>
                                                                        </svg>
                                                                        <span className="text-sm font-medium">Password tidak cocok</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {errors.password_confirmation && (
                                                            <div className="mt-2 flex items-center text-red-600">
                                                                <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                        clipRule="evenodd"
                                                                    ></path>
                                                                </svg>
                                                                <span className="text-sm font-medium">{errors.password_confirmation}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Password Strength Indicator */}
                                                {data.password && passwordRequirements && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                                                <div
                                                                    className={`h-full transition-all duration-300 ${
                                                                        isPasswordStrong
                                                                            ? 'w-full bg-green-500'
                                                                            : Object.values(passwordRequirements).filter(Boolean).length >= 2
                                                                              ? 'w-2/3 bg-yellow-500'
                                                                              : 'w-1/3 bg-red-500'
                                                                    }`}
                                                                ></div>
                                                            </div>
                                                            <span
                                                                className={`text-xs font-medium ${
                                                                    isPasswordStrong
                                                                        ? 'text-green-600'
                                                                        : Object.values(passwordRequirements).filter(Boolean).length >= 2
                                                                          ? 'text-yellow-600'
                                                                          : 'text-red-600'
                                                                }`}
                                                            >
                                                                {isPasswordStrong
                                                                    ? 'Kuat'
                                                                    : Object.values(passwordRequirements).filter(Boolean).length >= 2
                                                                      ? 'Sedang'
                                                                      : 'Lemah'}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div
                                                                className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}
                                                            >
                                                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                                Min. 8 karakter
                                                            </div>
                                                            <div
                                                                className={`flex items-center ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}
                                                            >
                                                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                                Huruf besar
                                                            </div>
                                                            <div
                                                                className={`flex items-center ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}
                                                            >
                                                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                                Huruf kecil
                                                            </div>
                                                            <div
                                                                className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}
                                                            >
                                                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                                Angka
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {errors.password && (
                                                    <div className="mt-2 flex items-center text-red-600">
                                                        <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                clipRule="evenodd"
                                                            ></path>
                                                        </svg>
                                                        <span className="text-sm font-medium">{errors.password}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="border-t border-gray-100 pt-6">
                                            <div className="flex flex-col gap-4 sm:flex-row">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="relative flex-1 transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/50 focus:outline-none active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {processing ? (
                                                        <div className="flex items-center justify-center">
                                                            <svg
                                                                className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            Menyimpan...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <CheckCircleIcon className="mr-2 inline h-5 w-5" />
                                                            Simpan Perubahan
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:block">
                            <div className="sticky top-8 space-y-6">
                                {/* Security Tips */}
                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                                        <div className="flex items-center">
                                            <ShieldCheckIcon className="mr-3 h-6 w-6 text-white" />
                                            <h3 className="text-lg font-semibold text-white">Tips Keamanan</h3>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <ul className="space-y-4">
                                            <li className="flex items-start">
                                                <div className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">Email Valid</span>
                                                    <p className="mt-1 text-gray-500">Gunakan email aktif untuk notifikasi sistem</p>
                                                </div>
                                            </li>

                                            <li className="flex items-start">
                                                <div className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">Password Kuat</span>
                                                    <p className="mt-1 text-gray-500">Kombinasi huruf, angka, dan simbol minimal 8 karakter</p>
                                                </div>
                                            </li>

                                            <li className="flex items-start">
                                                <div className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">Update Berkala</span>
                                                    <p className="mt-1 text-gray-500">Perbarui informasi profil secara rutin</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                        <InfoIcon className="mr-2 h-5 w-5 text-blue-600" />
                                        Info Akun
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                                            <span className="text-sm text-gray-600">Role</span>
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Admin Desa</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-600">Last Updated</span>
                                            <span className="text-sm font-medium text-gray-900">Today</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
