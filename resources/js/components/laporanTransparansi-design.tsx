import MainLayout from '@/components/layout_compro/MainLayout';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BarChart3, FileDown, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type GrafikItem = {
    bulan: string;
    pemasukan: number;
    pengeluaran: number;
};

type Ringkasan = {
    total_pemasukan: number;
    total_pengeluaran: number;
    surplus: number;
    saldo_akhir: number;
};

const Laporan: React.FC = () => {
    const { props } = usePage<{
        grafik: GrafikItem[];
        ringkasan: Ringkasan;
    }>();

    const { grafik, ringkasan } = props;

    const formatRupiah = (val: number) => `Rp${val.toLocaleString('id-ID')}`;

    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        const toastId = toast.loading('Menyiapkan laporan PDF...');

        try {
            const response = await fetch(route('laporan.download'), {
                method: 'GET',
            });

            if (!response.ok) throw new Error('Gagal mengunduh laporan');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'laporan-keuangan.pdf';
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Laporan berhasil diunduh!', { id: toastId });
        } catch (error) {
            toast.error('Terjadi kesalahan saat mengunduh!', { id: toastId });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout title="Laporan Keuangan">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-center text-white">
                <div className="absolute inset-0 bg-black/10" />
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative mx-auto max-w-4xl px-6"
                >
                    <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                        Laporan & <span className="text-blue-200">Transparansi</span>
                    </h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
                        Laporan keuangan BUMDes Bagja Waluya yang disusun secara transparan dan akuntabel.
                    </p>
                </motion.div>
            </section>

            {/* Ringkasan Keuangan */}
            <section className="bg-white py-16">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-6xl px-6"
                >
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                        <div className="rounded-xl bg-blue-100 p-6 text-center">
                            <p className="text-sm font-medium text-blue-600">Total Pemasukan</p>
                            <p className="mt-2 text-2xl font-bold text-blue-800">{formatRupiah(ringkasan.total_pemasukan)}</p>
                        </div>
                        <div className="rounded-xl bg-blue-100 p-6 text-center">
                            <p className="text-sm font-medium text-blue-600">Total Pengeluaran</p>
                            <p className="mt-2 text-2xl font-bold text-blue-800">{formatRupiah(ringkasan.total_pengeluaran)}</p>
                        </div>
                        <div className="rounded-xl bg-blue-100 p-6 text-center">
                            <p className="text-sm font-medium text-blue-600">Surplus</p>
                            <p className="mt-2 text-2xl font-bold text-blue-800">{formatRupiah(ringkasan.surplus)}</p>
                        </div>
                        <div className="rounded-xl bg-blue-100 p-6 text-center">
                            <p className="text-sm font-medium text-blue-600">Saldo Akhir</p>
                            <p className="mt-2 text-2xl font-bold text-blue-800">Rp{Math.round(ringkasan.saldo_akhir).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Grafik Keuangan */}
            <section className="bg-blue-50 py-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-6xl px-6"
                >
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-blue-800">Grafik Keuangan {new Date().getFullYear()}</h2>
                        <p className="mx-auto max-w-2xl text-blue-700">
                            Grafik ini menunjukkan perkembangan keuangan dari bulan ke bulan sepanjang tahun {new Date().getFullYear()}.
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-md">
                        <div className="mb-4 flex items-center gap-3 font-semibold text-blue-700">
                            <BarChart3 className="h-6 w-6" />
                            Grafik Pemasukan vs Pengeluaran
                        </div>

                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={grafik} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bulan" />
                                <YAxis tickFormatter={(val) => `Rp${val / 1_000_000}jt`} />
                                <Tooltip formatter={(val: number) => formatRupiah(val)} />
                                <Line type="monotone" dataKey="pemasukan" stroke="#2563eb" strokeWidth={3} name="Pemasukan" />
                                <Line type="monotone" dataKey="pengeluaran" stroke="#9333ea" strokeWidth={3} name="Pengeluaran" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </section>

            {/* Unduh Laporan */}
            <section className="bg-white py-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl px-6 text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold text-blue-800">Unduh Laporan Resmi</h2>
                    <p className="mb-8 text-blue-700">
                        Anda dapat mengunduh laporan lengkap dalam format PDF untuk tahun {new Date().getFullYear()}.
                    </p>
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Menyiapkan...
                            </>
                        ) : (
                            <>
                                <FileDown className="h-5 w-5" />
                                Unduh Laporan PDF
                            </>
                        )}
                    </button>
                </motion.div>
            </section>

            {/* Pernyataan Transparansi */}
            <section className="bg-blue-50 py-20">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl px-6 text-center"
                >
                    <h2 className="mb-4 text-2xl font-bold text-blue-800">Komitmen Transparansi</h2>
                    <p className="leading-relaxed text-blue-700">
                        Kami berkomitmen untuk mengelola dana BUMDes secara <strong>transparan</strong>, <strong>akuntabel</strong>, dan{' '}
                        <strong>terbuka</strong> kepada seluruh warga Desa Bagja Waluya. Seluruh laporan keuangan dapat diakses kapan saja dan akan
                        terus diperbarui secara berkala.
                    </p>
                </motion.div>
            </section>
        </MainLayout>
    );
};

export default Laporan;
