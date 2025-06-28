import MainLayout from '@/components/layout_compro/MainLayout';
import {
  Users,
  User,
  Briefcase,
  Crown,
  Layers,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';
import React from 'react';

interface OrgItem {
  title: string;
  name: string;
  icon: LucideIcon;
  color: string;
  photo: string;
}

const struktur: OrgItem[] = [
  {
    title: 'Pembina',
    name: 'Kepala Desa Sumberjaya',
    icon: Crown,
    color: 'text-yellow-500',
    photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
  },
  {
    title: 'Pengawas',
    name: 'BPD (Badan Permusyawaratan Desa)',
    icon: CheckCircle2,
    color: 'text-green-600',
    photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
  },
  {
    title: 'Direktur Utama',
    name: 'Andi Nugraha, S.E.',
    icon: User,
    color: 'text-blue-600',
    photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
  },
  {
    title: 'Manajer Operasional',
    name: 'Siti Rohmah',
    icon: Briefcase,
    color: 'text-purple-600',
    photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
  },
  {
    title: 'Divisi Keuangan',
    name: 'Rudi Hartono',
    icon: Layers,
    color: 'text-pink-500',
    photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
  },
  {
    title: 'Divisi Pemasaran',
    name: 'Lina Marlina',
    icon: Users,
    color: 'text-indigo-500',
    photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
  },
];

const StrukturOrganisasi: React.FC = () => {
  return (
    <MainLayout title="Struktur Organisasi">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Struktur Organisasi</h1>
          <p className="text-lg text-blue-100">
            Susunan kepengurusan dan tanggung jawab dalam pengelolaan BUMDes Bagja Waluya
          </p>
        </div>
      </section>

      {/* Struktur Organisasi Grid */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {struktur.map(({ title, name, icon: Icon, color, photo }, index) => (
              <div
                key={index}
                className="rounded-3xl bg-white shadow-md p-6 text-center border hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={photo}
                  alt={name}
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover border-4 border-gray-200 shadow"
                />
                <div className="mb-3 flex justify-center">
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600 mt-1">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default StrukturOrganisasi;
