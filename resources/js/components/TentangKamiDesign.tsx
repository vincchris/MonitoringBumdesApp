import MainLayout from '@/components/layout_compro/MainLayout';
import { Award, Building, Calendar, Eye, Handshake, Heart, LucideIcon, Shield, Target, TrendingUp, Users } from 'lucide-react';
import React from 'react';

interface StatItem {
    number: string;
    label: string;
    icon: LucideIcon;
}

interface ValueItem {
    icon: LucideIcon;
    title: string;
    description: string;
}

const TentangKami: React.FC = () => {
    const achievements: string[] = [
        'Meraih penghargaan BUMDes Terbaik Tingkat Kabupaten 2023',
        'Omzet tahunan mencapai Rp 2.5 Miliar pada tahun 2024',
        'Berhasil membuka lapangan kerja untuk 50+ warga desa',
        'Kontribusi PADes mencapai 30% dari total pendapatan desa',
    ];

    return (
        <MainLayout title="Tentang Kami">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 h-full w-full">
                    <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute top-40 right-20 h-32 w-32 rounded-full bg-blue-300/20 blur-2xl"></div>
                    <div className="absolute bottom-20 left-1/4 h-16 w-16 rounded-full bg-indigo-300/30 blur-lg"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-5xl leading-relaxed font-bold text-transparent md:text-6xl">
                            BUMDes Bagja Waluya
                        </h1>
                        <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
                            Mewujudkan kemandirian ekonomi desa melalui pengelolaan potensi lokal yang berkelanjutan dan inovatif
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">📍 Desa Sumberjaya, Kecamatan Cihaurbeuti, Ciamis, Jawa Barat</span>
    
                        </div>
                    </div>
                </div>
            </section>

            {/* Profil Section */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                        <div className="space-y-8">
                            <div>
                                <h2 className="mb-6 text-4xl font-bold text-gray-900">
                                    Profil <span className="text-blue-600">BUMDes</span>
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                                    BUMDes Bagja Waluya hadir sebagai katalisator pembangunan ekonomi desa yang didirikan pada tahun 2019. Kami
                                    mengelola berbagai unit usaha strategis yang tidak hanya menghasilkan keuntungan, tetapi juga memberdayakan
                                    masyarakat lokal.
                                </p>
                                <p className="text-lg leading-relaxed text-gray-700">
                                    Dengan pendekatan modern dan tetap mempertahankan nilai-nilai kearifan lokal, kami berkomitmen menjadi motor
                                    penggerak ekonomi desa yang sustainable dan inklusif.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="mb-4 text-xl font-semibold text-gray-900">Pencapaian Utama:</h3>
                                {achievements.map((achievement, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                                        <p className="text-gray-700">{achievement}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 rotate-3 transform rounded-3xl bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                            <div className="relative -rotate-1 transform rounded-3xl bg-white p-8 shadow-2xl transition-transform duration-300 hover:rotate-0">
                                <div className="aspect-w-4 aspect-h-3">
                                    <img
                                        src="/assets/images/foto_bumdes.jpg"
                                        alt="Kantor BUMDes Bagja Waluya"
                                        className="h-64 w-full rounded-2xl object-cover"
                                    />
                                </div>
                                <div className="mt-6">
                                    <h4 className="mb-2 text-lg font-semibold text-gray-900">Kantor BUMDes Bagja Waluya</h4>
                                    <p className="text-gray-600">Pusat koordinasi dan pelayanan masyarakat desa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visi Misi Section */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Visi & Misi</h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            Landasan fundamental yang mengarahkan setiap langkah perjalanan BUMDes Bagja Waluya
                        </p>
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
                            <p className="text-lg leading-relaxed text-gray-700">
                                "Menjadi BUMDes unggulan di tingkat regional dalam pengelolaan usaha dan pelayanan masyarakat desa yang inovatif,
                                mandiri, dan berkelanjutan untuk menciptakan kesejahteraan bersama."
                            </p>
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
                                <li className="flex items-start">
                                    <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                                    <span>Mengembangkan unit usaha produktif berbasis potensi dan kearifan lokal desa</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                                    <span>Memberdayakan masyarakat melalui pelatihan, pendampingan, dan kemitraan strategis</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                                    <span>Menjalin kerja sama dengan berbagai pihak untuk meningkatkan nilai tambah produk lokal</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                                    <span>Menjadi kontributor utama Pendapatan Asli Desa (PADes) yang berkelanjutan</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default TentangKami;
