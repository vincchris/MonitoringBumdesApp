import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

// ================== TYPES ==================
export interface UnitItem {
    id: number;
    name: string;
    unit_name?: string; // Support untuk data dari backend
}

export interface UserItem {
    id_users: number;
    name: string;
    email: string;
    roles: 'kepala_desa' | 'pengelola' | 'kepala_bumdes';
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
    password?: string;
    roles: 'kepala_desa' | 'pengelola' | 'kepala_bumdes' | '';
    unit_id?: number | '';
    [key: string]: any;
}

interface Props {
    users: PaginatedUserData;
    units: UnitItem[];
}

// ================== MODAL COMPONENT ==================
interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: UserItem | null;
    units: UnitItem[];
    onSubmit: (e: FormEvent) => void;
    data: UserFormData;
    setData: (field: string, value: any) => void;
    processing: boolean;
}

const UserModal = ({ isOpen, onClose, editingUser, units, onSubmit, data, setData, processing }: UserModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-lg border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{editingUser ? 'Edit User' : 'Tambah User'}</h2>
                    <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-gray-100/50" type="button">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Nama</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">Password</label>
                            <input
                                type="password"
                                value={data.password || ''}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium">Role</label>
                        <select
                            value={data.roles}
                            onChange={(e) => {
                                const role = e.target.value as 'kepala_desa' | 'pengelola' | 'kepala_bumdes' | '';
                                setData('roles', role);
                                // Reset unit_id ketika role berubah
                                if (role !== 'pengelola') {
                                    setData('unit_id', '');
                                }
                            }}
                            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">-- Pilih Role --</option>
                            <option value="kepala_desa">Kepala Desa</option>
                            <option value="kepala_bumdes">Kepala Bumdes</option>
                            <option value="pengelola">Pengelola</option>
                        </select>
                    </div>

                    {/* Kondisi: Jika role = pengelola → tampilkan Unit */}
                    {data.roles === 'pengelola' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">Unit Usaha</label>
                            <select
                                value={data.unit_id || ''}
                                onChange={(e) => setData('unit_id', e.target.value ? Number(e.target.value) : '')}
                                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">-- Pilih Unit Usaha --</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unit_name || unit.name}
                                    </option>
                                ))}
                            </select>
                            {units.length === 0 && <p className="mt-1 text-xs text-gray-500">Tidak ada unit usaha tersedia</p>}
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? 'Menyimpan...' : editingUser ? 'Update' : 'Tambah'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Batal
                        </Button>
                    </div>
                </form>
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

    const { data, setData, post, put, processing, reset, errors } = useForm<UserFormData>({
        name: '',
        email: '',
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
            password: '',
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

        if (submitData.roles !== 'pengelola') {
            delete submitData.unit_id;
        } else {
            submitData.unit_id = submitData.unit_id ? Number(submitData.unit_id) : null;
        }

        if (editingUser) {
            put(route('users.update', editingUser.id_users), {
                ...submitData,
                onSuccess: handleCloseModal,
                onError: (errors) => console.log('Update errors:', errors),
            });
        } else {
            post(route('users.store'), {
                ...submitData,
                onSuccess: handleCloseModal,
                onError: (errors) => console.log('Create errors:', errors),
            });
        }
    };

    // Fungsi untuk menghapus user
    const handleDelete = (user: UserItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id_users), {
                onSuccess: () => {
                    // Optional: show success message
                },
                onError: (errors) => {
                    console.log('Delete errors:', errors);
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen User" />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Manajemen User</h1>
                    <Button onClick={handleAddUser} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah User
                    </Button>
                </div>

                {/* Flash Message */}
                {flash?.info?.message && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-green-800">{flash.info.message}</p>
                    </div>
                )}

                {/* Tabel User */}
                <div className="overflow-x-auto rounded-lg border shadow">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="p-4 font-medium text-gray-900">Nama</th>
                                <th className="p-4 font-medium text-gray-900">Email</th>
                                <th className="p-4 font-medium text-gray-900">Role</th>
                                <th className="p-4 font-medium text-gray-900">Unit Usaha</th>
                                <th className="p-4 font-medium text-gray-900">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id_users} className="hover:bg-gray-50">
                                        <td className="p-4 text-gray-900">{user.name}</td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    user.roles === 'kepala_desa'
                                                        ? 'bg-green-100 text-green-800'
                                                        : user.roles === 'kepala_bumdes'
                                                          ? 'bg-blue-100 text-blue-800'
                                                          : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {user.roles === 'kepala_desa'
                                                    ? 'Kepala Desa'
                                                    : user.roles === 'kepala_bumdes'
                                                      ? 'Kepala Bumdes'
                                                      : 'Pengelola'}
                                            </span>
                                        </td>

                                        <td className="p-4 text-gray-600">
                                            {user.units && user.units.length > 0 ? (
                                                <span className="inline-flex rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                                                    {user.units[0].name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(user)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(user)}
                                                    className="flex items-center gap-1"
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
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Tidak ada data user
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Menampilkan {users.from} - {users.to} dari {users.total} data
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={users.current_page <= 1}
                                onClick={() => router.visit(route('users.index', { page: users.current_page - 1 }))}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </Button>
                            <span className="flex items-center px-3 py-1 text-sm text-gray-700">
                                Halaman {users.current_page} dari {users.last_page}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={users.current_page >= users.last_page}
                                onClick={() => router.visit(route('users.index', { page: users.current_page + 1 }))}
                                className="flex items-center gap-1"
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
                    onSubmit={handleSubmit}
                    data={data}
                    setData={setData}
                    processing={processing}
                />
            </div>
        </AppLayout>
    );
}
