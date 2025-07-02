import MainLayout from '@/components/layout_compro/MainLayout';
import React from 'react';

const galeriItems = [
    {
        title: 'Kegiatan Mini Soccer',
        imageUrl: 'https://cdn.pixabay.com/photo/2025/06/27/22/42/butterfly-9684517_1280.jpg',
        description: 'Dokumentasi kegiatan pertandingan Mini Soccer di lapangan BUMDes.',
    },
    {
        title: 'Event Kemah Pramuka',
        imageUrl: 'https://cdn.pixabay.com/photo/2025/06/27/22/42/butterfly-9684517_1280.jpg',
        description: 'Suasana malam api unggun dalam kegiatan kemah pramuka di Buper.',
    },
    {
        title: 'Pasar Kuliner Mingguan',
        imageUrl: 'https://cdn.pixabay.com/photo/2025/06/27/22/42/butterfly-9684517_1280.jpg',
        description: 'Kemeriahan pasar kuliner mingguan yang diadakan di area kios BUMDes.',
    },
    {
        title: 'Instalasi Air Weslik',
        imageUrl: 'https://cdn.pixabay.com/photo/2025/06/27/22/42/butterfly-9684517_1280.jpg',
        description: 'Proses pemasangan instalasi air bersih ke rumah warga.',
    },
    {
        title: 'Pemanfaatan Internet Desa',
        imageUrl: 'https://cdn.pixabay.com/photo/2025/06/27/22/42/butterfly-9684517_1280.jpg',
        description: 'Anak-anak belajar daring menggunakan jaringan internet desa.',
    },
];

const Galeri: React.FC = () => {
    return (
        <MainLayout title="Galeri">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-center text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative mx-auto max-w-4xl px-6">
                    <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                        Galeri <span className="text-blue-200">BUMDes</span>
                    </h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
                        Potret berbagai kegiatan dan layanan yang dijalankan oleh BUMDes Bagja Waluya
                    </p>
                </div>
            </section>

            {/* Galeri Grid */}
            <section className="bg-blue-50 py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-blue-800">Galeri Kegiatan</h2>
                        <p className="mx-auto max-w-2xl text-lg text-blue-600">Dokumentasi kegiatan yang mencerminkan semangat pembangunan desa</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {galeriItems.map((item, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-3xl bg-white shadow-md transition-all hover:shadow-xl">
                                <div className="relative">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="h-64 w-full rounded-t-3xl object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-end rounded-t-3xl bg-black/30 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                                            <p className="line-clamp-2 text-sm text-blue-100">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default Galeri;
