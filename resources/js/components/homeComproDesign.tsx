import { Link } from '@inertiajs/react';
import { ArrowRight, BanknoteIcon, Building, Calendar } from 'lucide-react';
import React from 'react';
import MainLayout from '../components/layout_compro/MainLayout';

interface UnitUsaha {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    icon: string;
    pricing_start: string;
}

interface Berita {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    image: string;
    published_at: string;
    kategori: string;
}

interface Testimoni {
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
}

interface Stat {
    number: string;
    label: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface HomeProps {
    unitUsaha?: UnitUsaha[];
    beritaTerbaru?: Berita[];
    galeriHome?: any[];
    testimoni?: Testimoni[];
    stats?: Stat[];
}

const Home: React.FC<HomeProps> = ({ unitUsaha = [], beritaTerbaru = [], galeriHome = [], testimoni = [], stats = [] }) => {
    const dummyStats: Stat[] = [
        { number: '7', label: 'Unit Usaha', icon: Building },
        { number: '2019', label: 'Tahun Berdiri', icon: Calendar },
        { number: 'Rp.300,000', label: 'Pendapatan bulan ini', icon: BanknoteIcon },
        { number: 'Rp.300,000', label: 'Pengeluaran bulan ini', icon: BanknoteIcon },
    ];

    const dataStats = stats.length > 0 ? stats : dummyStats;

    return (
        <MainLayout title="Beranda">
            {/* Hero Section */}
            <section className="font-Inter relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-700 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        <div>
                            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                                Membangun Desa
                                <span className="block text-yellow-300">Melalui Ekonomi Kreatif</span>
                            </h1>
                            <p className="mb-8 text-xl leading-relaxed text-blue-100">
                                BUMDES Bagja Waluya hadir dengan berbagai unit usaha dan layanan untuk meningkatkan kesejahteraan masyarakat desa
                                melalui inovasi dan pemberdayaan ekonomi lokal.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Link
                                    href="/unit-usaha"
                                    className="inline-flex items-center justify-center rounded-lg bg-yellow-400 px-8 py-4 font-semibold text-blue-900 transition-colors hover:bg-yellow-300"
                                >
                                    Lihat Unit Usaha
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    href="/kontak"
                                    className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600"
                                >
                                    Hubungi Kami
                                </Link>
                            </div>
                        </div>
                        <div className="group relative">
                            {/* Background blur & ring */}
                            <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-blue-100/10 shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.015]">
                                <img
                                    src="/assets/images/foto_bumdes.jpg"
                                    alt="Kantor BUMDes Bagja Waluya"
                                    className="h-full w-full rounded-2xl object-cover"
                                />
                            </div>

                            {/* Animated decorative blobs */}
                            <div className="absolute -top-4 -right-4 h-24 w-24 animate-pulse rounded-full bg-yellow-300/20 blur-lg"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 animate-ping rounded-full bg-blue-200/20 blur-md"></div>

                            {/* Optional caption / overlay */}
                            <div className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 text-sm text-white backdrop-blur-sm">
                                Sekretariat BUMDes Bagja Waluya
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Judul Section */}
                    <div className="mb-12 text-center">
                        <h2 className="inline-block rounded-lg bg-blue-100 px-4 py-1 text-lg font-bold text-blue-700 md:text-xl">Data Statistik</h2>
                        <p className="mt-2 text-sm text-gray-600 md:text-base">Informasi singkat mengenai kinerja dan perkembangan BUMDes.</p>
                    </div>

                    {/* Grid Statistik */}
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {dataStats.map((stat, index) => {
                            const IconComponent = stat.icon || Building;
                            return (
                                <div key={index} className="space-y-2 text-center sm:space-y-3">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 sm:h-16 sm:w-16 sm:rounded-xl">
                                        <IconComponent className="h-6 w-6 text-blue-700 sm:h-8 sm:w-8" />
                                    </div>
                                    <div className="text-xl font-bold text-blue-700 sm:text-3xl">{stat.number}</div>
                                    <div className="text-sm font-medium text-gray-600 sm:text-base">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            
            {/* Section Sambutan Kepala Desa */}
            <section className="bg-gradient-to-br from-white via-blue-50 to-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
                        {/* Sambutan */}
                        <div className="order-2 md:order-1">
                            <h2 className="inline-block rounded-full bg-blue-100 px-5 py-2 text-base font-semibold text-blue-700 sm:text-lg">
                                Sambutan Kepala Desa
                            </h2>
                            <p className="mt-5 text-lg leading-relaxed text-gray-700 sm:text-xl sm:text">
                                Assalamu’alaikum warahmatullahi wabarakatuh.
                                <br />
                                <br />
                                Puji syukur ke hadirat Tuhan Yang Maha Esa, atas limpahan rahmat dan karunia-Nya sehingga Desa kami dapat terus
                                berkembang menjadi desa yang mandiri dan produktif. Website ini hadir sebagai jembatan informasi dan transparansi
                                antara pemerintah desa dan masyarakat. Kami berharap partisipasi aktif dari seluruh warga untuk bersama-sama membangun
                                desa yang lebih baik.
                            </p>
                            <p className="mt-6 font-semibold text-blue-700">- Kepala Desa</p>
                        </div>

                        {/* Foto Kepala Desa */}
                        <div className="order-1 flex flex-col items-center text-center md:order-2">
                            <div className="relative h-60 w-60 overflow-hidden rounded-4xl shadow-lg ring-4 ring-blue-100 transition-transform duration-300 hover:scale-105">
                                <img
                                    src="https://cdn.pixabay.com/photo/2021/07/09/14/22/photographer-6399191_1280.jpg"
                                    alt="Kepala Desa"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="mt-4 text-xl font-bold text-gray-800">Muhammad Dhafa</div>
                            <div className="text-md mt-1 font-semibold text-blue-600">Kepala Desa</div>
                            <div className="text-sm text-gray-600">2025 - 2030</div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default Home;
