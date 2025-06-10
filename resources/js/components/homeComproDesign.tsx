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
            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
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
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        {dataStats.map((stat, index) => {
                            const IconComponent = stat.icon || Building;
                            return (
                                <div key={index} className="text-center">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
                                        <IconComponent className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="text-3xl font-bold">{stat.number}</div>
                                    <div className="mt-1 font-semibold text-blue-600">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            
        </MainLayout>
    );
};

export default Home;