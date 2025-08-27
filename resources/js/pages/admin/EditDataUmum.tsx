import { FooterInfo } from '@/components/footer-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Building,
    Calendar,
    CheckCircle,
    CheckCircle2,
    ChevronRight,
    Eye,
    EyeOff,
    Home,
    Mail,
    MapPin,
    Phone,
    Ruler,
    Save,
    User,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface DesaProfile {
    id: number;
    nama_desa: string;
    alamat: string;
    kepala_desa: string;
    periode_kepala_desa?: string;
    email?: string;
    telepon?: string;
    luas_desa?: number;
}

interface BumdesProfile {
    id: number;
    desa_id: number;
    nama_bumdes: string;
    kepala_bumdes: string;
    alamat?: string;
    email?: string;
    telepon?: string;
}

interface Props {
    desa: DesaProfile;
    bumdes: BumdesProfile;
    flash?: {
        success?: string;
        error?: string;
    };
}

// Pindahkan InputField keluar dari komponen utama
interface InputFieldProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    type?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ icon: Icon, label, type = 'text', name, value, onChange, error, placeholder }, ref) => (
        <div className="group relative">
            <Label className="mb-2 block text-sm font-medium text-gray-700">{label}</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                </div>
                <Input
                    ref={ref}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`border-gray-200 pl-10 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                />
            </div>
            {error && (
                <div className="mt-1 flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
        </div>
    ),
);

InputField.displayName = 'InputField';

// Pindahkan TabButton keluar dari komponen utama
interface TabButtonProps {
    id: 'desa' | 'bumdes';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
    isCompleted: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, isActive, onClick, isCompleted }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center space-x-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
            isActive
                ? 'scale-105 transform bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 shadow-md hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
        {isCompleted && (
            <span className="inline-flex items-center justify-center rounded-full bg-white">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            </span>
        )}
    </button>
);

export default function EditDataUmum({ desa, bumdes, flash }: Props) {
    const { data, setData, put, post, processing, errors, reset } = useForm({
        nama_desa: desa?.nama_desa || '',
        alamat_desa: desa?.alamat || '',
        kepala_desa: desa?.kepala_desa || '',
        periode_kepala_desa: desa?.periode_kepala_desa || '',
        email_desa: desa?.email || '',
        telepon_desa: desa?.telepon || '',
        luas_desa: desa?.luas_desa?.toString() || '',

        nama_bumdes: bumdes?.nama_bumdes || '',
        kepala_bumdes: bumdes?.kepala_bumdes || '',
        alamat_bumdes: bumdes?.alamat || '',
        email_bumdes: bumdes?.email || '',
        telepon_bumdes: bumdes?.telepon || '',
    });

    const [activeTab, setActiveTab] = useState<'desa' | 'bumdes'>('desa');
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
    const [notificationMessage, setNotificationMessage] = useState<string>('');

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setNotificationType('success');
            setNotificationMessage(flash.success);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
        } else if (flash?.error) {
            setNotificationType('error');
            setNotificationMessage(flash.error);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
        }
    }, [flash]);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Log data before sending
        console.log('Submitting data:', data);

        if (desa?.id) {
            // Update existing data
            put(route('data-umum.update', desa.id), {
                onSuccess: (page) => {
                    setNotificationType('success');
                    setNotificationMessage('Data berhasil diperbarui!');
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 5000);
                },
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    setNotificationType('error');
                    setNotificationMessage('Terjadi kesalahan saat menyimpan data. Periksa input Anda.');
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 5000);
                },
            });
        } else {
            // Create new data
            post(route('data-umum.store'), {
                onSuccess: (page) => {
                    setNotificationType('success');
                    setNotificationMessage('Data berhasil disimpan!');
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 5000);
                },
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    setNotificationType('error');
                    setNotificationMessage('Terjadi kesalahan saat menyimpan data. Periksa input Anda.');
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 5000);
                },
            });
        }
    };

    const completedSections = useMemo(
        () => ({
            desa: !!(data.nama_desa && data.kepala_desa && data.alamat_desa),
            bumdes: !!(data.nama_bumdes && data.kepala_bumdes),
        }),
        [data.nama_desa, data.kepala_desa, data.alamat_desa, data.nama_bumdes, data.kepala_bumdes],
    );

    // Optimasi handler untuk mencegah re-render yang tidak perlu
    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setData(name as keyof typeof data, value);
        },
        [setData],
    );

    const handleTabChange = React.useCallback((tab: 'desa' | 'bumdes') => {
        setActiveTab(tab);
    }, []);

    const togglePreview = React.useCallback(() => {
        setShowPreview((prev) => !prev);
    }, []);

    return (
        <AppLayout>
            <Head title="Edit Data Umum" />

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center space-x-2 rounded-lg px-6 py-4 shadow-lg transition-all duration-300 ${
                        notificationType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                >
                    {notificationType === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span>{notificationMessage}</span>
                    <button onClick={() => setShowNotification(false)} className="ml-2 hover:opacity-75">
                        ×
                    </button>
                </div>
            )}

            <div className="rounded-xl border-b border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-6xl px-6 py-8">
                    <div className="mb-6 flex items-center space-x-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Edit Data Umum</h1>
                            <p className="mt-1 text-gray-600">Perbarui informasi desa dan BUMDes</p>
                        </div>
                    </div>
                    <div className="mb-8 rounded-full bg-gray-200 p-1">
                        <div
                            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                            style={{
                                width: `${Object.values(completedSections).filter(Boolean).length * 50}%`,
                            }}
                        ></div>
                    </div>
                    <div className="flex space-x-3">
                        <TabButton
                            id="desa"
                            label="Data Desa"
                            icon={Home}
                            isActive={activeTab === 'desa'}
                            onClick={() => handleTabChange('desa')}
                            isCompleted={completedSections.desa}
                        />
                        <TabButton
                            id="bumdes"
                            label="Data BUMDes"
                            icon={Briefcase}
                            isActive={activeTab === 'bumdes'}
                            onClick={() => handleTabChange('bumdes')}
                            isCompleted={completedSections.bumdes}
                        />
                        <button
                            type="button"
                            onClick={togglePreview}
                            className={`flex items-center space-x-2 rounded-xl border px-6 py-3 font-medium transition-all duration-200 ${
                                showPreview ? 'border-slate-600 bg-slate-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            <span>Preview</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl py-8">
                <form onSubmit={submit}>
                    {!showPreview && activeTab === 'desa' && (
                        <Card className="overflow-hidden rounded-xl border-0 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-lg bg-white/20 p-2">
                                        <Home className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Data Desa</CardTitle>
                                        <p className="text-blue-100">Informasi umum tentang desa</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <InputField
                                        icon={Building}
                                        label="Nama Desa"
                                        name="nama_desa"
                                        value={data.nama_desa}
                                        onChange={handleChange}
                                        error={errors.nama_desa}
                                        placeholder="Masukkan nama desa"
                                    />
                                    <InputField
                                        icon={MapPin}
                                        label="Alamat Desa"
                                        name="alamat_desa"
                                        value={data.alamat_desa}
                                        onChange={handleChange}
                                        placeholder="Masukkan alamat lengkap"
                                    />
                                    <InputField
                                        icon={User}
                                        label="Kepala Desa"
                                        name="kepala_desa"
                                        value={data.kepala_desa}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama kepala desa"
                                    />
                                    <InputField
                                        icon={Calendar}
                                        label="Periode Kepala Desa"
                                        name="periode_kepala_desa"
                                        value={data.periode_kepala_desa}
                                        onChange={handleChange}
                                        placeholder="Contoh: 2019-2025"
                                    />
                                    <InputField
                                        icon={Mail}
                                        label="Email Desa"
                                        type="email"
                                        name="email_desa"
                                        value={data.email_desa}
                                        onChange={handleChange}
                                        placeholder="email@desa.com"
                                    />
                                    <InputField
                                        icon={Phone}
                                        label="Telepon Desa"
                                        name="telepon_desa"
                                        value={data.telepon_desa}
                                        onChange={handleChange}
                                        placeholder="021-xxxxxxx"
                                    />
                                    <InputField
                                        icon={Ruler}
                                        label="Luas Desa (Hektar)"
                                        type="number"
                                        name="luas_desa"
                                        value={data.luas_desa ? parseFloat(data.luas_desa).toString() : ""}
                                        onChange={handleChange}
                                        placeholder="0"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!showPreview && activeTab === 'bumdes' && (
                        <Card className="overflow-hidden rounded-2xl border-0 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-lg bg-white/20 p-2">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Data BUMDes</CardTitle>
                                        <p className="text-green-100">Informasi Badan Usaha Milik Desa</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <InputField
                                        icon={Building}
                                        label="Nama BUMDes"
                                        name="nama_bumdes"
                                        value={data.nama_bumdes}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama BUMDes"
                                    />
                                    <InputField
                                        icon={User}
                                        label="Kepala BUMDes"
                                        name="kepala_bumdes"
                                        value={data.kepala_bumdes}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama kepala BUMDes"
                                    />
                                    <InputField
                                        icon={MapPin}
                                        label="Alamat BUMDes"
                                        name="alamat_bumdes"
                                        value={data.alamat_bumdes}
                                        onChange={handleChange}
                                        placeholder="Masukkan alamat BUMDes"
                                    />
                                    <InputField
                                        icon={Mail}
                                        label="Email BUMDes"
                                        type="email"
                                        name="email_bumdes"
                                        value={data.email_bumdes}
                                        onChange={handleChange}
                                        placeholder="email@bumdes.com"
                                    />
                                    <InputField
                                        icon={Phone}
                                        label="Telepon BUMDes"
                                        name="telepon_bumdes"
                                        value={data.telepon_bumdes}
                                        onChange={handleChange}
                                        placeholder="021-xxxxxxx"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!showPreview && (
                        <div className="mt-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
                            <div className="flex space-x-4">
                                {activeTab === 'bumdes' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleTabChange('desa')}
                                        className="flex items-center space-x-2 border-2 px-6 py-3 hover:bg-gray-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Kembali ke Data Desa</span>
                                    </Button>
                                )}
                            </div>
                            <div className="flex space-x-4">
                                {activeTab === 'desa' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleTabChange('bumdes')}
                                        className="flex items-center space-x-2 border-2 border-green-300 px-6 py-3 text-green-700 hover:bg-green-50"
                                    >
                                        <span>Lanjut ke BUMDes</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex transform items-center space-x-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

             <FooterInfo />
        </AppLayout>
    );
}
