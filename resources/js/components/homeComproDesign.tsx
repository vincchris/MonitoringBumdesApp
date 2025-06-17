import { Link } from '@inertiajs/react';
import { ArrowRight, Building, Calendar, Heart, Users } from 'lucide-react';
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
        { number: '500+', label: 'Warga Terlayani', icon: Users },
        { number: '2019', label: 'Tahun Berdiri', icon: Calendar },
        { number: '95%', label: 'Kepuasan Pelanggan', icon: Heart },
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
                        <div className="relative">
                            <div className="aspect-video overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/WVjI5t5TLU0?si=KQve-XQ7utjeUu3g"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="h-full w-full rounded-2xl"
                                ></iframe>
                            </div>
                            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-yellow-400/20"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/20"></div>
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
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fade-up grid items-center gap-10 duration-700 md:grid-cols-2">
                        {/* Foto Kepala Desa */}
                        <div className="flex flex-col items-center text-center">
                            <img
                                src="https://cdn.pixabay.com/photo/2021/07/09/14/22/photographer-6399191_1280.jpg"
                                alt="Kepala Desa"
                                className="h-60 w-60 rounded-4xl object-cover shadow-md"
                            />
                            <div className="mt-4 text-lg font-bold text-gray-800">Muhammad Dhafa</div>
                            <div className="text-md mt-1 font-semibold text-blue-700">Kepala desa</div>
                            <div className="text-sm text-gray-700">2025-2030</div>
                        </div>

                        {/* Sambutan */}
                        <div>
                            <h2 className="inline-block rounded-lg bg-blue-100 px-4 py-1 font-bold text-blue-700 md:text-xl">Sambutan Kepala Desa</h2>
                            <p className="mt-4 text-base text-gray-700 sm:text-lg">
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
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default Home;
