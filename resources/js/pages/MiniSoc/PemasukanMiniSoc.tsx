import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, Pencil, RefreshCw, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface PemasukanItem {
    id: number;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
    penyewa: string;
    durasi: number;
    tipe_penyewa: string;
    tarif_per_jam: number;
    total_bayar: number;
    keterangan: string;
}

interface TarifOption {
    tipe: string;
    tarif: number;
}

interface ConflictBooking {
    tenant_name: string;
    jam_mulai: string;
    jam_selesai: string;
}

interface Props {
    unit_id: number;
    user: {
        id_users: number;
        name: string;
        email: string;
        roles: string;
        image?: string;
    };
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    pemasukan: PemasukanItem[];
    tarifs: TarifOption[];
}

export default function PemasukanMiniSoc({ user, unit_id, pemasukan, pagination, tarifs }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: {
            info?: { message?: string; method?: string };
            conflict?: {
                message?: string;
                conflictBookings?: ConflictBooking[];
            };
        };
    };

    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictBookings, setConflictBookings] = useState<ConflictBooking[]>([]);
    const [conflictMessage, setConflictMessage] = useState<string>('');
    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        // Handle conflict flash message
        if (flash?.conflict?.message) {
            setConflictMessage(flash.conflict.message);
            setConflictBookings(flash.conflict.conflictBookings || []);
            setShowConflictModal(true);
            return;
        }

        // Handle regular flash messages
        if (!flash?.info?.message) return;

        const { message, method } = flash.info;

        setFlashMessage(message || '');
        setFlashMethod(method || '');

        switch (method) {
            case 'delete':
                setFlashColor('bg-red-600');
                break;
            case 'update':
                setFlashColor('bg-blue-600');
                break;
            case 'create':
            default:
                setFlashColor('bg-green-600');
                break;
        }

        const timeout = setTimeout(() => {
            setFlashMessage(null);
            setFlashMethod('');
        }, 3000);

        return () => clearTimeout(timeout);
    }, [flash]);

    const renderFlashIcon = () => {
        switch (flashMethod) {
            case 'create':
                return <CheckCircle className="h-5 w-5 text-white" />;
            case 'update':
                return <RefreshCw className="h-5 w-5 text-white" />;
            case 'delete':
                return <Trash2 className="h-5 w-5 text-white" />;
            default:
                return <CheckCircle className="h-5 w-5 text-white" />;
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<null | number>(null);
    const {
        data: formData,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        tanggal: '',
        jam_mulai: '',
        jam_selesai: '',
        penyewa: '',
        tipe: '',
        durasi: 1,
        tarif: 0,
        total: 0,
        keterangan: '',
    });

    // Function to calculate duration in hours between two times
    const calculateDuration = (startTime: string, endTime: string): number => {
        if (!startTime || !endTime) return 0;

        const start = new Date(`2000-01-01 ${startTime}`);
        let end = new Date(`2000-01-01 ${endTime}`);

        // Handle cross-midnight scenarios (e.g., 23:00 to 02:00)
        if (end <= start) {
            end = new Date(`2000-01-02 ${endTime}`);
        }

        const diffMs = end.getTime() - start.getTime();
        return diffMs / (1000 * 60 * 60); // Convert to hours
    };

    // Update duration when time changes
    useEffect(() => {
        if (formData.jam_mulai && formData.jam_selesai) {
            const duration = calculateDuration(formData.jam_mulai, formData.jam_selesai);
            setData('durasi', Math.round(duration * 10) / 10); // Round to 1 decimal place
        }
    }, [formData.jam_mulai, formData.jam_selesai]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const method = editing === null ? post : put;
        const url = editing === null ? `/unit/${unit_id}/pemasukan-minisoc` : `/unit/${unit_id}/pemasukan-minisoc/${editing}`;

        method(url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditing(null);
            },
            onError: (err) => {
                console.log('Validation Errors : ', err);
            },
        });
    };

    const handleEdit = (item: PemasukanItem) => {
        setData({
            tanggal: item.tanggal,
            jam_mulai: item.jam_mulai || '',
            jam_selesai: item.jam_selesai || '',
            penyewa: item.penyewa,
            tipe: item.tipe_penyewa,
            durasi: item.durasi,
            tarif: item.tarif_per_jam,
            total: item.total_bayar,
            keterangan: item.keterangan,
        });
        setEditing(item.id);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/unit/${unit_id}/pemasukan-minisoc/${id}`);
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            `/unit/${unit_id}/pemasukan-minisoc`,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const tipeOptions = tarifs || [];

    // Update tarif ketika tipe berubah
    useEffect(() => {
        const selected = tipeOptions.find((opt) => opt.tipe === formData.tipe);
        if (selected) {
            setData('tarif', selected.tarif);
        }
    }, [formData.tipe]);

    // Update total bayar ketika durasi atau tarif berubah
    useEffect(() => {
        const total = formData.durasi * formData.tarif;
        setData('total', total);
    }, [formData.durasi, formData.tarif]);

    // Generate time options (24-hour format)
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                // 30-minute intervals
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                options.push(timeString);
            }
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    return (
        <AppLayout>
            <Head title="Pemasukan Mini Soccer" />

            {/* Regular Flash Messages */}
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

            {/* Conflict Modal */}
            {showConflictModal && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                        <button onClick={() => setShowConflictModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Konflik Jadwal Booking</h3>
                                <p className="text-sm text-gray-500">Waktu yang dipilih sudah terboking</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="mb-3 text-sm text-gray-700">{conflictMessage}</p>

                            {conflictBookings.length > 0 && (
                                <div className="rounded-lg bg-red-50 p-3">
                                    <h4 className="mb-2 text-sm font-medium text-red-800">Booking yang bentrok:</h4>
                                    <div className="space-y-2">
                                        {conflictBookings.map((booking, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
                                                <span className="font-medium text-gray-900">{booking.tenant_name}</span>
                                                <span className="text-red-600">
                                                    {booking.jam_mulai} - {booking.jam_selesai}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                Silakan pilih waktu lain yang tersedia atau hubungi penyewa yang sudah booking untuk mengatur ulang jadwal.
                            </p>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowConflictModal(false)} className="px-4 py-2">
                                    Tutup
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowConflictModal(false);
                                        setShowModal(true);
                                    }}
                                    className="bg-blue-700 px-4 py-2 text-white hover:bg-blue-600"
                                >
                                    Pilih Waktu Lain
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl bg-white px-2 py-4">
                <div className="mt-3 mb-4 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Pemasukan - Mini Soccer</h2>
                    <Button
                        onClick={() => {
                            const memberTarif = tipeOptions.find((opt) => opt.tipe === 'Member') || tipeOptions[0];
                            const today = new Date().toISOString().split('T')[0];
                            const currentTime = new Date().toTimeString().slice(0, 5);

                            if (memberTarif) {
                                setData({
                                    tanggal: today,
                                    jam_mulai: currentTime,
                                    jam_selesai: '',
                                    penyewa: '',
                                    tipe: memberTarif.tipe,
                                    durasi: 1,
                                    tarif: memberTarif.tarif,
                                    total: memberTarif.tarif * 1,
                                    keterangan: '',
                                });
                            } else {
                                setData({
                                    tanggal: today,
                                    jam_mulai: currentTime,
                                    jam_selesai: '',
                                    penyewa: '',
                                    tipe: '',
                                    durasi: 1,
                                    tarif: 0,
                                    total: 0,
                                    keterangan: '',
                                });
                            }

                            setShowModal(true);
                            setEditing(null);
                        }}
                        className="bg-blue-700 text-white hover:bg-blue-500"
                    >
                        Tambah Booking +
                    </Button>
                </div>

                {showModal && (
                    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[4px]">
                        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 text-black shadow-lg">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditing(null);
                                }}
                                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                {editing ? 'Edit Booking' : 'Tambah Booking'} Mini Soccer
                            </h2>

                            <form onSubmit={handleSubmit}>
                                {/* Grid Layout 3 kolom */}
                                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Kolom 1: Date & Time */}
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                            <h3 className="mb-3 flex items-center gap-1 text-sm font-semibold text-blue-800">
                                                <Clock className="h-4 w-4" />
                                                Waktu Booking
                                            </h3>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                                        value={formData.tanggal}
                                                        onChange={(e) => setData('tanggal', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Jam Mulai</label>
                                                    <select
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                                        value={formData.jam_mulai}
                                                        onChange={(e) => setData('jam_mulai', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Pilih jam mulai</option>
                                                        {timeOptions.map((time) => (
                                                            <option key={time} value={time}>
                                                                {time}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Jam Selesai</label>
                                                    <select
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                                        value={formData.jam_selesai}
                                                        onChange={(e) => setData('jam_selesai', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Pilih jam selesai</option>
                                                        {timeOptions.map((time) => (
                                                            <option key={time} value={time}>
                                                                {time}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kolom 2: Customer Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Penyewa</label>
                                            <input
                                                type="text"
                                                placeholder="Masukkan nama penyewa"
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                value={formData.penyewa}
                                                onChange={(e) => setData('penyewa', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Penyewa</label>
                                            <select
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                value={formData.tipe}
                                                onChange={(e) => setData('tipe', e.target.value)}
                                                required
                                            >
                                                <option value="">Pilih Tipe Penyewa</option>
                                                {tipeOptions.map((opt) => (
                                                    <option key={opt.tipe} value={opt.tipe}>
                                                        {opt.tipe} - Rp. {opt.tarif.toLocaleString('id-ID')}/jam
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Keterangan</label>
                                            <textarea
                                                placeholder="Keterangan (opsional)"
                                                className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 transition-colors outline-none focus:border-blue-500 focus:bg-white"
                                                rows={3}
                                                value={formData.keterangan}
                                                onChange={(e) => setData('keterangan', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Kolom 3: Pricing Info */}
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <h3 className="mb-3 text-sm font-semibold text-green-800">Rincian Biaya</h3>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Durasi:</span>
                                                    <span className="font-medium">{formData.durasi} jam</span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tarif/jam:</span>
                                                    <span className="font-medium">Rp. {formData.tarif.toLocaleString('id-ID')}</span>
                                                </div>

                                                <hr className="my-2" />

                                                <div className="flex justify-between text-base font-bold text-green-800">
                                                    <span>Total:</span>
                                                    <span>Rp. {formData.total.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Duration Display */}
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                            <h3 className="mb-2 text-sm font-semibold text-blue-800">Durasi Booking</h3>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-900">{formData.durasi}</div>
                                                <div className="text-sm text-blue-700">jam</div>
                                            </div>
                                            {formData.jam_mulai && formData.jam_selesai && (
                                                <div className="mt-2 text-center text-xs text-blue-600">
                                                    {formData.jam_mulai} - {formData.jam_selesai}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 border-t pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6 py-2.5"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditing(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-700 px-6 py-2.5 text-white hover:bg-blue-600 disabled:opacity-70"
                                    >
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Menyimpan...
                                            </div>
                                        ) : editing ? (
                                            'Update Booking'
                                        ) : (
                                            'Konfirmasi Booking'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="mx-6 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full bg-white text-sm text-black">
                        <thead className="bg-gray-100 font-semibold text-black">
                            <tr>
                                <th className="px-4 py-3 text-center">No</th>
                                <th className="px-4 py-3 text-center">Tanggal</th>
                                <th className="px-4 py-3 text-center">Waktu</th>
                                <th className="px-4 py-3 text-center">Penyewa</th>
                                <th className="px-4 py-3 text-center">Durasi</th>
                                <th className="px-4 py-3 text-center">Tipe</th>
                                <th className="px-4 py-3 text-center">Tarif/jam</th>
                                <th className="px-4 py-3 text-center">Total</th>
                                <th className="px-4 py-3 text-center">Keterangan</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pemasukan.length > 0 ? (
                                pemasukan.map((item, i) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 text-center">{(pagination.current_page - 1) * pagination.per_page + i + 1}</td>
                                        <td className="px-4 py-3 text-center">{item.tanggal}</td>
                                        <td className="px-4 py-3 text-center">
                                            {item.jam_mulai && item.jam_selesai ? (
                                                <div className="text-xs">
                                                    <div className="font-medium">
                                                        {item.jam_mulai} - {item.jam_selesai}
                                                    </div>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.penyewa}</td>
                                        <td className="px-4 py-3 text-center">{item.durasi} jam</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                {item.tipe_penyewa}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">Rp. {item.tarif_per_jam.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center font-medium text-green-600">
                                            Rp. {item.total_bayar.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.keterangan || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(item)}
                                                    className="rounded bg-yellow-500 px-2 py-1 text-white transition-colors hover:bg-yellow-600"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded bg-red-600 px-2 py-1 text-white transition-colors hover:bg-red-700"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                        Belum ada data booking
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t px-4 py-3">
                            <div className="text-sm text-gray-700">
                                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} -{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
                            </div>

                            <div className="flex items-center gap-2 text-black">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    let page;
                                    if (pagination.last_page <= 5) {
                                        page = i + 1;
                                    } else if (pagination.current_page <= 3) {
                                        page = i + 1;
                                    } else if (pagination.current_page >= pagination.last_page - 2) {
                                        page = pagination.last_page - 4 + i;
                                    } else {
                                        page = pagination.current_page - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant={page === pagination.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={page === pagination.current_page ? 'bg-blue-700 text-white' : ''}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
