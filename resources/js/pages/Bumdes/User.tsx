import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface UserItem {
  id_users: number;
  name: string;
  email: string;
  roles: string;
  image?: string;
}

interface Props {
  users: UserItem[];
}

export default function UserList({ users }: Props) {
  const [search, setSearch] = useState('');

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      router.delete(`/admin/users/${id}`);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <Head title="Kelola Pengguna" />

      <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
        <h1 className="text-lg font-semibold text-black">Daftar Pengguna</h1>
        <input
          type="text"
          placeholder="Cari nama/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border bg-gray-100 px-4 py-2 text-sm outline-none"
        />
      </div>

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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <tr key={user.id_users} className="border-t">
                    <td className="px-4 py-3 text-center">{i + 1}</td>
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
                    <td className="px-4 py-3 text-center">
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
        </div>
      </div>
    </AppLayout>
  );
}
