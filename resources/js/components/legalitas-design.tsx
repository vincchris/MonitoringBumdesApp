import MainLayout from '@/components/layout_compro/MainLayout';
import { motion } from 'framer-motion';
import { BookMarked, ChevronDown, FileText } from 'lucide-react';
import React, { useState } from 'react';

interface DasarHukum {
    title: string;
    desc: string;
}

interface Dokumen {
    name: string;
    number: string;
    image: string; // path ke gambar dokumen
}

const dasarHukum: DasarHukum[] = [
    {
        title: 'Undang-Undang No. 6 Tahun 2014',
        desc: 'Tentang Desa, mengatur pembentukan dan pengelolaan BUMDes.',
    },
    {
        title: 'Permendesa No. 4 Tahun 2015',
        desc: 'Tentang Pendirian, Pengurusan, dan Pengelolaan BUMDes.',
    },
    {
        title: 'Perdes No. 03 Tahun 2019',
        desc: 'Peraturan Desa Sumberjaya tentang pendirian BUMDes Bagja Waluya.',
    },
];

const dokumenLegal: Dokumen[] = [
    {
        name: 'Sertifikat Pendaftaran Pendirian Badan Hukum BUMDes',
        number: 'AHU-01539.AH.01.33.TAHUN 2022',
        image: '/assets/images/legalitas.jpg',
    },
];

const Legalitas: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <MainLayout title="Legalitas">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 py-20 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl px-4"
                >
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">Legalitas BUMDes</h1>
                    <p className="text-lg text-blue-100">
                        Dasar hukum dan dokumen resmi yang mendukung operasional BUMDes Bagja Waluya secara sah dan transparan
                    </p>
                </motion.div>
            </section>

            {/* Dasar Hukum */}
            <section className="bg-gray-50 py-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x:0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
                >
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-800">Dasar Hukum</h2>
                        <p className="text-gray-600">Landasan peraturan yang menjadi dasar pendirian dan operasional BUMDes</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {dasarHukum.map((item, idx) => (
                            <div key={idx} className="rounded-2xl border bg-white p-6 shadow-md transition hover:shadow-lg">
                                <BookMarked className="mb-4 h-6 w-6 text-blue-600" />
                                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                                <p className="mt-2 text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Dokumen Legalitas Accordion */}
            <section className="bg-white py-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl px-4"
                >
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-800">Dokumen Legalitas</h2>
                        <p className="text-gray-600">Klik pada dokumen untuk melihat tampilan scan-nya.</p>
                    </div>

                    <div className="space-y-4">
                        {dokumenLegal.map((doc, idx) => (
                            <div key={idx} className="overflow-hidden rounded-xl border border-blue-200 shadow-sm">
                                <button
                                    onClick={() => toggleAccordion(idx)}
                                    className="flex w-full items-center justify-between bg-blue-50 px-6 py-4 text-left transition hover:bg-blue-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-blue-600" />
                                        <div>
                                            <h3 className="text-md font-semibold text-blue-800">{doc.name}</h3>
                                            <p className="text-sm text-gray-600">{doc.number}</p>
                                        </div>
                                    </div>
                                    <ChevronDown className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                                </button>
                                {openIndex === idx && (
                                    <div className="border-t bg-white p-6">
                                        <img
                                            src={doc.image}
                                            alt={`Foto ${doc.name}`}
                                            className="mx-auto max-h-[400px] w-auto rounded-md object-contain shadow-md"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>
        </MainLayout>
    );
};

export default Legalitas;
