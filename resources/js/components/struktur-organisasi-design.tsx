import MainLayout from '@/components/layout_compro/MainLayout';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Crown, Layers, LucideIcon, Mail, Phone, User } from 'lucide-react';
import React, { useState } from 'react';


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

const penasihat: OrgItem[] = [
    {
        title: 'Penasihat',
        name: 'H. Haris Iwan Gunawan',
        icon: Crown,
        color: 'text-yellow-500',
        photo: '/assets/images/kepala_bumdes.jpg',
        email: 'haris@bumdesbagjaa.id',
        phone: '+62 812-3456-7890',
        description: 'Memberikan arahan strategis dan kebijakan untuk pengembangan BUMDes',
    },
];

const pelaksana: OrgItem[] = [
    {
        title: 'Direktur',
        name: 'Asep Rohendi',
        icon: User,
        color: 'text-blue-600',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
        email: 'asep@bumdesbagjaa.id',
        phone: '+62 812-3456-7891',
        description: 'Memimpin operasional harian dan pengambilan keputusan strategis',
    },
    {
        title: 'Sekretaris I',
        name: 'Arip Abdul Latip',
        icon: Layers,
        color: 'text-green-600',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
        email: 'arip@bumdesbagjaa.id',
        phone: '+62 812-3456-7892',
        description: 'Mengelola administrasi dan dokumentasi organisasi',
    },
    {
        title: 'Sekretaris II',
        name: 'Putri Ayu Lestari',
        icon: Layers,
        color: 'text-green-500',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/woman-8547433_960_720.jpg',
        email: 'putri@bumdesbagjaa.id',
        phone: '+62 812-3456-7893',
        description: 'Mendukung kegiatan sekretariat dan koordinasi internal',
    },
    {
        title: 'Bendahara I',
        name: 'M. Iftah Farhan',
        icon: Briefcase,
        color: 'text-purple-600',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
        email: 'iftah@bumdesbagjaa.id',
        phone: '+62 812-3456-7894',
        description: 'Mengelola keuangan dan pelaporan finansial utama',
    },
    {
        title: 'Bendahara II',
        name: 'Elin Herlina',
        icon: Briefcase,
        color: 'text-pink-500',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/woman-8547433_960_720.jpg',
        email: 'elin@bumdesbagjaa.id',
        phone: '+62 812-3456-7895',
        description: 'Mendukung pengelolaan keuangan dan audit internal',
    },
];

const pengawas: OrgItem[] = [
    {
        title: 'Pengawas - Ketua',
        name: 'H. Wawan, S.Ag',
        icon: CheckCircle2,
        color: 'text-indigo-500',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
        email: 'wawan@bumdesbagjaa.id',
        phone: '+62 812-3456-7896',
        description: 'Memimpin fungsi pengawasan dan evaluasi kinerja',
    },
    {
        title: 'Pengawas - Sekretaris',
        name: 'Iwan',
        icon: CheckCircle2,
        color: 'text-indigo-400',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
        email: 'iwan@bumdesbagjaa.id',
        phone: '+62 812-3456-7897',
        description: 'Mendokumentasikan hasil pengawasan dan rekomendasi',
    },
    {
        title: 'Pengawas - Anggota',
        name: 'H. Uus Supriatna',
        icon: CheckCircle2,
        color: 'text-indigo-300',
        photo: 'https://cdn.pixabay.com/photo/2024/02/02/07/03/man-8547434_960_720.jpg',
        email: 'uus@bumdesbagjaa.id',
        phone: '+62 812-3456-7898',
        description: 'Melakukan monitoring dan evaluasi operasional',
    },
];

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
            {/* Background Gradient */}
            <div
                className={`absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            {/* Card Content */}
            <div className="relative p-8">
                {/* Profile Photo - Larger and More Prominent */}
                <div className="relative mx-auto mb-6 w-fit">
                    <div
                        className={`relative rounded-full bg-gradient-to-r ${
                            color.includes('yellow')
                                ? 'from-yellow-400 to-yellow-600'
                                : color.includes('blue')
                                  ? 'from-blue-400 to-blue-600'
                                  : color.includes('green')
                                    ? 'from-green-400 to-green-600'
                                    : color.includes('purple')
                                      ? 'from-purple-400 to-purple-600'
                                      : color.includes('pink')
                                        ? 'from-pink-400 to-pink-600'
                                        : 'from-indigo-400 to-indigo-600'
                        } p-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                    >
                        <img
                            src={photo}
                            alt={name}
                            className="h-32 w-32 rounded-full bg-gray-200 object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=f3f4f6&color=374151&format=svg`;
                            }}
                        />

                        {/* Subtle overlay effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                </div>

                {/* Name and Title with Enhanced Design */}
                <div className="mb-4 text-center">
                    <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-gray-700">{name}</h3>

                    {/* Title Badge with Icon */}
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-wide uppercase ${color} bg-gray-50 transition-all duration-300 group-hover:bg-white group-hover:shadow-md`}
                    >
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="opacity-90">{title}</span>
                    </div>
                </div>

                {/* Description */}
                {description && <p className="mt-4 text-sm leading-relaxed text-gray-600 transition-opacity duration-300">{description}</p>}

                {/* Contact Info - Appears on Hover */}
                <div
                    className={`mt-6 space-y-3 transition-all duration-300 ${isHovered ? 'max-h-40 opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
                >
                    {email && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{email}</span>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{phone}</span>
                        </div>
                    )}
                </div>

                {/* Decorative Element */}
                <div
                    className={`absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl ${
                        color.includes('yellow')
                            ? 'from-yellow-100'
                            : color.includes('blue')
                              ? 'from-blue-100'
                              : color.includes('green')
                                ? 'from-green-100'
                                : color.includes('purple')
                                  ? 'from-purple-100'
                                  : color.includes('pink')
                                    ? 'from-pink-100'
                                    : 'from-indigo-100'
                    } rounded-bl-full to-transparent opacity-20 transition-opacity duration-300 group-hover:opacity-40`}
                />
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
            {/* Section Header with Modern Design */}
            <div className="relative mb-12 text-center">
                <div className={`mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r ${gradientClasses[sectionIndex % 3]}`} />
                <h2 className="relative text-3xl font-bold text-gray-900">
                    {title}
                    <div className="absolute -bottom-2 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 transform bg-gradient-to-r from-blue-100 to-purple-100 opacity-20" />
                </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.map((item, index) => (
                    <OrgCard key={index} item={item} index={index} />
                ))}
            </div>
        </motion.div>
    );
};

const StrukturOrganisasi: React.FC = () => {
    return (
        <MainLayout title="Struktur Organisasi">
            {/* Enhanced Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-32 text-white">
                {/* Background Pattern */}
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
                    <h1 className="mb-6 text-5xl leading-tight font-bold md:text-6xl">
                        Struktur
                        <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"> Organisasi</span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-xl leading-relaxed text-blue-100">
                        Tim profesional yang berdedikasi untuk mengembangkan potensi ekonomi desa melalui tata kelola yang transparan dan akuntabel
                    </p>
                </motion.div>
            </section>

            {/* Modern Struktur Organisasi */}
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
