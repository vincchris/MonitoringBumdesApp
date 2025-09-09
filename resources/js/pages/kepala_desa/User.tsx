import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Mail, Pencil, Phone, Plus, Trash2, User, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ================== TYPES ==================
export interface UnitItem {
    id: number;
    name: string;
    unit_name?: string;
}

export interface UserItem {
    id_users: number;
    name: string;
    email: string;
    phone?: string;
    roles: 'kepala_desa' | 'pengelola' | 'kepala_bumdes' | 'admin';
    image?: string;
    units?: UnitItem[];
}

export interface PaginatedUserData {
    data: UserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface UserFormData {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    roles: 'kepala_desa' | 'pengelola' | 'kepala_bumdes' | 'admin' | '';
    unit_id?: number | '';
    [key: string]: any;
}

interface Props {
    users: PaginatedUserData;
    units: UnitItem[];
}

// ================== FORM INPUT COMPONENT ==================
interface FormInputProps {
    label: string;
    type?: 'text' | 'email' | 'tel';
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    icon?: React.ReactNode;
}

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required = false, icon }: FormInputProps) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`
                    w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900
                    placeholder-gray-400 transition-all duration-200
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                    hover:border-gray-400
                    ${icon ? 'pl-10' : ''}
                `}
                required={required}
            />
        </div>
    </div>
);

// ================== CONFIRM MODAL COMPONENT ==================
interface ConfirmModalProps {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

const ConfirmModal = ({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'destructive',
}: ConfirmModalProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
            <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-lg" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <p className="mt-2 text-sm text-gray-600">{description}</p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel} className="px-6">
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={onConfirm} className="px-6">
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ================== MODAL COMPONENT ==================
interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: UserItem | null;
    units: UnitItem[];
    users: UserItem[]; // Add users data to check for existing pengelola
    onSubmit: (e: FormEvent) => void;
    data: UserFormData;
    setData: (field: string, value: any) => void;
    processing: boolean;
}

const UserModal = ({ isOpen, onClose, editingUser, units, users, onSubmit, data, setData, processing }: UserModalProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordEdit, setShowPasswordEdit] = useState(false);

    // Function to check if a unit already has a pengelola
    const getUnitWithPengelola = () => {
        const unitsWithPengelola = new Set();

        users.forEach(user => {
            if (user.roles === 'pengelola' && user.units && user.units.length > 0) {
                // Skip current user when editing
                if (editingUser && user.id_users === editingUser.id_users) {
                    return;
                }
                user.units.forEach(unit => {
                    unitsWithPengelola.add(unit.id);
                });
            }
        });

        return unitsWithPengelola;
    };

    // Get available units for pengelola (units without existing pengelola)
    const getAvailableUnitsForPengelola = () => {
        const unitsWithPengelola = getUnitWithPengelola();
        return units.filter(unit => !unitsWithPengelola.has(unit.id));
    };

    // Check if selected unit already has pengelola
    const isUnitAlreadyHasPengelola = (unitId: number) => {
        const unitsWithPengelola = getUnitWithPengelola();
        return unitsWithPengelola.has(unitId);
    };

    if (!isOpen) return null;

    const availableUnitsForPengelola = getAvailableUnitsForPengelola();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="rounded-xl border border-white/10 bg-white/95 backdrop-blur-lg shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingUser ? 'Edit User' : 'Tambah User Baru'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {editingUser ? 'Perbarui informasi user' : 'Masukkan detail user baru'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100/50 hover:text-gray-600 transition-colors"
                            type="button"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="p-6 space-y-5">
                        {/* Name Input */}
                        <FormInput
                            label="Nama Lengkap"
                            value={data.name}
                            onChange={(value) => setData('name', value)}
                            placeholder="Masukkan nama lengkap"
                            required
                            icon={<User className="h-4 w-4" />}
                        />

