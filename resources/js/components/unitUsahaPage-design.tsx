import MainLayout from '@/components/layout_compro/MainLayout';
import { Building2, Clock, Globe, LucideIcon, MapPin, ShoppingBag, Volleyball, Waves, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';

interface BusinessUnit {
    title: string;
    icon: LucideIcon;
    imageUrl: string;
    highlights: string[];
    pricing: {
        label: string;
        detail: string;
        basePrice: number; // Harga dasar untuk perhitungan
    }[];
    operatingHours: string;
    contact: string;
    whatsapp: string;
    location: string;
    terms: string[];
    note?: string;
    calculationType: 'duration' | 'participants' | 'none'; // Tipe perhitungan
    unit: string; // Unit perhitungan (jam, peserta, dll)
}

interface FAQ {
    question: string;
    answer: string;
}

const units: BusinessUnit[] = [
    {
        title: 'Mini Soccer',
        icon: Volleyball,
        imageUrl: 'assets/images/lapang_minisoc.jpg',
        highlights: ['Fasilitas: Lapangan rumput sintetis', 'Bonus: Air mineral gelas 1 dus', 'Parkir luas tersedia', 'Toilet dan ruang ganti'],
        pricing: [
            { label: 'Umum', detail: 'Rp250.000 / jam', basePrice: 250000 },
            { label: 'Member', detail: 'Rp200.000 / jam', basePrice: 200000 },
        ],
        operatingHours: '06:00 - 22:00 WIB',
        contact: '0812-3456-7890',
        whatsapp: '6281234567890',
        location: 'Jl. Desa Utama No. 15, Bagja Waluya',
        terms: ['Booking minimal 1 jam sebelumnya', 'DP 50% untuk konfirmasi booking', 'Pembayaran cash/transfer'],
        calculationType: 'duration',
        unit: 'jam',
    },
    {
        title: 'Bumi Perkemahan (Buper)',
        icon: Globe,
        imageUrl: 'assets/images/lapang_buper.jpg',
        highlights: ['Lahan luas dan rindang', 'Cocok untuk event besar seperti perkemahan', 'Fasilitas MCK lengkap', 'Area parkir luas'],
        pricing: [
            { label: '> 300 Peserta', detail: 'Rp3.000.000 / kegiatan', basePrice: 3000000 },
            { label: '< 300 Peserta', detail: 'Rp2.500.000 / kegiatan', basePrice: 2500000 },
        ],
        operatingHours: '24 Jam (dengan koordinasi)',
        contact: '0812-3456-7891',
        whatsapp: '6281234567891',
        location: 'Area Perkemahan Desa, Bagja Waluya',
        terms: ['Booking minimal 1 minggu sebelumnya', 'DP 30% untuk konfirmasi', 'Termasuk fasilitas dasar'],
        calculationType: 'none', // Harga tetap per kegiatan
        unit: 'kegiatan',
    },
    {
        title: 'Kios',
        icon: ShoppingBag,
        imageUrl: 'assets/images/Kios2.jpg',
        highlights: ['Lokasi strategis', 'Sewa tahunan', 'Akses mudah dari jalan utama', 'Listrik dan air tersedia'],
        pricing: [
            { label: 'Depan Puskesmas', detail: 'Rp3.000.000 / tahun', basePrice: 3000000 },
            { label: 'Depan Kantor Desa', detail: 'Rp1.500.000 / tahun', basePrice: 1500000 },
            { label: 'Lapang Kuliner atas Buper', detail: 'Rp750.000 / tahun', basePrice: 750000 },
        ],
        operatingHours: 'Sesuai kesepakatan',
        contact: '0812-3456-7892',
        whatsapp: '6281234567892',
        location: 'Berbagai lokasi strategis di Desa',
        terms: ['Kontrak minimal 1 tahun', 'Pembayaran di muka', 'Deposit keamanan Rp500.000'],
        calculationType: 'none', // Harga tetap per tahun
        unit: 'tahun',
    },
    {
        title: 'Air Weslik',
        icon: Waves,
        imageUrl: 'https://cdn.pixabay.com/photo/2018/03/19/15/04/faucet-3240211_1280.jpg',
        highlights: ['Distribusi air bersih untuk berbagai sektor', 'Kualitas air terjamin', 'Pelayanan 24 jam', 'Sistem meteran digital'],
        pricing: [
            { label: 'Fasilitas Umum', detail: 'Rp600 / m³', basePrice: 600 },
            { label: 'Perumahan', detail: 'Rp800 / m³', basePrice: 800 },
            { label: 'Perusahaan', detail: 'Rp1.500 / m³', basePrice: 1500 },
        ],
        operatingHours: '24 Jam',
        contact: '0812-3456-7893',
        whatsapp: '6281234567893',
        location: 'Seluruh area Desa Bagja Waluya',
        terms: ['Pendaftaran dengan KTP', 'Deposit meter Rp200.000', 'Pembayaran bulanan'],
        calculationType: 'participants', // Menggunakan untuk volume m³
        unit: 'm³',
    },
    {
        title: 'Internet Desa',
        icon: Building2,
        imageUrl: 'https://cdn.pixabay.com/photo/2014/08/09/21/53/network-connection-414415_960_720.jpg',
        highlights: ['Internet murah untuk warga', 'Stabil dan terjangkau', 'Kecepatan hingga 20 Mbps', 'Support teknis lokal'],
        pricing: [{ label: 'Langganan Bulanan', detail: 'Rp125.000 / bulan', basePrice: 125000 }],
        operatingHours: '24 Jam',
        contact: '0812-3456-7894',
        whatsapp: '6281234567894',
        location: 'Seluruh area Desa Bagja Waluya',
        terms: ['Instalasi gratis', 'Kontrak minimal 6 bulan', 'Pembayaran di awal bulan'],
        calculationType: 'duration', // Untuk berapa bulan
        unit: 'bulan',
    },
];

const faqs: FAQ[] = [
    {
        question: 'Bagaimana cara melakukan booking?',
        answer: 'Anda bisa menghubungi kami melalui WhatsApp atau telepon. Tim kami akan membantu proses booking dan memberikan informasi detail.',
    },
    {
        question: 'Apakah ada sistem pembayaran online?',
        answer: 'Saat ini kami menerima pembayaran tunai dan transfer bank. Untuk kemudahan, Anda bisa transfer ke rekening BUMDes yang akan diberikan saat booking.',
    },
    {
        question: 'Bagaimana jika ingin membatalkan booking?',
        answer: 'Pembatalan dapat dilakukan maksimal 24 jam sebelum jadwal. DP yang sudah dibayarkan dapat dikembalikan 80% atau dialihkan ke jadwal lain.',
    },
    {
        question: 'Apakah tersedia paket khusus untuk event besar?',
        answer: 'Ya, kami menyediakan paket khusus untuk event besar dengan harga yang dapat dinegosiasikan. Silakan hubungi tim kami untuk diskusi lebih lanjut.',
    },
];

const UnitUsaha: React.FC = () => {
    const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<{ label: string; detail: string; basePrice: number } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [namaPenyewa, setNamaPenyewa] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [totalPrice, setTotalPrice] = useState<number>(0);

    // Hitung total harga otomatis
    useEffect(() => {
        if (selectedPackage && selectedUnit) {
            const qty = parseInt(quantity) || 1;
            if (selectedUnit.calculationType === 'duration' || selectedUnit.calculationType === 'participants') {
                setTotalPrice(selectedPackage.basePrice * qty);
            } else {
                setTotalPrice(selectedPackage.basePrice);
            }
        }
    }, [selectedPackage, quantity, selectedUnit]);

    const handlePackageSelect = (pkg: { label: string; detail: string; basePrice: number }) => {
        setSelectedPackage(pkg);
    };

    const handleSubmit = () => {
        const toastId = null;
        if (!selectedPackage || !selectedDate || !namaPenyewa) {
            toast.error('Mohon lengkapi semua data booking', { id: toastId });
            return;
        }

        let detailQuantity = '';
        if (selectedUnit?.calculationType === 'duration' || selectedUnit?.calculationType === 'participants') {
            detailQuantity = `\n${selectedUnit.calculationType === 'duration' ? 'Durasi' : 'Jumlah'}: ${quantity} ${selectedUnit.unit}`;
        }

        const detailHarga = `\nTotal Harga: Rp${totalPrice.toLocaleString('id-ID')}`;
        const pesan = `Halo, saya ingin booking:\n\nNama: ${namaPenyewa}\nUnit: ${selectedUnit?.title}\nPaket: ${selectedPackage.label}${detailQuantity}\nTanggal: ${selectedDate?.toLocaleDateString()}${detailHarga}`;

        const nomorAdmin = '6287737709694';
        const encodedPesan = encodeURIComponent(pesan);
        const whatsappURL = `https://wa.me/${nomorAdmin}?text=${encodedPesan}`;

        window.open(whatsappURL, '_blank');

        // Reset form
        setSelectedUnit(null);
        setSelectedPackage(null);
        setSelectedDate(null);
        setNamaPenyewa('');
        setQuantity('1');
        setTotalPrice(0);
    };

    const getQuantityLabel = (unit: BusinessUnit) => {
        switch (unit.calculationType) {
            case 'duration':
                return unit.title === 'Mini Soccer' ? 'Durasi (jam)' : `Durasi (${unit.unit})`;
            case 'participants':
                return unit.title === 'Air Weslik' ? 'Volume (m³)' : `Jumlah (${unit.unit})`;
            default:
                return '';
        }
    };

    return (
        <MainLayout title="Unit Usaha">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-center text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative mx-auto max-w-4xl px-6">
                    <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                        Unit Usaha <span className="text-blue-200">BUMDes</span>
                    </h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
                        Jelajahi berbagai layanan dan potensi usaha yang dikelola oleh BUMDes Bagja Waluya
                    </p>
                </div>
            </section>

            {/* Business Units Grid */}
            <section className="bg-gray-50 py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Layanan Kami</h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            Temukan berbagai unit usaha yang dapat mendukung kebutuhan dan aktivitas Anda
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {units.map((unit, idx) => {
                            const Icon = unit.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group transform overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                                >
                                    {/* Image Container with fixed aspect ratio */}
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={unit.imageUrl}
                                            alt={unit.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <div className="absolute top-4 left-4 rounded-full bg-white/90 p-3 backdrop-blur-sm">
                                            <Icon className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        <h3 className="mb-4 text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                            {unit.title}
                                        </h3>

                                        {/* Highlights */}
                                        <div className="mb-6">
                                            {unit.highlights.map((highlight, i) => (
                                                <div key={i} className="mb-2 flex items-start gap-3">
                                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                                                    <span className="text-sm leading-relaxed text-gray-600">{highlight}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pricing */}
                                        <div className="mb-8 space-y-3">
                                            {unit.pricing.map((price, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
                                                >
                                                    <span className="text-sm font-medium text-gray-500">{price.label}</span>
                                                    <span className="text-sm font-bold text-blue-700">{price.detail}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Quick Info */}
                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="h-4 w-4" />
                                                <span>{unit.operatingHours}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="h-4 w-4" />
                                                <span className="truncate">{unit.location}</span>
                                            </div>
                                        </div>

                                        {/* CTA Buttons */}
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setSelectedUnit(unit)}
                                                className="w-full transform rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                                            >
                                                Lihat detail & booking
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Pertanyaan Umum</h2>
                        <p className="text-gray-600">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="overflow-hidden rounded-2xl border border-gray-200">
                                <details className="group">
                                    <summary className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-gray-50">
                                        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                                        <div className="ml-4 flex-shrink-0">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 transition-transform group-open:rotate-45">
                                                <span className="text-sm font-bold text-blue-600">+</span>
                                            </div>
                                        </div>
                                    </summary>
                                    <div className="px-6 pb-6">
                                        <p className="leading-relaxed text-gray-600">{faq.answer}</p>
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal */}
            {selectedUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="relative h-64">
                            <img src={selectedUnit.imageUrl} alt={selectedUnit.title} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <button
                                onClick={() => {
                                    setSelectedUnit(null);
                                    setSelectedPackage(null);
                                    setQuantity('1');
                                    setTotalPrice(0);
                                }}
                                className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <div className="absolute bottom-6 left-6 text-white">
                                <div className="mb-2 flex items-center gap-3">
                                    <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                                        <selectedUnit.icon className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-3xl font-bold">{selectedUnit.title}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Highlights */}
                            <div className="mb-6">
                                <h3 className="mb-3 text-lg font-semibold text-gray-900">Fasilitas & Keunggulan</h3>
                                <div className="space-y-2">
                                    {selectedUnit.highlights.map((highlight, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                                            <span className="text-sm text-gray-600">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Clickable Pricing Packages */}
                            <div className="mb-6">
                                <h3 className="mb-3 text-lg font-semibold text-gray-900">Pilih Paket</h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {selectedUnit.pricing.map((pkg, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handlePackageSelect(pkg)}
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:border-blue-400 hover:shadow-md ${
                                                selectedPackage?.label === pkg.label
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div
                                                className={`font-semibold ${
                                                    selectedPackage?.label === pkg.label ? 'text-blue-700' : 'text-gray-800'
                                                }`}
                                            >
                                                {pkg.label}
                                            </div>
                                            <div className={`text-sm ${selectedPackage?.label === pkg.label ? 'text-blue-600' : 'text-gray-600'}`}>
                                                {pkg.detail}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Form */}
                            {selectedPackage && (
                                <div className="space-y-4 border-t pt-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Nama Penyewa *</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            value={namaPenyewa}
                                            onChange={(e) => setNamaPenyewa(e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>

                                    {(selectedUnit.calculationType === 'duration' || selectedUnit.calculationType === 'participants') && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">{getQuantityLabel(selectedUnit)} *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                placeholder={`Masukkan jumlah ${selectedUnit.unit}`}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Tanggal *</label>
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={(date) => setSelectedDate(date)}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Pilih tanggal booking"
                                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            minDate={new Date()}
                                        />
                                    </div>

                                    {/* Total Harga */}
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700">Total Harga:</span>
                                            <span className="text-xl font-bold text-blue-700">Rp{totalPrice.toLocaleString('id-ID')}</span>
                                        </div>
                                        {(selectedUnit.calculationType === 'duration' || selectedUnit.calculationType === 'participants') && (
                                            <div className="mt-1 text-sm text-gray-600">
                                                {selectedPackage.detail} × {quantity} {selectedUnit.unit}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
                                            onClick={handleSubmit}
                                        >
                                            Konfirmasi Booking
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-lg bg-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-400"
                                            onClick={() => {
                                                setSelectedUnit(null);
                                                setSelectedPackage(null);
                                                setQuantity('1');
                                                setTotalPrice(0);
                                            }}
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Terms & Contact Info */}
                            <div className="mt-6 space-y-4 border-t pt-6">
                                <div>
                                    <h4 className="mb-2 font-semibold text-gray-900">Syarat & Ketentuan:</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        {selectedUnit.terms.map((term, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-blue-500">•</span>
                                                {term}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <h4 className="mb-1 font-semibold text-gray-900">Jam Operasional:</h4>
                                        <p className="text-sm text-gray-600">{selectedUnit.operatingHours}</p>
                                    </div>
                                    <div>
                                        <h4 className="mb-1 font-semibold text-gray-900">Kontak:</h4>
                                        <p className="text-sm text-gray-600">{selectedUnit.contact}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default UnitUsaha;
