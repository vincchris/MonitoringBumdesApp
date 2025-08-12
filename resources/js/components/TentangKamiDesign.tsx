import MainLayout from '@/components/layout_compro/MainLayout';
import { Eye, Target } from 'lucide-react';
import React from 'react';

// ====== Data section ======
const profilData = [
    { label: 'Nama Desa', value: 'Sumberjaya' },
    { label: 'Kecamatan', value: 'Cihaurbeuti' },
    { label: 'Kepala Desa', value: 'H Haris Iwan Gunawan', sub: '2021–2027' },
    { label: 'Luas Desa', value: '419,49 Ha' },
    { label: 'BUMDes', value: 'Bagja Waluya' },
    { label: 'Email BUMDes', value: 'bmdsbagjawaluya21@gmail.com', highlight: true },
];

const visiText =
    'Menjadi BUMDes unggulan di tingkat regional dalam pengelolaan usaha dan pelayanan masyarakat desa yang inovatif, mandiri, dan berkelanjutan untuk menciptakan kesejahteraan bersama.';

const misiList = [
    'Mengembangkan unit usaha produktif berbasis potensi dan kearifan lokal desa',
    'Memberdayakan masyarakat melalui pelatihan, pendampingan, dan kemitraan strategis',
    'Menjalin kerja sama dengan berbagai pihak untuk meningkatkan nilai tambah produk lokal',
    'Menjadi kontributor utama Pendapatan Asli Desa (PADes) yang berkelanjutan',
];

const kepalaBUMDes = {
    nama: 'Asep Rohendi',
    jabatan: 'Kepala BUMDes Bagja Waluya',
    deskripsi:
        'Memimpin BUMDes dengan dedikasi tinggi, fokus pada pemberdayaan masyarakat dan pengelolaan potensi desa secara inovatif dan berkelanjutan.',
    foto: '',
};

// ====== COMPONENT SECTION ======
const TentangKami: React.FC = () => {
    return (
        <MainLayout title="Tentang Kami">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-white">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 h-full w-full">
                    <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute top-40 right-20 h-32 w-32 rounded-full bg-blue-300/20 blur-2xl"></div>
                    <div className="absolute bottom-20 left-1/4 h-16 w-16 rounded-full bg-indigo-300/30 blur-lg"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-5xl leading-relaxed font-bold text-transparent md:text-6xl">
                        BUMDes Bagja Waluya
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
                        Mewujudkan kemandirian ekonomi desa melalui pengelolaan potensi lokal yang berkelanjutan dan inovatif.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                            📍 Desa Sumberjaya, Kecamatan Cihaurbeuti, Ciamis, Jawa Barat
                        </span>
                    </div>
                </div>
            </section>

            {/* Profil Section */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                        {/* Data */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="mb-6 text-4xl font-bold text-gray-900">
                                    Profil <span className="text-blue-600">BUMDes</span>
                                </h2>
                                <p className="mb-6 text-lg text-gray-700">
                                    BUMDes Bagja Waluya hadir sebagai katalisator pembangunan ekonomi desa sejak tahun 2016...
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {profilData.map((item, idx) => (
                                    <div key={idx} className="rounded-xl bg-white p-6 shadow hover:shadow-lg">
                                        <h3 className="text-sm font-semibold text-gray-500">{item.label}</h3>
                                        <p className={`text-lg font-medium ${item.highlight ? 'text-blue-600' : 'text-gray-900'}`}>{item.value}</p>
                                        {item.sub && <p className="text-xs text-gray-500">{item.sub}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative">
                            <div className="absolute inset-0 rotate-3 transform rounded-3xl bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                            <div className="relative -rotate-1 transform rounded-3xl bg-white p-8 shadow-2xl hover:rotate-0">
                                <img
                                    src="/assets/images/kantor_desa_sumberjaya.jpg"
                                    alt="Kantor Desa Sumberjaya"
                                    className="h-64 w-full rounded-2xl object-cover"
                                />
                                <div className="mt-6">
                                    <h4 className="mb-2 text-lg font-semibold text-gray-900">Kantor Desa Sumberjaya</h4>
                                    <p className="text-gray-600">Pusat koordinasi dan pelayanan masyarakat desa.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visi Misi */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Visi & Misi</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        {/* Visi */}
                        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                            <div className="mb-6 flex items-center">
                                <div className="mr-4 rounded-2xl bg-blue-600 p-3">
                                    <Eye className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Visi</h3>
                            </div>
                            <p className="text-lg text-gray-700">{visiText}</p>
                        </div>

                        {/* Misi */}
                        <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                            <div className="mb-6 flex items-center">
                                <div className="mr-4 rounded-2xl bg-green-600 p-3">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Misi</h3>
                            </div>
                            <ul className="space-y-4 text-gray-700">
                                {misiList.map((misi, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="mt-2 mr-3 h-2 w-2 rounded-full bg-green-500"></span>
                                        {misi}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kepala BUMDes */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-4xl font-bold text-gray-900">
                        Kepala <span className="text-blue-600">BUMDes</span>
                    </h2>
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-blue-200 blur-2xl"></div>
                            <img
                                src={kepalaBUMDes.foto}
                                alt={kepalaBUMDes.nama}
                                className="relative z-10 h-48 w-48 rounded-full border-4 border-white object-cover shadow-lg"
                            />
                        </div>
                        <h3 className="mt-6 text-2xl font-bold text-gray-900">{kepalaBUMDes.nama}</h3>
                        <p className="font-medium text-blue-600">{kepalaBUMDes.jabatan}</p>
                        <p className="mt-4 max-w-xl text-gray-700">{kepalaBUMDes.deskripsi}</p>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default TentangKami;
