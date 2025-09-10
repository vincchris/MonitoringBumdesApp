import MainLayout from '@/components/layout_compro/MainLayout';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, Target } from 'lucide-react';
import React from 'react';

// ====== INTERFACES ======
interface ProfileDesa {
    id: number;
    nama_desa?: string;
    alamat: string;
    kepala_desa: string;
    periode_kepala_desa?: string;
    email?: string;
    telepon?: string;
    luas_desa?: number;
}

interface ProfileBumdes {
    id: number;
    desa_id: number;
    nama_bumdes: string;
    kepala_bumdes: string;
    alamat?: string;
    email?: string;
    telepon?: string;
}

interface TentangKamiProps {
    desa: ProfileDesa;
    bumdes: ProfileBumdes;
}

// ====== Static Data ======
const visiText =
    'Menjadi BUMDes unggulan di tingkat regional dalam pengelolaan usaha dan pelayanan masyarakat desa yang inovatif, mandiri, dan berkelanjutan untuk menciptakan kesejahteraan bersama.';

const misiList = [
    'Mengembangkan unit usaha produktif berbasis potensi dan kearifan lokal desa',
    'Memberdayakan masyarakat melalui pelatihan, pendampingan, dan kemitraan strategis',
    'Menjalin kerja sama dengan berbagai pihak untuk meningkatkan nilai tambah produk lokal',
    'Menjadi kontributor utama Pendapatan Asli Desa (PADes) yang berkelanjutan',
];

