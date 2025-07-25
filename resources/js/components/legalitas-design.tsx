import MainLayout from '@/components/layout_compro/MainLayout';
import { BookMarked, ChevronDown, FileText } from 'lucide-react';
import React, { useState } from 'react';

interface DasarHukum {
    title: string;
    desc: string;
}

interface Dokumen {
    name: string;
    number: string;
    date: string;
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
        name: 'Akta Pendirian',
        number: 'No. 15/Akt/2019',
        date: '15 Juli 2019',
        image: 'https://tse3.mm.bing.net/th/id/OIP.ATWFGvYeyY77gaaCOxrBnwHaKK?rs=1&pid=ImgDetMain',
    },
    {
        name: 'SK Kepala Desa',
        number: 'No. 421/2019',
        date: '20 Juli 2019',
        image: 'https://tse3.mm.bing.net/th/id/OIP.ATWFGvYeyY77gaaCOxrBnwHaKK?rs=1&pid=ImgDetMain',
    },
    {
        name: 'NPWP BUMDes',
        number: '99.123.456.7-999.000',
        date: '2 Agustus 2019',
        image: 'https://tse3.mm.bing.net/th/id/OIP.ATWFGvYeyY77gaaCOxrBnwHaKK?rs=1&pid=ImgDetMain',
    },
    {
        name: 'NIB (Nomor Induk Berusaha)',
        number: '8123456789123',
        date: '10 Januari 2020',
        image: 'https://tse3.mm.bing.net/th/id/OIP.ATWFGvYeyY77gaaCOxrBnwHaKK?rs=1&pid=ImgDetMain',
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
                <div className="mx-auto max-w-3xl px-4">
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">Legalitas BUMDes</h1>
                    <p className="text-lg text-blue-100">
                        Dasar hukum dan dokumen resmi yang mendukung operasional BUMDes Bagja Waluya secara sah dan transparan
                    </p>
                </div>
            </section>

            {/* Dasar Hukum */}
            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
                </div>
            </section>

            {/* Dokumen Legalitas Accordion */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-3xl px-4">
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
                                            <p className="text-sm text-gray-600">
                                                {doc.number} - {doc.date}
                                            </p>
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
                </div>
            </section>
        </MainLayout>
    );
};

export default Legalitas;
