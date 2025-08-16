import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Pencil, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface UserItem {
  id_users: number;
  name: string;
  email: string;
  roles: string;
  image?: string;
}

interface PaginatedUserData {
  data: UserItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  users: PaginatedUserData;
}

export default function UserList({ users }: Props) {
  const { flash, errors } = usePage().props as unknown as {
    flash: { info?: { message?: string; method?: string } };
    errors: Record<string, string>;
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

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<null | number>(null);

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      router.delete(`/admin/users/${id}`);
    }
  };

  const { data, setData, post, put, processing, reset, errors: formErrors } = useForm({
    name: '',
    email: '',
    roles: '',
    password: '',
  });

  const handleSubmitUser = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      router.put(`/admin/users/${editing}`, data, {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          setShowModal(false);
          setEditing(null);
        },
      });
    } else {
      post(`/admin/users`, {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          setShowModal(false);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
    setEditing(null);
  };

  const handleEdit = (user: UserItem) => {
    setShowModal(true);
    setEditing(user.id_users);
    setData({
      name: user.name,
      email: user.email,
      roles: user.roles,
      password: '',
    });
  };

  return (
    <AppLayout>
      <Head title="Kelola Pengguna" />

      {flashMessage && (
        <div className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}>
          {renderFlashIcon()}
          <span>{flashMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
        <h1 className="text-lg font-semibold">Daftar Pengguna</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Cari nama/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border bg-gray-100 px-4 py-2 text-sm outline-none"
          />
          <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
            Tambah User +
          </Button>
        </div>
      </div>

      {showModal && (
        <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
            {Object.keys(formErrors).length > 0 && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
                <ul>
                  {Object.entries(formErrors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
            )}
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                  value={data.roles}
                  onChange={(e) => setData('roles', e.target.value)}
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="kepala_desa">Kepala Desa</option>
                  <option value="pengelola">Pengelola</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required={!editing}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-500">
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button type="button" className="bg-gray-300 text-black" onClick={handleCloseModal}>
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white px-6 py-4 rounded-2xl">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full bg-white text-sm text-black">
            <thead className="bg-gray-100 font-semibold text-black">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3 text-center">Foto</th>
                <th className="px-4 py-3 text-center">Nama</th>
                <th className="px-4 py-3 text-center">Email</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.data.length > 0 ? (
                users.data.map((user, i) => (
                  <tr key={user.id_users} className="border-t">
                    <td className="px-4 py-3 text-center">{(users.from || 0) + i}</td>
                    <td className="px-4 py-3 text-center">
                      <img
                        src={user.image || '/assets/images/avatar.png'}
                        alt="User Avatar"
                        className="h-8 w-8 rounded-full object-cover mx-auto"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">{user.name}</td>
                    <td className="px-4 py-3 text-center">{user.email}</td>
                    <td className="px-4 py-3 text-center">{user.roles}</td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id_users)}
                        className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end gap-2 items-center">
            <Button
              variant="outline"
              size="icon"
              disabled={users.current_page === 1}
              onClick={() => {
                if (users.current_page > 1) {
                  router.get(route().current()!, { page: users.current_page - 1 }, { preserveState: true });
                }
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === users.current_page ? 'default' : 'outline'}
                onClick={() => {
                  router.get(route().current()!, { page }, { preserveState: true });
                }}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={users.current_page === users.last_page}
              onClick={() => {
                if (users.current_page < users.last_page) {
                  router.get(route().current()!, { page: users.current_page + 1 }, { preserveState: true });
                }
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
