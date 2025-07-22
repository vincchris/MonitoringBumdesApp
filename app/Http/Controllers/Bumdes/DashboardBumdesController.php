<?php

namespace App\Http\Controllers\Bumdes;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardBumdesController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ambil semua unit dari tabel unit (untuk kepala desa)
        $unitId = Unit::pluck('id_units')->toArray();

        if (empty($unitId)) {
            abort(404, 'Tidak ada unit usaha yang terdaftar.');
        }

        $dashboardData = $this->getDashboardData($unitId);

        return Inertia::render('Bumdes/DashboardBumdes', [
            'unit_id' => $unitId,
            'auth' => [
                'user' => $user->only(['id_users', 'name', 'email', 'roles'])
            ],
            'dashboard_data' => $dashboardData
        ]);
    }


    // API endpoint untuk real-time data
    public function getDashboardDataApi($unitId)
    {
        $user = Auth::user()->load('units');
        $unitId = $user->units->pluck('id_units')->toArray();

        if (empty($unitId)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $dashboardData = $this->getDashboardData($unitId);

        return response()->json([
            'success' => true,
            'data' => $dashboardData
        ]);
    }

    private function getDashboardData($unitId)
    {
        // Cache key untuk dashboard data
        $unitIdString = implode(',', $unitId);
        $cacheKey = "dashboard_bumdes_data_" . md5($unitIdString);

        // Check if data is cached and still fresh (cache for 30 seconds)
        if (Cache::has($cacheKey)) {
            $cachedData = Cache::get($cacheKey);
            // Return cached data if it's less than 30 seconds old
            if (Carbon::parse($cachedData['last_updated'])->diffInSeconds(now()) < 30) {
                return $cachedData;
            }
        }

        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Pendapatan bulan ini dari semua unit
        $pendapatanBulanIni = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->whereIn('id_units', $unitId);
        })
            ->where('created_at', '>=', $thisMonth)
            ->with('rent')
            ->get()
            ->sum(fn($income) => $income->rent->total_bayar ?? 0);

        // Pengeluaran bulan ini dari semua unit
        $pengeluaranBulanIni = Expense::whereIn('unit_id', $unitId)
            ->where('created_at', '>=', $thisMonth)
            ->sum('nominal');

        $dashboardData = [
            'pendapatan_bulan_ini' => $pendapatanBulanIni ?? 0,
            'pengeluaran_bulan_ini' => $pengeluaranBulanIni ?? 0,
            'net_profit_bulan_ini' => ($pendapatanBulanIni - $pengeluaranBulanIni) ?? 0,
            'total_saldo_unit_usaha' => $this->getTotalBalance($unitId),
            'unit_balances' => $this->getUnitBalances($unitId),
            'monthly_chart_pendapatan' => $this->getMonthlyPendapatan($unitId),
            'monthly_chart_pengeluaran' => $this->getMonthlyPengeluaran($unitId),
            'statistics' => $this->getStatistics($unitId),
            'last_updated' => now()->format('Y-m-d H:i:s')
        ];

        // Cache the data for 30 seconds
        Cache::put($cacheKey, $dashboardData, 30);

        return $dashboardData;
    }

    // Method untuk clear cache ketika ada update
    public static function clearDashboardCache($unitId)
    {
        if ($unitId) {
            $cacheKey = "dashboard_bumdes_data_{$unitId}" . md5(implode(',', $unitId));
            Cache::forget($cacheKey);
        } else {
            // Clear all dashboard cache if no specific units
            Cache::flush();
        }
    }

    private function getTotalBalance($unitIds)
    {
        $totalBalance = 0;

        foreach ($unitIds as $unitId) {
            $balance = BalanceHistory::where('unit_id', $unitId)->latest()->value('saldo_sekarang')
                ?? InitialBalance::where('unit_id', $unitId)->value('nominal')
                ?? 0;
            $totalBalance += $balance;
        }

        return $totalBalance;
    }

    private function getUnitBalances($unitId)
    {
        $units = Unit::whereIn('id_units', $unitId)->get();
        $balances = [];

        foreach ($units as $unit) {
            $balance = BalanceHistory::where('unit_id', $unit->id_units)->latest()->value('saldo_sekarang')
                ?? InitialBalance::where('unit_id', $unit->id_units)->value('nominal')
                ?? 0;

            $balances[] = [
                'unit_name' => $unit->nama_unit ?? 'Unit ' . $unit->id_units,
                'balance' => $balance
            ];
        }

        return $balances;
    }

    private function getMonthlyPendapatan($unitId)
    {
        $data = [];
        $startDate = Carbon::now()->subMonths(5)->startOfMonth();

        for ($i = 0; $i < 6; $i++) {
            $monthStart = $startDate->copy()->addMonths($i)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            $pendapatan = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
                $query->whereIn('id_units', $unitId);
            })
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->with('rent')
                ->get()
                ->sum(fn($income) => $income->rent->total_bayar ?? 0);

            $data[] = [
                'name' => $monthStart->format('M Y'),
                'pendapatan' => $pendapatan ?? 0,
                'bulan' => $monthStart->format('Y-m'),
            ];
        }

        return $data;
    }

    private function getMonthlyPengeluaran($unitId)
    {
        $data = [];
        $startDate = Carbon::now()->subMonths(5)->startOfMonth();

        for ($i = 0; $i < 6; $i++) {
            $monthStart = $startDate->copy()->addMonths($i)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            $pengeluaran = Expense::whereIn('unit_id', $unitId)
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('nominal');

            $data[] = [
                'name' => $monthStart->format('M Y'),
                'pengeluaran' => $pengeluaran ?? 0,
                'bulan' => $monthStart->format('Y-m'),
            ];
        }

        return $data;
    }

    private function getStatistics($unitId)
    {
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // Pendapatan bulan ini dan bulan lalu
        $pendapatanBulanIni = Income::whereHas('rent.tarif.unit', function ($q) use ($unitId) {
            $q->whereIn('id_units', $unitId);
        })
            ->where('created_at', '>=', $thisMonth)
            ->with('rent')
            ->get()
            ->sum(fn($income) => $income->rent->total_bayar ?? 0);

        $pendapatanBulanLalu = Income::whereHas('rent.tarif.unit', function ($q) use ($unitId) {
            $q->whereIn('id_units', $unitId);
        })
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->with('rent')
            ->get()
            ->sum(fn($income) => $income->rent->total_bayar ?? 0);

        // Pengeluaran bulan ini dan bulan lalu
        $pengeluaranBulanIni = Expense::whereIn('unit_id', $unitId)
            ->where('created_at', '>=', $thisMonth)
            ->sum('nominal');

        $pengeluaranBulanLalu = Expense::whereIn('unit_id', $unitId)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('nominal');

        // Hitung pertumbuhan
        $pertumbuhanPendapatan = $pendapatanBulanLalu > 0
            ? (($pendapatanBulanIni - $pendapatanBulanLalu) / $pendapatanBulanLalu) * 100
            : 0;

        $selisihPendapatanPengeluaran = $pendapatanBulanIni - $pengeluaranBulanIni;
        $selisihBulanLalu = $pendapatanBulanLalu - $pengeluaranBulanLalu;

        $persentaseSelisih = $selisihBulanLalu > 0
            ? (($selisihPendapatanPengeluaran - $selisihBulanLalu) / $selisihBulanLalu) * 100
            : 0;

        $totalTransaksi = Income::whereHas('rent.tarif.unit', function ($q) use ($unitId) {
            $q->whereIn('id_units', $unitId);
        })
            ->where('created_at', '>=', $thisMonth)
            ->count();

        return [
            'pendapatan_bulan_ini' => $pendapatanBulanIni ?? 0,
            'pendapatan_bulan_lalu' => $pendapatanBulanLalu ?? 0,
            'pertumbuhan_pendapatan' => round($pertumbuhanPendapatan, 2),
            'pengeluaran_bulan_ini' => $pengeluaranBulanIni ?? 0,
            'pengeluaran_bulan_lalu' => $pengeluaranBulanLalu ?? 0,
            'net_profit_bulan_ini' => $selisihPendapatanPengeluaran ?? 0,
            'net_profit_bulan_lalu' => $selisihBulanLalu ?? 0,
            'persentase_selisih' => round($persentaseSelisih, 2),
            'total_transaksi' => $totalTransaksi ?? 0,
            'rata_rata_pendapatan_harian' => round($pendapatanBulanIni / max(Carbon::now()->day, 1), 2),
        ];
    }
}
