import { FooterInfo } from '@/components/footer-dashboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, Building2, CheckCircle, FileText, PieChart, Users, XCircle } from 'lucide-react';
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard Admin', href: '/dashboard-admin' }];

interface LegalitasSummary {
    status: 'complete' | 'incomplete';
    completion_percentage: number;
    missing_documents?: string[];
    last_updated?: string;
    message?: string;
    data?: any;
    total_documents?: number;
}

interface ProfileSummary {
    status: 'complete' | 'incomplete';
    completion_percentage: number;
    missing_fields?: string[];
    last_updated?: string;
    message?: string;
    data?: any;
}

interface ProfileDesaSummary {
    status: 'complete' | 'incomplete';
    completion_percentage: number;
    missing_fields?: string[];
    last_updated?: string;
    message?: string;
    data?: any;
}

interface PengurusSummary {
    total_pengurus: number;
    jabatan_terisi: number;
    jabatan_kosong: string[];
    existing_jabatan: string[];
    completion_percentage: number;
    recent_changes: Array<{
        nama: string;
        jabatan: string;
        updated_at: string;
    }>;
}

interface RecentActivity {
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    icon: string;
}

interface DataCompleteness {
    overall_completion: number;
    status: 'success' | 'warning' | 'danger';
    components: {
        legalitas: number;
        profile: number;
        profile_desa: number;
        pengurus: number;
    };
}

interface DashboardData {
    legalitas_summary: LegalitasSummary;
    profile_summary: ProfileSummary;
    profile_desa_summary: ProfileDesaSummary;
    pengurus_summary: PengurusSummary;
    recent_activities: RecentActivity[];
    data_completeness: DataCompleteness;
    monthly_unit_growth: Array<{
        name: string;
        new_units: number;
        total_units: number;
        bulan: string;
    }>;
    legalitas_chart: {
        complete: number;
        incomplete: number;
    };
    last_updated: string;
}

