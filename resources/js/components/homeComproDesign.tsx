import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, BanknoteIcon, Building, Calendar } from 'lucide-react';
import React from 'react';
import MainLayout from '../components/layout_compro/MainLayout';

// ======================
// Data Section
// ======================

const HERO_DATA = {
    title: 'Membangun Desa',
    highlight: 'Melalui Ekonomi Kreatif',
    description:
        'BUMDES Bagja Waluya hadir dengan berbagai unit usaha dan layanan untuk meningkatkan kesejahteraan masyarakat desa melalui inovasi dan pemberdayaan ekonomi lokal.',
    image: '/assets/images/foto_bumdes.jpg',
    imageCaption: 'Sekretariat BUMDes Bagja Waluya',
    cta: [
        { label: 'Lihat Unit Usaha', href: '/unit-usaha', primary: true },
        { label: 'Hubungi Kami', href: '/kontak', primary: false },
    ],
};

const DUMMY_STATS = [
    { number: '5', label: 'Unit Usaha', icon: Building },
    { number: '2016', label: 'Tahun Berdiri', icon: Calendar },
    { number: 'Rp.300,000', label: 'Pendapatan bulan ini', icon: BanknoteIcon },
    { number: 'Rp.300,000', label: 'Pengeluaran bulan ini', icon: BanknoteIcon },
];

const WELCOME_MESSAGE = {
    title: 'Sambutan Kepala Desa',
    message: `Assalamu’alaikum warahmatullahi wabarakatuh.\n\n
  Puji syukur ke hadirat Tuhan Yang Maha Esa, atas limpahan rahmat dan karunia-Nya sehingga Desa kami dapat terus berkembang menjadi desa yang mandiri dan produktif. Website ini hadir sebagai jembatan informasi dan transparansi antara pemerintah desa dan masyarakat. Kami berharap partisipasi aktif dari seluruh warga untuk bersama-sama membangun desa yang lebih baik.`,
    name: 'H. Haris Iwan Gunawan',
    position: 'Kepala Desa',
    period: '2021 - 2027',
    photo: 'assets/images/kepala_bumdes.jpg',
};

// ======================
// Component
// ======================

const Home: React.FC = () => {
    return (
        <MainLayout title="Beranda">
            {/* Hero Section */}
            <section className="font-Inter relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-700 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-20">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Text */}
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                                {HERO_DATA.title}
                                <span className="block text-yellow-300">{HERO_DATA.highlight}</span>
                            </h1>
                            <p className="mb-8 text-xl leading-relaxed text-blue-100">{HERO_DATA.description}</p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                {HERO_DATA.cta.map((btn, i) => (
                                    <Link
                                        key={i}
                                        href={btn.href}
                                        className={
                                            btn.primary
                                                ? 'inline-flex items-center justify-center rounded-lg bg-yellow-400 px-8 py-4 font-semibold text-blue-900 hover:bg-yellow-300'
                                                : 'inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 font-semibold text-white hover:bg-white hover:text-blue-600'
                                        }
                                    >
                                        {btn.label}
                                        {btn.primary && <ArrowRight className="ml-2 h-5 w-5" />}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            className="group relative"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-blue-100/10 shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.015]">
                                <img src={HERO_DATA.image} alt={HERO_DATA.imageCaption} className="h-full w-full object-cover" />
                            </div>
                            <div className="absolute -top-4 -right-4 h-24 w-24 animate-pulse rounded-full bg-yellow-300/20 blur-lg"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 animate-ping rounded-full bg-blue-200/20 blur-md"></div>
                            <div className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 text-sm text-white backdrop-blur-sm">
                                {HERO_DATA.imageCaption}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="inline-block rounded-lg bg-blue-100 px-4 py-1 text-lg font-bold text-blue-700 md:text-xl">Data Statistik</h2>
                        <p className="mt-2 text-sm text-gray-600 md:text-base">Informasi singkat mengenai kinerja dan perkembangan BUMDes.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {DUMMY_STATS.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={i}
                                    className="space-y-2 text-center sm:space-y-3"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: i * 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 sm:h-16 sm:w-16 sm:rounded-xl">
                                        <Icon className="h-6 w-6 text-blue-700 sm:h-8 sm:w-8" />
                                    </div>
                                    <div className="text-xl font-bold text-blue-700 sm:text-3xl">{stat.number}</div>
                                    <div className="text-sm font-medium text-gray-600 sm:text-base">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Welcome Section */}
            <section className="bg-gradient-to-br from-white via-blue-50 to-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
                        {/* Text */}
                        <motion.div
                            className="order-2 md:order-1"
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="inline-block rounded-full bg-blue-100 px-5 py-2 text-base font-semibold text-blue-700 sm:text-lg">
                                {WELCOME_MESSAGE.title}
                            </h2>
                            <p className="mt-5 text-lg leading-relaxed whitespace-pre-line text-gray-700 sm:text-xl">{WELCOME_MESSAGE.message}</p>
                            <p className="mt-6 font-semibold text-blue-700">- {WELCOME_MESSAGE.position}</p>
                        </motion.div>

                        {/* Photo */}
                        <motion.div
                            className="order-1 flex flex-col items-center text-center md:order-2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative h-60 w-60 overflow-hidden rounded-4xl shadow-lg ring-4 ring-blue-100 transition-transform duration-300 hover:scale-105">
                                <img src={WELCOME_MESSAGE.photo} alt={WELCOME_MESSAGE.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="mt-4 text-xl font-bold text-gray-800">{WELCOME_MESSAGE.name}</div>
                            <div className="text-md mt-1 font-semibold text-blue-600">{WELCOME_MESSAGE.position}</div>
                            <div className="text-sm text-gray-600">{WELCOME_MESSAGE.period}</div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default Home;
