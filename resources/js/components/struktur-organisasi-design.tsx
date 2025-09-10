import MainLayout from '@/components/layout_compro/MainLayout';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Crown, Layers, LucideIcon, Mail, Phone, User } from 'lucide-react';
import React, { useState } from 'react';

interface Pengurus {
    id: number;
    nama_pengurus: string;
    jabatan: string;
    jenis_kelamin: string;
    pekerjaan: string;
    kategori: string;
    foto_pengurus: string;
}

interface OrgItem {
    title: string;
    name: string;
    icon: LucideIcon;
    color: string;
    photo: string;
    email?: string;
    phone?: string;
    description?: string;
}

const mapPengurusToOrgItem = (p: Pengurus): OrgItem => {
    let icon: LucideIcon = User;
    let color = 'text-blue-600';

    if (p.jabatan.toLowerCase().includes('penasihat')) {
        icon = Crown;
        color = 'text-yellow-500';
    } else if (p.jabatan.toLowerCase().includes('sekretaris')) {
        icon = Layers;
        color = 'text-green-600';
    } else if (p.jabatan.toLowerCase().includes('bendahara')) {
        icon = Briefcase;
        color = 'text-purple-600';
    } else if (p.jabatan.toLowerCase().includes('pengawas')) {
        icon = CheckCircle2;
        color = 'text-indigo-500';
    }

    return {
        title: p.jabatan,
        name: p.nama_pengurus,
        icon,
        color,
        photo: p.foto_pengurus ? `/storage/${p.foto_pengurus}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_pengurus)}&size=128`,
        description: p.pekerjaan,
    };
};

const OrgCard: React.FC<{ item: OrgItem; index: number }> = ({ item, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { title, name, icon: Icon, color, photo, email, phone, description } = item;

    return (
        <div
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                animationDelay: `${index * 100}ms`,
            }}
        >
            <div className="relative p-8">
                <div className="relative mx-auto mb-6 w-fit">
                    <div
                        className={`relative rounded-full bg-gradient-to-r ${color} p-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                    >
                        <img
                            src={photo}
                            alt={name}
                            className="h-32 w-32 rounded-full bg-gray-200 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </div>

                <div className="mb-4 text-center">
                    <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-gray-700">{name}</h3>
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-wide uppercase ${color} bg-gray-50 transition-all duration-300 group-hover:bg-white group-hover:shadow-md`}
                    >
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="opacity-90">{description}</span>
                    </div>
                </div>

                {title && <p className="mt-4 text-sm leading-relaxed text-gray-600 text-center">{title}</p>}

            </div>
        </div>
    );
};

const SectionGrid: React.FC<{ title: string; data: OrgItem[]; sectionIndex: number }> = ({ title, data, sectionIndex }) => {
    const gradientClasses = [
        'from-blue-600 via-purple-600 to-blue-700',
        'from-green-600 via-teal-600 to-green-700',
        'from-indigo-600 via-blue-600 to-indigo-700',
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
        >
            <div className="relative mb-12 text-center">
                <div className={`mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r ${gradientClasses[sectionIndex % 3]}`} />
                <h2 className="relative text-3xl font-bold text-gray-900">{title}</h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.map((item, index) => (
                    <OrgCard key={index} item={item} index={index} />
                ))}
            </div>
        </motion.div>
    );
};

const StrukturOrganisasi: React.FC = () => {
    const { pengurus } = usePage<{ pengurus: Pengurus[] }>().props;

    const penasihat = pengurus.filter((p) => p.kategori === 'Penasihat').map(mapPengurusToOrgItem);
    const pelaksana = pengurus.filter((p) => p.kategori === 'Pelaksana').map(mapPengurusToOrgItem);
    const pengawas = pengurus.filter((p) => p.kategori === 'Pengawas').map(mapPengurusToOrgItem);

    return (
        <MainLayout title="Struktur Organisasi">
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-32 text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative mx-auto max-w-4xl px-4 text-center"
                >
                    <h1 className="mb-6 text-5xl font-bold md:text-6xl">
                        Struktur
                        <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"> Organisasi</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl leading-relaxed text-blue-100">
                        Tim profesional yang berdedikasi untuk mengembangkan potensi ekonomi desa melalui tata kelola yang transparan dan akuntabel
                    </p>
                </motion.div>
            </section>

            <section className="bg-gradient-to-b from-gray-50 to-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionGrid title="Penasihat" data={penasihat} sectionIndex={0} />
                    <SectionGrid title="Pelaksana Operasional" data={pelaksana} sectionIndex={1} />
                    <SectionGrid title="Pengawas" data={pengawas} sectionIndex={2} />
                </div>
            </section>
        </MainLayout>
    );
};

export default StrukturOrganisasi;
