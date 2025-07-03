import MainLayout from '@/components/layout_compro/MainLayout';
import { Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';

const Kontak: React.FC = () => {
    return (
        <MainLayout title="Kontak BUMDes">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 py-20 text-center text-white">
                <div className="mx-auto max-w-3xl px-4">
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">Hubungi Kami</h1>
                    <p className="text-lg text-blue-100">
                        Silakan hubungi BUMDes Bagja Waluya untuk pertanyaan, kerja sama, atau informasi lebih lanjut.
                    </p>
                </div>
            </section>

            {/* Informasi Kontak */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-800">Informasi Kontak</h2>
                        <p className="text-gray-600">Kami siap membantu Anda pada hari kerja Senin–Jumat, pukul 08.00–16.00 WIB.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        <div className="rounded-xl border bg-gray-50 p-6 text-center shadow-sm">
                            <Phone className="mx-auto mb-3 h-6 w-6 text-blue-600" />
                            <p className="font-semibold text-gray-700">Telepon</p>
                            <p className="mt-1 text-sm text-gray-600">081220869444</p>
                        </div>

                        <div className="rounded-xl border bg-gray-50 p-6 text-center shadow-sm">
                            <Mail className="mx-auto mb-3 h-6 w-6 text-blue-600" />
                            <p className="font-semibold text-gray-700">Email</p>
                            <p className="mt-1 text-sm text-gray-600">info@bumdescihaurbeuti.id</p>
                        </div>

                        <div className="rounded-xl border bg-gray-50 p-6 text-center shadow-sm">
                            <MapPin className="mx-auto mb-3 h-6 w-6 text-blue-600" />
                            <p className="font-semibold text-gray-700">Alamat</p>
                            <p className="mt-1 text-sm text-gray-600">Jl. Raya Cihaurbeuti No.17, Sumberjaya, Kec. Cihaurbeuti, Kabupaten Ciamis, Jawa Barat 46262</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Google Maps Embed */}
            <section className="bg-gray-50 py-12">
                <div className="mx-auto max-w-6xl px-4">
                    <h3 className="mb-6 text-center text-2xl font-bold text-gray-800">Lokasi Kantor</h3>
                    <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-xl border shadow-md">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d928.4685766818175!2d108.19802944649054!3d-7.234674775596099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f4fd6290ab801%3A0x42f5c547ce7487f3!2sKantor%20Kepala%20Desa%20Sumberjaya!5e1!3m2!1sid!2sid!4v1751499345980!5m2!1sid!2sid"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default Kontak;