// ====== MAIN COMPONENT ======
const TentangKami: React.FC = () => {
    const { desa, bumdes } = usePage<{ desa: ProfileDesa; bumdes: ProfileBumdes }>().props;

    const profilData = [
        { label: 'Nama Desa', value: desa?.nama_desa || 'N/A' },
        { label: 'Alamat Desa', value: desa?.alamat || 'N/A' },
        {
            label: 'Kepala Desa',
            value: desa?.kepala_desa || 'N/A',
            sub: desa?.periode_kepala_desa || undefined,
        },
        {
            label: 'Luas Desa',
            value: desa?.luas_desa ? `${desa?.luas_desa} Ha` : 'N/A',
        },
        { label: 'BUMDes', value: bumdes?.nama_bumdes || 'N/A' },
        {
            label: 'Email BUMDes',
            value: bumdes?.email || 'N/A',
            highlight: !!bumdes?.email,
        },
    ];

    if (!desa || !bumdes) {
        return (
            <MainLayout title="Tentang Kami">
                <div className="py-20 text-center text-gray-600">Data profil desa / BUMDes belum tersedia.</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Tentang Kami">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-white"
            >
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
                        {bumdes.nama_bumdes}
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
                        Mewujudkan kemandirian ekonomi desa melalui pengelolaan potensi lokal yang berkelanjutan dan inovatif.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">📍 {desa.alamat}</span>
                        {desa.email && <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">✉️ {desa.email}</span>}
                        {desa.telepon && <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">📞 {desa.telepon}</span>}
                    </div>
                </div>
            </motion.section>

            {/* Profil Section */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                        {/* Data */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="mb-6 text-4xl font-bold text-gray-900">
                                    Profil <span className="text-blue-600">BUMDes</span>
                                </h2>
                                <p className="mb-6 text-lg text-gray-700">
                                    {bumdes.nama_bumdes} hadir sebagai katalisator pembangunan ekonomi desa yang berkomitmen untuk memberdayakan
                                    masyarakat dan mengoptimalkan potensi lokal demi kesejahteraan bersama.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {profilData.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.2 }}
                                        viewport={{ once: true }}
                                        className="rounded-xl bg-white p-6 shadow transition-shadow duration-300 hover:shadow-lg"
                                    >
                                        <h3 className="mb-2 text-sm font-semibold text-gray-500">{item.label}</h3>
                                        <p className={`text-lg font-medium ${item.highlight ? 'text-blue-600' : 'text-gray-900'}`}>{item.value}</p>
                                        {item.sub && <p className="mt-1 text-xs text-gray-500">{item.sub}</p>}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute inset-0 rotate-3 transform rounded-3xl bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                            <div className="relative -rotate-1 transform rounded-3xl bg-white p-8 shadow-2xl transition-transform duration-300 hover:rotate-0">
                                <motion.img
                                    src="/assets/images/kantor_desa_sumberjaya.jpg"
                                    alt={`Kantor ${desa.nama_desa}`}
                                    className="h-64 w-full rounded-2xl object-cover"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 1 }}
                                    viewport={{ once: true }}
                                />
                                <div className="mt-6">
                                    <h4 className="mb-2 text-lg font-semibold text-gray-900">Kantor {desa.nama_desa}</h4>
                                    <p className="text-gray-600">Pusat koordinasi dan pelayanan masyarakat desa.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Visi Misi */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Visi & Misi</h2>
                        <p className="mx-auto max-w-2xl text-gray-600">Komitmen kami dalam membangun desa yang mandiri dan berkelanjutan</p>
                    </div>
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        {/* Visi */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 transition-shadow duration-300 hover:shadow-lg"
                        >
                            <div className="mb-6 flex items-center">
                                <div className="mr-4 rounded-2xl bg-blue-600 p-3">
                                    <Eye className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Visi</h3>
                            </div>
                            <p className="text-lg leading-relaxed text-gray-700">{visiText}</p>
                        </motion.div>

                        {/* Misi */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-8 transition-shadow duration-300 hover:shadow-lg"
                        >
                            <div className="mb-6 flex items-center">
                                <div className="mr-4 rounded-2xl bg-green-600 p-3">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Misi</h3>
                            </div>
                            <ul className="space-y-4 text-gray-700">
                                {misiList.map((misi, idx) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-start"
                                    >
                                        <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                                        <span className="leading-relaxed">{misi}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Kepala BUMDes */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">
                            Kepala <span className="text-blue-600">BUMDes</span>
                        </h2>
                        <p className="mx-auto max-w-2xl text-gray-600">Pemimpin yang berkomitmen dalam memajukan ekonomi desa</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mx-auto flex max-w-4xl flex-col items-center"
                    >
                        <div className="relative mb-8">
                            <div className="absolute inset-0 rounded-full bg-blue-200 blur-2xl"></div>
                            <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg">
                                <span className="text-6xl font-bold text-white">{bumdes.kepala_bumdes.charAt(0)}</span>
                            </div>
                        </div>

                        <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                            <h3 className="mb-2 text-3xl font-bold text-gray-900">{bumdes?.kepala_bumdes || 'Kepala BUMDes'}</h3>
                            <p className="mb-4 text-lg font-medium text-blue-600">Kepala {bumdes?.nama_bumdes || 'BUMDes'}</p>

                            {bumdes?.alamat && <p className="mb-2 text-gray-600">📍 {bumdes.alamat}</p>}

                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                {bumdes?.email && (
                                    <a
                                        href={`mailto:${bumdes.email}`}
                                        className="rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition-colors duration-200 hover:bg-blue-200"
                                    >
                                        ✉️ {bumdes.email}
                                    </a>
                                )}
                                {bumdes?.telepon && (
                                    <a
                                        href={`tel:${bumdes.telepon}`}
                                        className="rounded-lg bg-green-100 px-4 py-2 text-green-700 transition-colors duration-200 hover:bg-green-200"
                                    >
                                        📞 {bumdes.telepon}
                                    </a>
                                )}
                            </div>

                            <p className="mt-6 leading-relaxed text-gray-700">
                                Memimpin BUMDes dengan dedikasi tinggi, fokus pada pemberdayaan masyarakat dan pengelolaan potensi desa secara
                                inovatif dan berkelanjutan untuk mencapai kemandirian ekonomi desa.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </MainLayout>
    );
};

export default TentangKami;
