import { FooterInfo } from '@/components/footer-dashboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, Building2, CheckCircle, FileText, PieChart, Users, XCircle, TrendingUp, Calendar, Clock } from 'lucide-react';
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
                return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-green-100';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-yellow-100';
            case 'incomplete':
            case 'danger':
            default:
                return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-red-100';
        }
    };

    const getCompletionStatus = (percentage: number) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    };

    const pieData = [
        { name: 'Lengkap', value: safeData.legalitas_chart.complete, color: '#10b981' },
        { name: 'Belum Lengkap', value: safeData.legalitas_chart.incomplete, color: '#ef4444' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin - BUMDes" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-blue-300/20 blur-xl"></div>

                        <div className="relative flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-white">Dashboard BUMDes</h1>
                                <p className="text-lg text-blue-100">
                                    {safeData.profile_summary.data?.nama_bumdes || 'Sistem Manajemen BUMDes'}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
                                    <Clock size={16} />
                                    <span>Terakhir diperbarui: {safeData.last_updated}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                    <Building2 size={48} className="mb-2 text-blue-200" />
                                    <div className="text-sm text-blue-200">Admin Panel</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Overall Completion */}
                    <div className={`rounded-2xl border-2 p-8 shadow-lg ${getStatusColor(safeData.data_completeness.status)}`}>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {getStatusIcon(safeData.data_completeness.status)}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Kelengkapan Data Organisasi</h2>
                                    <p className="text-gray-600">Status keseluruhan data BUMDes</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-gray-800">
                                    {formatPercentage(safeData.data_completeness.overall_completion)}
                                </div>
                                <div className="text-sm text-gray-600">Terisi</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className={`h-full transition-all duration-700 ${
                                        safeData.data_completeness.overall_completion >= 80
                                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                                            : safeData.data_completeness.overall_completion >= 60
                                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                            : 'bg-gradient-to-r from-red-500 to-red-600'
                                    }`}
                                    style={{ width: `${safeData.data_completeness.overall_completion}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                            {[
                                { label: 'Legalitas', value: safeData.data_completeness.components.legalitas, color: 'text-blue-600' },
                                { label: 'Profil BUMDes', value: safeData.data_completeness.components.profile, color: 'text-green-600' },
                                { label: 'Profil Desa', value: safeData.data_completeness.components.profile_desa, color: 'text-orange-600' },
                                { label: 'Pengurus', value: safeData.data_completeness.components.pengurus, color: 'text-purple-600' },
                            ].map((item, index) => (
                                <div key={index} className="text-center">
                                    <div className={`text-2xl font-bold ${item.color}`}>
                                        {formatPercentage(item.value)}
                                    </div>
                                    <div className="text-sm text-gray-600">{item.label}</div>
                                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className={`h-full transition-all duration-500 ${
                                                item.value >= 80 ? 'bg-green-500' :
                                                item.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${item.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Summary Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Legalitas Card */}
                        <div className={`group rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${getStatusColor(safeData.legalitas_summary.status)}`}>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-blue-500 p-3 text-white shadow-lg">
                                    <FileText size={24} />
                                </div>
                                {getStatusIcon(safeData.legalitas_summary.status)}
                            </div>
                            <div className="mb-2 text-sm font-semibold text-blue-600">Status Legalitas</div>
                            <div className="mb-2 text-2xl font-bold text-gray-800">
                                {formatPercentage(safeData.legalitas_summary.completion_percentage)}
                            </div>
                            <div className="mb-3 text-xs text-gray-600">
                                {safeData.legalitas_summary.total_documents
                                    ? `${safeData.legalitas_summary.total_documents} dokumen total`
                                    : 'Belum ada dokumen'}
                            </div>
                            {safeData.legalitas_summary.last_updated && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    <span>{safeData.legalitas_summary.last_updated}</span>
                                </div>
                            )}
                        </div>

                        {/* Profil BUMDes Card */}
                        <div className={`group rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${getStatusColor(safeData.profile_summary.status)}`}>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-green-500 p-3 text-white shadow-lg">
                                    <Building2 size={24} />
                                </div>
                                {getStatusIcon(safeData.profile_summary.status)}
                            </div>
                            <div className="mb-2 text-sm font-semibold text-green-600">Profil BUMDes</div>
                            <div className="mb-2 text-2xl font-bold text-gray-800">
                                {formatPercentage(safeData.profile_summary.completion_percentage)}
                            </div>
                            <div className="mb-3 text-xs text-gray-600">
                                {safeData.profile_summary.missing_fields && safeData.profile_summary.missing_fields.length > 0
                                    ? `${safeData.profile_summary.missing_fields.length} field belum diisi`
                                    : 'Data profil lengkap'}
                            </div>
                            {safeData.profile_summary.last_updated && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    <span>{safeData.profile_summary.last_updated}</span>
                                </div>
                            )}
                        </div>

                        {/* Profil Desa Card */}
                        <div className={`group rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${getStatusColor(safeData.profile_desa_summary.status)}`}>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-orange-500 p-3 text-white shadow-lg">
                                    <Building2 size={24} />
                                </div>
                                {getStatusIcon(safeData.profile_desa_summary.status)}
                            </div>
                            <div className="mb-2 text-sm font-semibold text-orange-600">Profil Desa</div>
                            <div className="mb-2 text-2xl font-bold text-gray-800">
                                {formatPercentage(safeData.profile_desa_summary.completion_percentage)}
                            </div>
                            <div className="mb-3 text-xs text-gray-600">
                                {safeData.profile_desa_summary.missing_fields && safeData.profile_desa_summary.missing_fields.length > 0
                                    ? `${safeData.profile_desa_summary.missing_fields.length} field belum diisi`
                                    : 'Data profil lengkap'}
                            </div>
                            {safeData.profile_desa_summary.last_updated && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    <span>{safeData.profile_desa_summary.last_updated}</span>
                                </div>
                            )}
                        </div>

                        {/* Pengurus Card */}
                        <div className={`group rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${getStatusColor(getCompletionStatus(safeData.pengurus_summary.completion_percentage))}`}>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-purple-500 p-3 text-white shadow-lg">
                                    <Users size={24} />
                                </div>
                                {getStatusIcon(getCompletionStatus(safeData.pengurus_summary.completion_percentage))}
                            </div>
                            <div className="mb-2 text-sm font-semibold text-purple-600">Pengurus BUMDes</div>
                            <div className="mb-2 text-2xl font-bold text-gray-800">
                                {safeData.pengurus_summary.total_pengurus} Orang
                            </div>
                            <div className="mb-3 text-xs text-gray-600">
                                {safeData.pengurus_summary.jabatan_terisi} jabatan terisi
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <TrendingUp size={12} />
                                <span>{formatPercentage(safeData.pengurus_summary.completion_percentage)} lengkap</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts and Details Section */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Enhanced Chart */}
                        <div className="rounded-2xl border bg-white p-8 shadow-lg lg:col-span-1">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-blue-500 p-2 text-white">
                                    <PieChart size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Status Legalitas</h3>
                                    <p className="text-sm text-gray-600">Distribusi dokumen</p>
                                </div>
                            </div>

                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={90}
                                            dataKey="value"
                                            strokeWidth={3}
                                        >
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

                            <div className="mt-4 flex justify-center gap-6 text-black">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium">Lengkap</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="text-sm font-medium">Belum Lengkap</span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Missing Data */}
                        <div className="rounded-2xl border bg-white p-8 shadow-lg lg:col-span-2">
                            <h3 className="mb-6 text-xl font-bold text-gray-800">Data Yang Perlu Dilengkapi</h3>

                            <div className="space-y-6">
                                {/* Legalitas Missing */}
                                {safeData.legalitas_summary.missing_documents && safeData.legalitas_summary.missing_documents.length > 0 && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        <h4 className="mb-3 font-semibold text-red-700">📄 Dokumen Legalitas</h4>
                                        <ul className="space-y-2">
                                            {safeData.legalitas_summary.missing_documents.map((doc, index) => (
                                                <li key={index} className="flex items-center gap-3 text-sm text-red-600">
                                                    <XCircle size={16} className="text-red-500" />
                                                    <span className="font-medium">{doc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Profile Missing */}
                                {safeData.profile_summary.missing_fields && safeData.profile_summary.missing_fields.length > 0 && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        <h4 className="mb-3 font-semibold text-red-700">🏢 Profil BUMDes</h4>
                                        <ul className="space-y-2">
                                            {safeData.profile_summary.missing_fields.map((field, index) => (
                                                <li key={index} className="flex items-center gap-3 text-sm text-red-600">
                                                    <XCircle size={16} className="text-red-500" />
                                                    <span className="font-medium">{field}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Profile Desa Missing */}
                                {safeData.profile_desa_summary.missing_fields && safeData.profile_desa_summary.missing_fields.length > 0 && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        <h4 className="mb-3 font-semibold text-red-700">🏘️ Profil Desa</h4>
                                        <ul className="space-y-2">
                                            {safeData.profile_desa_summary.missing_fields.map((field, index) => (
                                                <li key={index} className="flex items-center gap-3 text-sm text-red-600">
                                                    <XCircle size={16} className="text-red-500" />
                                                    <span className="font-medium">{field}</span>
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
                                        <div className="rounded-xl bg-green-50 p-8 text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                                <CheckCircle className="text-green-600" size={32} />
                                            </div>
                                            <h4 className="mb-2 text-lg font-bold text-green-700">Selamat!</h4>
                                            <p className="text-green-600">Semua data sudah lengkap dan siap untuk beroperasi</p>
                                            <div className="mt-4 text-sm text-green-500">
                                                Organisasi BUMDes dapat beroperasi dengan optimal
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <FooterInfo />
                </div>
            </div>
        </AppLayout>
    );
}