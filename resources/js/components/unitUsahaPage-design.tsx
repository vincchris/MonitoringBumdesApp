import MainLayout from '@/components/layout_compro/MainLayout';
import { Building2, Clock, Globe, LucideIcon, MapPin, ShoppingBag, Volleyball, Waves, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';

// ============ TYPES & INTERFACES ============
interface BusinessUnit {
    title: string;
    icon: LucideIcon;
    imageUrl: string;
    highlights: string[];
    pricing: Tarif[];
    operatingHours: string;
    contact: string;
    whatsapp: string;
    location: string;
    terms: string[];
    note?: string;
    calculationType: 'duration' | 'participants' | 'none';
    unit: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface Tarif {
    label: string;
    detail: string;
    basePrice: number;
}

interface Booking {
    id: number;
    tenant: string;
    tarif_id: number;
    unit_id: number;
    nominal: number;
    total: number;
    description: string;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    tarifs: Record<string, Tarif[]>;
    bookings: Booking[];
}

interface BookingWindow {
    start: Date;
    end: Date;
}

type FilterMode = 'day' | 'month';

// ============ CONSTANTS ============
const UNIT_ID_MAP: Record<string, number> = {
    'Mini Soccer': 1,
    'Bumi Perkemahan (Buper)': 2,
};

const OPERATING_HOURS = {
    'Mini Soccer': { start: 8, end: 22 },
    default: { start: 0, end: 23.5 },
};

const FAQS: FAQ[] = [
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
        answer: 'Pembatalan dapat dilakukan maksimal 24 jam sebelumnya. DP yang sudah dibayarkan dapat dikembalikan 80% atau dialihkan ke jadwal lain.',
    },
    {
        question: 'Apakah tersedia paket khusus untuk event besar?',
        answer: 'Ya, kami menyediakan paket khusus untuk event besar dengan harga yang dapat dinegosiasikan. Silakan hubungi tim kami untuk diskusi lebih lanjut.',
    },
];

// ============ UTILITY FUNCTIONS ============
const parseSQLDate = (dateString?: string | null): Date | null => {
    if (!dateString || typeof dateString !== 'string') return null;
    const isoString = dateString.replace(' ', 'T');
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
};

const roundTo30Minutes = (date: Date): Date => {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    const snappedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;

    if (snappedMinutes === 0 && minutes >= 45) {
        rounded.setHours(rounded.getHours() + 1);
    }

    rounded.setMinutes(snappedMinutes, 0, 0);
    return rounded;
};

const isToday = (date: Date): boolean => {
    const now = new Date();
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const isThisMonth = (date: Date): boolean => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const getUnitIdByTitle = (title: string): number | null => {
    return UNIT_ID_MAP[title] || null;
};

const getBookingWindow = (booking: Booking): BookingWindow | null => {
    const rawDate = booking.updated_at ?? booking.created_at;
    const startDate = parseSQLDate(rawDate);

    if (!startDate) return null;

    const start = roundTo30Minutes(startDate);
    const durationHours = Math.max(1, Number(booking.nominal) || 1);
    const end = new Date(start);
    end.setHours(start.getHours() + durationHours);

    return { start, end };
};

const getBlockedTimesForDate = (date: Date, unitId: number | null, bookings: Booking[]): Date[] => {
    if (!unitId) return [];

    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDate = date.getDate();
    const blocked: Date[] = [];

    const relevantBookings = bookings.filter((booking) => booking.unit_id === unitId);

    relevantBookings.forEach((booking) => {
        const window = getBookingWindow(booking);
        if (!window) return;

        const isSameDate =
            window.start.getFullYear() === targetYear && window.start.getMonth() === targetMonth && window.start.getDate() === targetDate;

        if (!isSameDate) return;

        const cursor = new Date(window.start);
        cursor.setSeconds(0, 0);
        cursor.setMinutes(cursor.getMinutes() - (cursor.getMinutes() % 30));

        while (cursor < window.end) {
            blocked.push(new Date(cursor));
            cursor.setMinutes(cursor.getMinutes() + 30);
        }
    });

    return blocked;
};

const isTimeFree = (time: Date, unitId: number | null, bookings: Booking[]): boolean => {
    const blockedTimes = getBlockedTimesForDate(time, unitId, bookings);
    return !blockedTimes.some((blocked) => blocked.getHours() === time.getHours() && blocked.getMinutes() === time.getMinutes());
};

const createBusinessUnits = (tarifs: Record<string, Tarif[]>): BusinessUnit[] => [
    {
        title: 'Mini Soccer',
        icon: Volleyball,
        imageUrl: 'assets/images/lapang_minisoc.jpg',
        highlights: ['Fasilitas: Lapangan rumput sintetis', 'Bonus: Air mineral gelas 1 dus', 'Parkir luas tersedia'],
        pricing: tarifs['1'] || [],
        operatingHours: '08:00 - 22:00 WIB',
        contact: '0813-2403-0282',
        whatsapp: '081324030282',
        location: 'Jl.Raya Cihaurbeuti No. 440',
        terms: ['Booking minimal 2 jam sebelumnya', 'DP 50% untuk konfirmasi booking', 'Pembayaran cash/transfer'],
        calculationType: 'duration',
        unit: 'jam',
    },
    {
        title: 'Bumi Perkemahan (Buper)',
        icon: Globe,
        imageUrl: 'assets/images/lapang_buper.jpg',
        highlights: ['Lahan luas dan rindang', 'Cocok untuk event besar seperti perkemahan'],
        pricing: tarifs['2'] || [],
        operatingHours: '24 Jam (dengan koordinasi)',
        contact: '0813-2403-0282',
        whatsapp: '081324030282',
        location: 'Area Perkemahan Desa, Bagja Waluya',
        terms: ['Booking minimal 1 minggu sebelumnya', 'DP 30% untuk konfirmasi', 'Termasuk fasilitas dasar'],
        calculationType: 'none',
        unit: 'kegiatan',
    },
    {
        title: 'Kios',
        icon: ShoppingBag,
        imageUrl: 'assets/images/Kios2.jpg',
        highlights: ['Lokasi strategis', 'Sewa tahunan', 'Akses mudah dari jalan utama', 'Listrik dan air tersedia'],
        pricing: tarifs['3'] || [],
        operatingHours: 'Sesuai kesepakatan',
        contact: '0812-3456-7892',
        whatsapp: '6281234567892',
        location: 'Berbagai lokasi strategis di Desa',
        terms: ['Kontrak minimal 1 tahun', 'Pembayaran di muka', 'Deposit keamanan Rp500.000'],
        calculationType: 'none',
        unit: 'tahun',
    },
    {
        title: 'Air Weslik',
        icon: Waves,
        imageUrl: 'https://cdn.pixabay.com/photo/2018/03/19/15/04/faucet-3240211_1280.jpg',
        highlights: ['Distribusi air bersih untuk berbagai sektor', 'Kualitas air terjamin', 'Pelayanan 24 jam', 'Sistem meteran digital'],
        pricing: tarifs['4'] || [],
        operatingHours: '24 Jam',
        contact: '0812-3456-7893',
        whatsapp: '6281234567893',
        location: 'Seluruh area Desa Bagja Waluya',
        terms: ['Pendaftaran dengan KTP', 'Deposit meter Rp200.000', 'Pembayaran bulanan'],
        calculationType: 'participants',
        unit: 'm³',
    },
    {
        title: 'Internet Desa',
        icon: Building2,
        imageUrl: 'https://cdn.pixabay.com/photo/2014/08/09/21/53/network-connection-414415_960_720.jpg',
        highlights: ['Internet murah untuk warga', 'Stabil dan terjangkau', 'Kecepatan hingga 20 Mbps', 'Support teknis lokal'],
        pricing: tarifs['5'] || [],
        operatingHours: '24 Jam',
        contact: '0812-3456-7894',
        whatsapp: '6281234567894',
        location: 'Seluruh area Desa Bagja Waluya',
        terms: ['Instalasi gratis', 'Kontrak minimal 6 bulan', 'Pembayaran di awal bulan'],
        calculationType: 'duration',
        unit: 'bulan',
    },
];

// ============ COMPONENT FUNCTIONS ============
const getQuantityLabel = (unit: BusinessUnit): string => {
    switch (unit.calculationType) {
        case 'duration':
            return unit.title === 'Mini Soccer' ? 'Durasi (jam)' : `Durasi (${unit.unit})`;
        case 'participants':
            return unit.title === 'Air Weslik' ? 'Volume (m³)' : `Jumlah (${unit.unit})`;
        default:
            return '';
    }
};

const getOperatingHours = (unitTitle: string, selectedDate: Date | null) => {
    const date = selectedDate ?? new Date();
    const minTime = new Date(date);
    const maxTime = new Date(date);

    const hours = OPERATING_HOURS[unitTitle as keyof typeof OPERATING_HOURS] || OPERATING_HOURS.default;

    minTime.setHours(hours.start, 0, 0, 0);
    maxTime.setHours(Math.floor(hours.end), (hours.end % 1) * 60, 0, 0);

    return { minTime, maxTime };
};

const getFilteredBookings = (bookings: Booking[], selectedUnit: BusinessUnit | null, filterMode: FilterMode): Booking[] => {
    if (!selectedUnit) return [];

    const unitId = getUnitIdByTitle(selectedUnit.title);
    if (!unitId) return [];

    return bookings
        .filter((booking) => {
            if (booking.unit_id !== unitId) return false;

            const bookingDate = parseSQLDate(booking.updated_at ?? booking.created_at);
            if (!bookingDate) return false;

            return filterMode === 'day' ? isToday(bookingDate) : isThisMonth(bookingDate);
        })
        .sort((a, b) => {
            const dateA = parseSQLDate(a.updated_at ?? a.created_at)?.getTime() ?? 0;
            const dateB = parseSQLDate(b.updated_at ?? b.created_at)?.getTime() ?? 0;
            return dateB - dateA; // Sort by newest first
        });
};

// ============ COMPONENTS ============
interface BookingScheduleProps {
    bookings: Booking[];
    selectedUnit: BusinessUnit | null;
}

const BookingSchedule: React.FC<BookingScheduleProps> = ({ bookings, selectedUnit }) => {
    const [filterMode, setFilterMode] = useState<FilterMode>('day');

    if (!selectedUnit || !['Mini Soccer', 'Bumi Perkemahan (Buper)'].includes(selectedUnit.title)) {
        return null;
    }

    const filteredBookings = getFilteredBookings(bookings, selectedUnit, filterMode);

    return (
        <div className="mb-6">
            <h3 className="text-md mb-2 font-semibold text-gray-900">Jadwal Terisi</h3>

            {/* Filter Tabs */}
            <div className="mb-3 flex space-x-2">
                <button
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                        filterMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilterMode('day')}
                >
                    Hari Ini
                </button>
                <button
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                        filterMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilterMode('month')}
                >
                    Bulan Ini
                </button>
            </div>

            <p className="mb-2 text-sm text-gray-600">
                {filterMode === 'day' ? 'Menampilkan jadwal booking hanya untuk hari ini.' : 'Menampilkan jadwal booking untuk bulan ini.'}
            </p>

            {/* Booking List */}
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                        const window = getBookingWindow(booking);
                        if (!window) return null;

                        const formattedDate = new Intl.DateTimeFormat('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        }).format(window.start);

                        const startTime = window.start.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        });
                        const endTime = window.end.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        });

                        return (
                            <div key={booking.id} className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm">
                                <span className="font-medium">{booking.tenant}</span>
                                <span className="text-gray-600">
                                    {formattedDate} pukul {startTime} - {endTime}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-gray-500">{filterMode === 'day' ? 'Tidak ada booking hari ini.' : 'Tidak ada booking bulan ini.'}</p>
                )}
            </div>
        </div>
    );
};