interface Props {
    data: DashboardData;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function DashboardAdmin({ data }: Props) {
    // Safe data access with defaults
    const safeData = {
        legalitas_summary: data?.legalitas_summary || {
            status: 'incomplete' as const,
            completion_percentage: 0,
            missing_documents: [],
            total_documents: 0,
        },
        profile_summary: data?.profile_summary || {
            status: 'incomplete' as const,
            completion_percentage: 0,
            missing_fields: [],
            data: null,
        },
        profile_desa_summary: data?.profile_desa_summary || {
            status: 'incomplete' as const,
            completion_percentage: 0,
            missing_fields: [],
            data: null,
        },
        pengurus_summary: data?.pengurus_summary || {
            total_pengurus: 0,
            jabatan_terisi: 0,
            jabatan_kosong: [],
            existing_jabatan: [],
            completion_percentage: 0,
            recent_changes: [],
        },
        recent_activities: data?.recent_activities || [],
        data_completeness: data?.data_completeness || {
            overall_completion: 0,
            status: 'danger' as const,
            components: {
                legalitas: 0,
                profile: 0,
                profile_desa: 0,
                pengurus: 0,
            },
        },
        monthly_unit_growth: data?.monthly_unit_growth || [],
        legalitas_chart: data?.legalitas_chart || {
            complete: 0,
            incomplete: 100,
        },
        last_updated: data?.last_updated || 'Tidak tersedia',
    };

    const getStatusIcon = (status: 'complete' | 'incomplete' | 'success' | 'warning' | 'danger') => {
        switch (status) {
            case 'complete':
            case 'success':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'warning':
                return <AlertCircle className="text-yellow-600" size={20} />;
            case 'incomplete':
            case 'danger':
            default:
                return <XCircle className="text-red-600" size={20} />;
        }
    };

    const getStatusColor = (status: 'complete' | 'incomplete' | 'success' | 'warning' | 'danger') => {
        switch (status) {
            case 'complete':
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'incomplete':
            case 'danger':
            default:
                return 'bg-red-50 border-red-200';
        }
    };

    const pieData = [
        { name: 'Lengkap', value: safeData.legalitas_chart.complete, color: '#10b981' },
        { name: 'Belum Lengkap', value: safeData.legalitas_chart.incomplete, color: '#ef4444' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin - BUMDes" />

            <div className="space-y-6 p-6 text-black">
                {/* Header Info */}
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-2xl font-bold">Dashboard BUMDes</h1>
                            <p className="text-blue-100">{safeData.profile_summary.data?.nama_bumdes || 'Sistem Manajemen BUMDes'}</p>
                        </div>
                        <div className="text-right">
                            <Building2 size={48} className="mb-2 text-blue-200" />
                            <p className="text-sm text-blue-200">Update: {safeData.last_updated}</p>
                        </div>
                    </div>
                </div>

                {/* Status Kelengkapan Data Keseluruhan */}
                <div className={`rounded-xl border p-6 ${getStatusColor(safeData.data_completeness.status)}`}>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getStatusIcon(safeData.data_completeness.status)}
                            <h2 className="text-lg font-semibold">Kelengkapan Data Organisasi</h2>
                        </div>
                        <span className="text-2xl font-bold">{formatPercentage(safeData.data_completeness.overall_completion)}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Legalitas</p>
                            <p className="text-lg font-semibold">{formatPercentage(safeData.data_completeness.components.legalitas)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Profil BUMDes</p>
                            <p className="text-lg font-semibold">{formatPercentage(safeData.data_completeness.components.profile)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Profil Desa</p>
                            <p className="text-lg font-semibold">{formatPercentage(safeData.data_completeness.components.profile_desa)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Pengurus</p>
                            <p className="text-lg font-semibold">{formatPercentage(safeData.data_completeness.components.pengurus)}</p>
                        </div>
                    </div>
                </div>

                {/* Ringkasan Utama */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* Legalitas */}
                    <div className={`rounded-xl border p-4 ${getStatusColor(safeData.legalitas_summary.status)}`}>
                        <div className="mb-2 flex items-center justify-between">
                            <FileText className="text-blue-600" size={24} />
                            {getStatusIcon(safeData.legalitas_summary.status)}
                        </div>
                        <p className="text-sm text-blue-600">Status Legalitas</p>
                        <p className="mb-1 text-xl font-bold">{formatPercentage(safeData.legalitas_summary.completion_percentage)}</p>
                        <p className="text-xs text-gray-500">
                            {safeData.legalitas_summary.total_documents
                                ? `${safeData.legalitas_summary.total_documents} dokumen total`
                                : 'Belum ada dokumen'}
                        </p>
                        {safeData.legalitas_summary.last_updated && (
                            <p className="mt-1 text-xs text-gray-400">Update: {safeData.legalitas_summary.last_updated}</p>
                        )}
                    </div>

                    {/* Profil BUMDes */}
                    <div className={`rounded-xl border p-4 ${getStatusColor(safeData.profile_summary.status)}`}>
                        <div className="mb-2 flex items-center justify-between">
                            <Building2 className="text-green-600" size={24} />
                            {getStatusIcon(safeData.profile_summary.status)}
                        </div>
                        <p className="text-sm text-green-600">Profil BUMDes</p>
                        <p className="mb-1 text-xl font-bold">{formatPercentage(safeData.profile_summary.completion_percentage)}</p>
                        <p className="text-xs text-gray-500">
                            {safeData.profile_summary.missing_fields && safeData.profile_summary.missing_fields.length > 0
                                ? `${safeData.profile_summary.missing_fields.length} field belum diisi`
                                : 'Data profil lengkap'}
                        </p>
                        {safeData.profile_summary.last_updated && (
                            <p className="mt-1 text-xs text-gray-400">Update: {safeData.profile_summary.last_updated}</p>
                        )}
                    </div>

                    {/* Profil Desa */}
                    <div className={`rounded-xl border p-4 ${getStatusColor(safeData.profile_desa_summary.status)}`}>
                        <div className="mb-2 flex items-center justify-between">
                            <Building2 className="text-orange-600" size={24} />
                            {getStatusIcon(safeData.profile_desa_summary.status)}
                        </div>
                        <p className="text-sm text-orange-600">Profil Desa</p>
                        <p className="mb-1 text-xl font-bold">{formatPercentage(safeData.profile_desa_summary.completion_percentage)}</p>
                        <p className="text-xs text-gray-500">
                            {safeData.profile_desa_summary.missing_fields && safeData.profile_desa_summary.missing_fields.length > 0
                                ? `${safeData.profile_desa_summary.missing_fields.length} field belum diisi`
                                : 'Data profil lengkap'}
                        </p>
                        {safeData.profile_desa_summary.last_updated && (
                            <p className="mt-1 text-xs text-gray-400">Update: {safeData.profile_desa_summary.last_updated}</p>
                        )}
                    </div>

                    {/* Pengurus */}
                    <div
                        className={`rounded-xl border p-4 ${getStatusColor(safeData.pengurus_summary.completion_percentage >= 80 ? 'success' : safeData.pengurus_summary.completion_percentage >= 60 ? 'warning' : 'danger')}`}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <Users className="text-purple-600" size={24} />
                            {getStatusIcon(
                                safeData.pengurus_summary.completion_percentage >= 80
                                    ? 'success'
                                    : safeData.pengurus_summary.completion_percentage >= 60
                                      ? 'warning'
                                      : 'danger',
                            )}
                        </div>
                        <p className="text-sm text-purple-600">Pengurus BUMDes</p>
                        <p className="mb-1 text-xl font-bold">{safeData.pengurus_summary.total_pengurus} Orang</p>
                        <p className="text-xs text-gray-500">{safeData.pengurus_summary.jabatan_terisi} jabatan terisi</p>
                        <p className="mt-1 text-xs text-gray-400">{formatPercentage(safeData.pengurus_summary.completion_percentage)} lengkap</p>
                    </div>
                </div>

                {/* Statistik Unit dan Keuangan */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Chart Legalitas */}
                    <div className="rounded-xl border bg-white p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <PieChart className="text-blue-600" size={24} />
                            <h3 className="text-lg font-semibold">Status Legalitas</h3>
                        </div>

                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: string | number) => {
                                            if (typeof value === 'number') {
                                                return [`${value.toFixed(1)}%`, ''];
                                            }
                                            return [value, ''];
                                        }}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-2 flex justify-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-xs">Lengkap</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="text-xs">Belum Lengkap</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Status */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Missing Documents/Fields */}
                    <div className="rounded-xl border bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">Data Yang Perlu Dilengkapi</h3>

                        <div className="space-y-4">
                            {/* Legalitas Missing */}
                            {safeData.legalitas_summary.missing_documents && safeData.legalitas_summary.missing_documents.length > 0 && (
                                <div>
                                    <h4 className="mb-2 font-medium text-red-600">Dokumen Legalitas:</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        {safeData.legalitas_summary.missing_documents.map((doc, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <XCircle size={14} className="text-red-500" />
                                                {doc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Profile Missing */}
                            {safeData.profile_summary.missing_fields && safeData.profile_summary.missing_fields.length > 0 && (
                                <div>
                                    <h4 className="mb-2 font-medium text-red-600">Profil BUMDes:</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        {safeData.profile_summary.missing_fields.map((field, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <XCircle size={14} className="text-red-500" />
                                                {field}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Profile Desa Missing */}
                            {safeData.profile_desa_summary.missing_fields && safeData.profile_desa_summary.missing_fields.length > 0 && (
                                <div>
                                    <h4 className="mb-2 font-medium text-red-600">Profil Desa:</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        {safeData.profile_desa_summary.missing_fields.map((field, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <XCircle size={14} className="text-red-500" />
                                                {field}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Pengurus Missing */}
                            {safeData.pengurus_summary.jabatan_kosong && safeData.pengurus_summary.jabatan_kosong.length > 0 && (
                                <div>
                                    <h4 className="mb-2 font-medium text-red-600">Jabatan Pengurus Kosong:</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        {safeData.pengurus_summary.jabatan_kosong.map((jabatan, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <XCircle size={14} className="text-red-500" />
                                                {jabatan}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* All Complete */}
                            {(!safeData.legalitas_summary.missing_documents || safeData.legalitas_summary.missing_documents.length === 0) &&
                                (!safeData.profile_summary.missing_fields || safeData.profile_summary.missing_fields.length === 0) &&
                                (!safeData.profile_desa_summary.missing_fields || safeData.profile_desa_summary.missing_fields.length === 0) &&
                                (!safeData.pengurus_summary.jabatan_kosong || safeData.pengurus_summary.jabatan_kosong.length === 0) && (
                                    <div className="py-8 text-center">
                                        <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
                                        <p className="font-medium text-green-600">Semua data sudah lengkap!</p>
                                        <p className="text-sm text-gray-500">Organisasi BUMDes siap beroperasi</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <FooterInfo />
            </div>
        </AppLayout>
    );
}