                        {/* Email Input */}
                        <FormInput
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(value) => setData('email', value)}
                            placeholder="contoh@email.com"
                            required
                            icon={<Mail className="h-4 w-4" />}
                        />

                        {/* Phone Input */}
                        <FormInput
                            label="Nomor Telepon"
                            type="tel"
                            value={data.phone || ''}
                            onChange={(value) => setData('phone', value)}
                            placeholder="08xx-xxxx-xxxx"
                            icon={<Phone className="h-4 w-4" />}
                        />

                        {/* Password field for new user */}
                        {!editingUser && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password || ''}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:border-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password field for editing user */}
                        {editingUser && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordEdit(!showPasswordEdit);
                                            if (!showPasswordEdit) {
                                                setData('password', '');
                                            }
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                    >
                                        {showPasswordEdit ? 'Batal ubah password' : 'Ubah password'}
                                    </button>
                                </div>

                                {showPasswordEdit ? (
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password || ''}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Masukkan password baru"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:border-gray-400"
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-500">
                                        Password tidak akan diubah
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Role Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.roles}
                                onChange={(e) => {
                                    const role = e.target.value as 'kepala_desa' | 'pengelola' | 'kepala_bumdes' | 'admin' | '';
                                    setData('roles', role);
                                    // Reset unit_id ketika role berubah
                                    if (role !== 'pengelola') {
                                        setData('unit_id', '');
                                    }
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:border-gray-400"
                                required
                            >
                                <option value="">-- Pilih Role --</option>
                                <option value="kepala_desa">Kepala Desa</option>
                                <option value="kepala_bumdes">Kepala Bumdes</option>
                                <option value="admin">Admin</option>
                                <option value="pengelola">Pengelola</option>
                            </select>
                        </div>

                        {/* Unit Select (Conditional) */}
                        {data.roles === 'pengelola' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Unit Usaha <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.unit_id || ''}
                                    onChange={(e) => setData('unit_id', e.target.value ? Number(e.target.value) : '')}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:border-gray-400"
                                    required
                                >
                                    <option value="">-- Pilih Unit Usaha --</option>
                                    {/* Show all units for editing, but warn if unit already has pengelola */}
                                    {editingUser ? (
                                        units.map((unit) => {
                                            const hasExistingPengelola = isUnitAlreadyHasPengelola(unit.id);
                                            return (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.unit_name || unit.name}
                                                    {hasExistingPengelola ? ' (Sudah ada pengelola)' : ''}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        // For new user, only show available units
                                        availableUnitsForPengelola.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.unit_name || unit.name}
                                            </option>
                                        ))
                                    )}
                                </select>

                                {/* Warning messages */}
                                {data.roles === 'pengelola' && (
                                    <>
                                        {!editingUser && availableUnitsForPengelola.length === 0 && (
                                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                                <strong>Peringatan:</strong> Semua unit usaha sudah memiliki pengelola.
                                                Tidak dapat menambahkan pengelola baru.
                                            </div>
                                        )}

                                        {!editingUser && availableUnitsForPengelola.length > 0 && (
                                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                                                <strong>Info:</strong> Hanya menampilkan unit usaha yang belum memiliki pengelola.
                                            </div>
                                        )}

                                        {editingUser && data.unit_id && isUnitAlreadyHasPengelola(Number(data.unit_id)) && (
                                            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                                <strong>Peringatan:</strong> Unit usaha ini sudah memiliki pengelola lain.
                                                Memilih unit ini akan menggantikan pengelola yang ada.
                                            </div>
                                        )}
                                    </>
                                )}

                                {units.length === 0 && (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                        Tidak ada unit usaha tersedia
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200/50">
                            <Button
                                type="submit"
                                disabled={processing || (data.roles === 'pengelola' && !editingUser && availableUnitsForPengelola.length === 0)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                                        {editingUser ? 'Memperbarui...' : 'Menyimpan...'}
                                    </>
                                ) : (
                                    editingUser ? 'Perbarui User' : 'Tambah User'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={processing}
                                className="px-6 py-3 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ================== MAIN COMPONENT ==================
export default function UserList({ users, units }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { info?: { message?: string; method?: string } };
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        open: boolean;
        user: UserItem | null;
    }>({ open: false, user: null });

    const { data, setData, post, put, processing, reset, errors } = useForm<UserFormData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        roles: '',
        unit_id: '',
    });

    // Fungsi untuk membuka modal tambah user
    const handleAddUser = () => {
        reset();
        setEditingUser(null);
        setIsModalOpen(true);
    };

    // Fungsi untuk membuka modal edit user
    const handleEdit = (user: UserItem) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '', // Reset password field saat edit
            roles: user.roles,
            unit_id: user.units && user.units.length > 0 ? user.units[0].id : '',
        });
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
    };

    // Fungsi submit form
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const submitData: any = { ...data };

        // === VALIDASI ROLE UNIK DI FRONTEND ===
        if (!editingUser) {
            if (submitData.roles === 'kepala_desa') {
                const sudahAdaKepalaDesa = users.data.some((u) => u.roles === 'kepala_desa');
                if (sudahAdaKepalaDesa) {
                    toast.error('Hanya boleh ada 1 user dengan role Kepala Desa', {
                        duration: 4000,
                        position: 'top-right',
                    });
                    return;
                }
            }

            if (submitData.roles === 'kepala_bumdes') {
                const sudahAdaKepalaBumdes = users.data.some((u) => u.roles === 'kepala_bumdes');
                if (sudahAdaKepalaBumdes) {
                    toast.error('Hanya boleh ada 1 user dengan role Kepala Bumdes', {
                        duration: 4000,
                        position: 'top-right',
                    });
                    return;
                }
            }

            if (submitData.roles === 'pengelola') {
                const sudahAdaPengelolaUnit = users.data.some(
                    (u) => u.roles === 'pengelola' && u.units && u.units[0]?.id === Number(submitData.unit_id),
                );
                if (sudahAdaPengelolaUnit) {
                    const selectedUnit = units.find(unit => unit.id === Number(submitData.unit_id));
                    toast.error(`Unit "${selectedUnit?.unit_name || selectedUnit?.name}" sudah memiliki pengelola. Setiap unit hanya boleh memiliki 1 pengelola.`, {
                        duration: 5000,
                        position: 'top-right',
                    });
                    return;
                }
            }
        } else {
            // Validasi untuk edit user
            if (submitData.roles === 'kepala_desa') {
                const sudahAdaKepalaDesa = users.data.some((u) => u.roles === 'kepala_desa' && u.id_users !== editingUser.id_users);
                if (sudahAdaKepalaDesa) {
                    toast.error('Hanya boleh ada 1 user dengan role Kepala Desa', {
                        duration: 4000,
                        position: 'top-right',
                    });
                    return;
                }
            }

            if (submitData.roles === 'kepala_bumdes') {
                const sudahAdaKepalaBumdes = users.data.some((u) => u.roles === 'kepala_bumdes' && u.id_users !== editingUser.id_users);
                if (sudahAdaKepalaBumdes) {
                    toast.error('Hanya boleh ada 1 user dengan role Kepala Bumdes', {
                        duration: 4000,
                        position: 'top-right',
                    });
                    return;
                }
            }

            if (submitData.roles === 'pengelola') {
                const sudahAdaPengelolaUnit = users.data.some(
                    (u) => u.roles === 'pengelola' &&
                           u.id_users !== editingUser.id_users &&
                           u.units &&
                           u.units[0]?.id === Number(submitData.unit_id)
                );
                if (sudahAdaPengelolaUnit) {
                    const selectedUnit = units.find(unit => unit.id === Number(submitData.unit_id));
                    toast.error(`Unit "${selectedUnit?.unit_name || selectedUnit?.name}" sudah memiliki pengelola lain. Setiap unit hanya boleh memiliki 1 pengelola.`, {
                        duration: 5000,
                        position: 'top-right',
                    });
                    return;
                }
            }
        }

        // Jika role bukan pengelola, hapus unit_id
        if (submitData.roles !== 'pengelola') {
            delete submitData.unit_id;
        } else {
            submitData.unit_id = submitData.unit_id ? Number(submitData.unit_id) : null;
        }

        if (editingUser && !submitData.password) {
            delete submitData.password;
        }

        if (editingUser) {
            put(route('users.update', editingUser.id_users), {
                ...submitData,
                onSuccess: () => {
                    handleCloseModal();
                    toast.success('User berhasil diperbarui', {
                        duration: 4000,
                        position: 'top-right',
                    });
                },
                onError: () => {
                    toast.error('Gagal memperbarui user. Silakan coba lagi.', {
                        duration: 4000,
                        position: 'top-right',
                    });
                },
            });
        } else {
            post(route('users.store'), {
                ...submitData,
                onSuccess: () => {
                    handleCloseModal();
                    toast.success('User berhasil ditambahkan', {
                        duration: 4000,
                        position: 'top-right',
                    });
                },
                onError: () => {
                    toast.error('Gagal menambahkan user. Silakan coba lagi.', {
                        duration: 4000,
                        position: 'top-right',
                    });
                },
            });
        }
    };

    // === HANDLE DELETE (buka modal) ===
    const handleDelete = (user: UserItem) => {
        setConfirmDelete({ open: true, user });
    };

    // === KONFIRMASI DELETE ===
    const confirmDeleteUser = () => {
        if (!confirmDelete.user) return;

        router.delete(route('users.destroy', confirmDelete.user.id_users), {
            onSuccess: () => {
                setConfirmDelete({ open: false, user: null });
                toast.success(`User "${confirmDelete.user?.name}" berhasil dihapus`, {
                    duration: 4000,
                    position: 'top-right',
                });
            },
            onError: (errors) => {
                console.error('Delete errors:', errors);
                setConfirmDelete({ open: false, user: null });
                toast.error('Gagal menghapus user. Silakan coba lagi.', {
                    duration: 4000,
                    position: 'top-right',
                });
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen User" />

            {/* React Hot Toast Container */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    className: '',
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                            color: '#fff',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#10b981',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#ef4444',
                        },
                    },
                }}
            />

            <div className="mx-auto max-w-7xl space-y-6 px-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
                        <p className="mt-1 text-gray-600">Kelola data pengguna sistem</p>
                    </div>
                    <Button
                        onClick={handleAddUser}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah User
                    </Button>
                </div>

                {/* Tabel User */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-left">
                                    <th className="px-6 py-4 font-semibold text-gray-900">Nama</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Email</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">No. Telepon</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Unit Usaha</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id_users} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{user.email}</td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {user.phone ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        {user.phone}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                        user.roles === 'kepala_desa'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : user.roles === 'kepala_bumdes'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : user.roles === 'admin'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {user.roles === 'kepala_desa'
                                                        ? 'Kepala Desa'
                                                        : user.roles === 'kepala_bumdes'
                                                          ? 'Kepala Bumdes'
                                                          : user.roles === 'admin'
                                                            ? 'Admin'
                                                            : 'Pengelola'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {user.units && user.units.length > 0 ? (
                                                    <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                                                        {user.units[0].name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(user)}
                                                        className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(user)}
                                                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <User className="h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-gray-500 text-lg font-medium">Tidak ada data user</p>
                                                <p className="text-gray-400 text-sm mt-1">Mulai dengan menambahkan user baru</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-700">
                            Menampilkan <span className="font-medium">{users.from}</span> - <span className="font-medium">{users.to}</span> dari{' '}
                            <span className="font-medium">{users.total}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={users.current_page <= 1}
                                onClick={() => router.visit(route('users.index', { page: users.current_page - 1 }))}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </Button>
                            <span className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded">
                                Halaman {users.current_page} dari {users.last_page}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={users.current_page >= users.last_page}
                                onClick={() => router.visit(route('users.index', { page: users.current_page + 1 }))}
                                className="flex items-center gap-2"
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Modal */}
                <UserModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    editingUser={editingUser}
                    units={units}
                    users={users.data}
                    onSubmit={handleSubmit}
                    data={data}
                    setData={setData}
                    processing={processing}
                />

                {/* Modal Konfirmasi Hapus */}
                <ConfirmModal
                    open={confirmDelete.open}
                    title="Konfirmasi Hapus"
                    description={`Apakah Anda yakin ingin menghapus user "${confirmDelete.user?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                    onConfirm={confirmDeleteUser}
                    onCancel={() => setConfirmDelete({ open: false, user: null })}
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </AppLayout>
    );
}