// ============ MAIN COMPONENT ============
const UnitUsaha: React.FC<Props> = ({ tarifs, bookings }) => {
    // State
    const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<Tarif | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [namaPenyewa, setNamaPenyewa] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const units = createBusinessUnits(tarifs);

    // Effects
    useEffect(() => {
        if (selectedPackage && selectedUnit) {
            const qty = parseInt(quantity) || 1;
            if (selectedUnit.calculationType === 'duration' || selectedUnit.calculationType === 'participants') {
                setTotalPrice(selectedPackage.basePrice * qty);
            } else {
                setTotalPrice(selectedPackage.basePrice);
            }
        } else {
            setTotalPrice(0);
        }
    }, [selectedPackage, quantity, selectedUnit]);

    // Event Handlers
    const handlePackageSelect = (pkg: Tarif) => {
        setSelectedPackage(pkg);
    };

    const resetForm = () => {
        setSelectedUnit(null);
        setSelectedPackage(null);
        setSelectedDate(null);
        setNamaPenyewa('');
        setQuantity('1');
        setTotalPrice(0);
    };

    const handleSubmit = () => {
        if (!selectedUnit || !selectedPackage || !selectedDate || !namaPenyewa) {
            toast.error('Mohon lengkapi semua data booking');
            return;
        }

        let detailQuantity = '';
        if (selectedUnit.calculationType === 'duration' || selectedUnit.calculationType === 'participants') {
            detailQuantity = `\n${selectedUnit.calculationType === 'duration' ? 'Durasi' : 'Jumlah'}: ${quantity} ${selectedUnit.unit}`;
        }

        const detailHarga = `\nTotal Harga: Rp${totalPrice.toLocaleString('id-ID')}`;

        const formattedDate = selectedDate.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        const message = `Halo, saya ingin booking:\n\nNama: ${namaPenyewa}\nUnit: ${selectedUnit.title}\nPaket: ${selectedPackage.label}${detailQuantity}\nTanggal: ${formattedDate}${detailHarga}`;

        const adminNumber = '6287737709694';
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${adminNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');
        resetForm();
    };

    // Computed values
    const unitIdForPicker = selectedUnit ? getUnitIdByTitle(selectedUnit.title) : null;
    const { minTime, maxTime } = getOperatingHours(selectedUnit?.title || '', selectedDate);

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
                                    {/* Image */}
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
                                            {unit.pricing.length === 0 && <div className="text-sm text-gray-500">Tarif belum tersedia.</div>}
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

                                        {/* CTA */}
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

            {/* FAQ */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Pertanyaan Umum</h2>
                        <p className="text-gray-600">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, idx) => (
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

            {/* MODAL */}
            {selectedUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="relative h-64">
                            <img src={selectedUnit.imageUrl} alt={selectedUnit.title} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <button
                                onClick={resetForm}
                                className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
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

                            {/* Paket */}
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
                                                className={`font-semibold ${selectedPackage?.label === pkg.label ? 'text-blue-700' : 'text-gray-800'}`}
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

                            {/* Jadwal Booking */}
                            <BookingSchedule bookings={bookings} selectedUnit={selectedUnit} />

                            {/* Form Booking */}
                            {selectedPackage && (
                                <div className="space-y-6 border-t pt-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="col-span-1 text-black sm:col-span-2">
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
                                            <div className="col-span-1">
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    {getQuantityLabel(selectedUnit)} *
                                                </label>
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

                                        <div className="col-span-1 text-black">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Tanggal & Waktu *</label>
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={(date) => setSelectedDate(date)}
                                                showTimeSelect
                                                dateFormat="dd/MM/yyyy HH:mm"
                                                timeFormat="HH:mm"
                                                timeIntervals={30}
                                                placeholderText="Pilih tanggal dan waktu booking"
                                                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                minDate={new Date()}
                                                minTime={minTime}
                                                maxTime={maxTime}
                                                popperPlacement="bottom-start"
                                                filterTime={(time) => isTimeFree(time, unitIdForPicker, bookings)}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <span className="font-medium text-gray-700">Total Harga:</span>
                                            <span className="mt-1 text-xl font-bold text-blue-700 sm:mt-0">
                                                Rp{totalPrice.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        {(selectedUnit.calculationType === 'duration' || selectedUnit.calculationType === 'participants') && (
                                            <div className="mt-1 text-sm text-gray-600">
                                                {selectedPackage.detail} × {quantity} {selectedUnit.unit}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                        <button
                                            type="button"
                                            className="w-full flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none sm:w-auto"
                                            onClick={handleSubmit}
                                        >
                                            Konfirmasi Booking
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full rounded-lg bg-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-400 sm:w-auto"
                                            onClick={resetForm}
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Terms & Contact */}
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
