<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\Expense;
use App\Models\LegalitasBumdes;
use App\Models\profileBumdes;
use App\Models\PengurusBumdes;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class dashboardAdminController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $dashboardData = $this->getDashboardData();

        return Inertia::render('admin/DashboardAdmin', [
            'auth' => [
                'user' => $user->only(['id_users', 'name', 'email', 'roles'])
            ],
            'data' => $dashboardData
        ]);
    }

    // API endpoint untuk real-time data
    public function getDashboardDataApi()
    {
        $dashboardData = $this->getDashboardData();

        return response()->json([
            'success' => true,
            'data' => $dashboardData
        ]);
    }

    private function getDashboardData()
    {
        // Cache key untuk dashboard data
        $cacheKey = "dashboard_admin_data";

        // Check if data is cached and still fresh (cache for 5 minutes)
        if (Cache::has($cacheKey)) {
            $cachedData = Cache::get($cacheKey);
            // Return cached data if it's less than 5 minutes old
            if (Carbon::parse($cachedData['last_updated'])->diffInMinutes(now()) < 5) {
                return $cachedData;
            }
        }

        $dashboardData = [
            // Ringkasan Legalitas BUMDes
            'legalitas_summary' => $this->getLegalitasSummary(),

            // Ringkasan Profil BUMDes
            'profile_summary' => $this->getProfileSummary(),

            // Ringkasan Profil Desa
            'profile_desa_summary' => $this->getProfileDesaSummary(),

            // Ringkasan Pengurus
            'pengurus_summary' => $this->getPengurusSummary(),


            // Recent Activities
            'recent_activities' => $this->getRecentActivities(),

            // Data Completeness
            'data_completeness' => $this->getDataCompleteness(),

            // Monthly Unit Growth (dummy data for now)
            'monthly_unit_growth' => $this->getMonthlyUnitGrowth(),

            // Legalitas Chart
            'legalitas_chart' => $this->getLegalitasChart(),

            'last_updated' => now()->format('d F Y H:i:s')
        ];

        // Cache the data for 5 minutes
        Cache::put($cacheKey, $dashboardData, 300);

        return $dashboardData;
    }

    // Method untuk clear cache ketika ada update
    public static function clearDashboardCache()
    {
        $cacheKey = "dashboard_admin_data";
        Cache::forget($cacheKey);
    }

    private function getLegalitasSummary()
    {
        $legalitas = LegalitasBumdes::latest()->first();

        if (!$legalitas) {
            return [
                'status' => 'incomplete',
                'message' => 'Data legalitas belum diisi',
                'missing_documents' => ['Semua dokumen legalitas'],
                'completion_percentage' => 0,
                'total_documents' => 0
            ];
        }

        // Based on your database structure: id, name, number, document_image
        $requiredFields = [
            'name',
            'number',
            'document_image'
        ];

        $completedFields = 0;
        $missingDocuments = [];

        foreach ($requiredFields as $field) {
            if (!empty($legalitas->$field)) {
                $completedFields++;
            } else {
                $missingDocuments[] = $this->getFieldLabel($field);
            }
        }

        $completionPercentage = ($completedFields / count($requiredFields)) * 100;

        return [
            'status' => $completionPercentage == 100 ? 'complete' : 'incomplete',
            'completion_percentage' => round($completionPercentage, 1),
            'missing_documents' => $missingDocuments,
            'last_updated' => $legalitas->updated_at ? $legalitas->updated_at->format('d M Y') : null,
            'data' => $legalitas,
            'total_documents' => LegalitasBumdes::count()
        ];
    }

    private function getProfileSummary()
    {
        try {
            $profile = profileBumdes::latest()->first();
        } catch (\Exception $e) {
            return [
                'status' => 'incomplete',
                'message' => 'Tabel profil belum tersedia',
                'completion_percentage' => 0,
                'missing_fields' => ['Semua field profil'],
                'data' => null
            ];
        }

        if (!$profile) {
            return [
                'status' => 'incomplete',
                'message' => 'Profil BUMDes belum diisi',
                'completion_percentage' => 0,
                'missing_fields' => ['Semua field profil'],
                'data' => null
            ];
        }

        // Based on your database structure from profile_bumdes table
        $requiredFields = [
            'nama_bumdes',
            'kepala_bumdes',
            'alamat',
            'email',
            'telepon',
            'logo_bumdes'
        ];

        $completedFields = 0;
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (isset($profile->$field) && !empty($profile->$field)) {
                $completedFields++;
            } else {
                $missingFields[] = $this->getProfileFieldLabel($field);
            }
        }

        $completionPercentage = count($requiredFields) > 0 ? ($completedFields / count($requiredFields)) * 100 : 0;

        return [
            'status' => $completionPercentage == 100 ? 'complete' : 'incomplete',
            'completion_percentage' => round($completionPercentage, 1),
            'missing_fields' => $missingFields,
            'last_updated' => isset($profile->updated_at) && $profile->updated_at ? $profile->updated_at->format('d M Y') : null,
            'data' => $profile
        ];
    }

    private function getProfileDesaSummary()
    {
        try {
            $profileDesa = DB::table('profile_desa')->latest()->first();
        } catch (\Exception $e) {
            return [
                'status' => 'incomplete',
                'message' => 'Tabel profil desa belum tersedia',
                'completion_percentage' => 0,
                'missing_fields' => ['Semua field profil desa'],
                'data' => null
            ];
        }

        if (!$profileDesa) {
            return [
                'status' => 'incomplete',
                'message' => 'Profil desa belum diisi',
                'completion_percentage' => 0,
                'missing_fields' => ['Semua field profil desa'],
                'data' => null
            ];
        }

        // Based on your database structure
        $requiredFields = [
            'nama_desa',
            'alamat',
            'kepala_desa',
            'periode_kepala_desa',
            'email',
            'telepon',
            'luas_desa',
            'logo_desa'
        ];

        $completedFields = 0;
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (isset($profileDesa->$field) && !empty($profileDesa->$field)) {
                $completedFields++;
            } else {
                $missingFields[] = $this->getDesaFieldLabel($field);
            }
        }

        $completionPercentage = count($requiredFields) > 0 ? ($completedFields / count($requiredFields)) * 100 : 0;

        return [
            'status' => $completionPercentage == 100 ? 'complete' : 'incomplete',
            'completion_percentage' => round($completionPercentage, 1),
            'missing_fields' => $missingFields,
            'last_updated' => isset($profileDesa->updated_at) ? Carbon::parse($profileDesa->updated_at)->format('d M Y') : null,
            'data' => $profileDesa
        ];
    }

    private function getPengurusSummary()
    {
        $totalPengurus = PengurusBumdes::count();

        // Based on your database structure: nama_pengurus, jabatan, jenis_kelamin, pekerjaan, kategori
        $jabatanTerisi = PengurusBumdes::distinct('jabatan')->count();

        // Get all existing positions
        $existingJabatan = PengurusBumdes::distinct('jabatan')->pluck('jabatan')->toArray();


        // Get recent pengurus data
        $recentChanges = PengurusBumdes::latest()->limit(3)->get()->map(function ($pengurus) {
            return [
                'nama' => $pengurus->nama_pengurus,
                'jabatan' => $pengurus->jabatan,
                'updated_at' => $pengurus->updated_at
            ];
        })->toArray();

        return [
            'total_pengurus' => $totalPengurus,
            'jabatan_terisi' => count($existingJabatan),
            'existing_jabatan' => $existingJabatan,
            'completion_percentage' => count($existingJabatan),
            'recent_changes' => $recentChanges
        ];
    }

    private function getRecentActivities()
    {
        $activities = [];

        // Get recent incomes
        $incomes = Income::latest()->limit(3)->get();
        foreach ($incomes as $income) {
            $activities[] = [
                'type' => 'income',
                'description' => $income->description ?? 'Pemasukan',
                'amount' => $income->amount,
                'date' => $income->created_at->format('d M Y'),
                'icon' => 'income'
            ];
        }

        // Get recent expenses
        $expenses = Expense::latest()->limit(3)->get();
        foreach ($expenses as $expense) {
            $activities[] = [
                'type' => 'expense',
                'description' => $expense->description ?? 'Pengeluaran',
                'amount' => $expense->amount,
                'date' => $expense->created_at->format('d M Y'),
                'icon' => 'expense'
            ];
        }

        // Sort by date
        usort($activities, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return array_slice($activities, 0, 5);
    }

    private function getDataCompleteness()
    {
        $legalitas = $this->getLegalitasSummary();
        $profile = $this->getProfileSummary();
        $profileDesa = $this->getProfileDesaSummary();
        $pengurus = $this->getPengurusSummary();

        $overallCompletion = ($legalitas['completion_percentage'] +
            $profile['completion_percentage'] +
            $profileDesa['completion_percentage'] +
            $pengurus['completion_percentage']) / 4;

        $status = 'danger';
        if ($overallCompletion >= 80) {
            $status = 'success';
        } elseif ($overallCompletion >= 60) {
            $status = 'warning';
        }

        return [
            'overall_completion' => round($overallCompletion, 1),
            'status' => $status,
            'components' => [
                'legalitas' => $legalitas['completion_percentage'],
                'profile' => $profile['completion_percentage'],
                'profile_desa' => $profileDesa['completion_percentage'],
                'pengurus' => $pengurus['completion_percentage']
            ]
        ];
    }

    private function getMonthlyUnitGrowth()
    {
        // Dummy data - you can replace this with actual logic
        return [
            ['name' => 'Jan', 'new_units' => 2, 'total_units' => 5, 'bulan' => 'Januari'],
            ['name' => 'Feb', 'new_units' => 1, 'total_units' => 6, 'bulan' => 'Februari'],
            ['name' => 'Mar', 'new_units' => 3, 'total_units' => 9, 'bulan' => 'Maret'],
        ];
    }

    private function getLegalitasChart()
    {
        $totalLegalitas = LegalitasBumdes::count();
        $completeLegalitas = LegalitasBumdes::whereNotNull('name')
            ->whereNotNull('number')
            ->whereNotNull('document_image')
            ->count();

        $incompleteLegalitas = $totalLegalitas - $completeLegalitas;

        return [
            'complete' => $completeLegalitas > 0 ? ($completeLegalitas / max($totalLegalitas, 1)) * 100 : 0,
            'incomplete' => $incompleteLegalitas > 0 ? ($incompleteLegalitas / max($totalLegalitas, 1)) * 100 : 100
        ];
    }

    // Update the field label method for legalitas
    private function getFieldLabel($field)
    {
        $labels = [
            'name' => 'Nama Dokumen',
            'number' => 'Nomor Dokumen',
            'document_image' => 'File Dokumen'
        ];

        return $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));
    }

    // Add new method for profile field labels
    private function getProfileFieldLabel($field)
    {
        $labels = [
            'nama_bumdes' => 'Nama BUMDes',
            'kepala_bumdes' => 'Kepala BUMDes',
            'alamat' => 'Alamat',
            'email' => 'Email',
            'telepon' => 'Telepon',
            'logo_bumdes' => 'Logo BUMDes'
        ];

        return $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));
    }

    // Add field labels for profile desa
    private function getDesaFieldLabel($field)
    {
        $labels = [
            'nama_desa' => 'Nama Desa',
            'alamat' => 'Alamat',
            'kepala_desa' => 'Kepala Desa',
            'periode_kepala_desa' => 'Periode Kepala Desa',
            'email' => 'Email',
            'telepon' => 'Telepon',
            'luas_desa' => 'Luas Desa',
            'logo_desa' => 'Logo Desa'
        ];

        return $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));
    }
}