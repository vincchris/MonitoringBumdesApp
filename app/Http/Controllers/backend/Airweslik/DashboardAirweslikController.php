<?php

namespace App\Http\Controllers\backend\Airweslik;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardAirweslikController extends Controller
{
    public function index($unitId)
    {
        $user = Auth::user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $dashboardData = $this->getDashboardData($unitId);

        return Inertia::render('Airweslik/DashboardAirweslik', [
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

        if (!$user->units->contains('id_units', $unitId)) {
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
        $cacheKey = "dashboard_data_unit_{$unitId}";

        // Check if data is cached and still fresh (cache for 30 seconds)
        if (Cache::has($cacheKey)) {
            $cachedData = Cache::get($cacheKey);
            // Return cached data if it's less than 30 seconds old
            if (Carbon::parse($cachedData['last_updated'])->diffInSeconds(now()) < 30) {
                return $cachedData;
            }
        }

        $today = Carbon::today();

        $pendapatanHariIni = Income::whereDate('updated_at', $today)
            ->whereHas('rent.tarif.unit', fn($query) => $query->where('id_units', $unitId))
            ->with('rent')
            ->get()
        ->sum(fn($income) => $income->rent->total_bayar ?? 0);


        $pengeluaranHariIni = Expense::where('unit_id', $unitId)
            ->whereDate('created_at', $today)
            ->sum('nominal');

        $dashboardData = [
            'pendapatan_hari_ini' => $pendapatanHariIni ?? 0,
            'pengeluaran_hari_ini' => $pengeluaranHariIni ?? 0,
            'saldo_kas' => $this->getCurrentBalance($unitId),
            'weekly_chart' => $this->getWeeklyData($unitId),
            'monthly_chart' => $this->getMonthlyData($unitId),
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
        $cacheKey = "dashboard_data_unit_{$unitId}";
        Cache::forget($cacheKey);
    }

    private function getCurrentBalance($unitId)
    {
        return BalanceHistory::where('unit_id', $unitId)->latest()->value('saldo_sekarang')
            ?? InitialBalance::where('unit_id', $unitId)->value('nominal')
            ?? 0;
    }

    private function getWeeklyData($unitId)
    {
        $data = [];
        $startDate = Carbon::now()->subDays(6);

        for ($i = 0; $i < 7; $i++) {
            $date = $startDate->copy()->addDays($i);

            $pendapatan = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
                $query->where('id_units', $unitId);
            })
                ->whereDate('created_at', $date)
                ->with('rent')
                ->get()
                ->sum(fn($income) => $income->rent->total_bayar ?? 0);

            $pengeluaran = Expense::where('unit_id', $unitId)
                ->whereDate('created_at', $date)
                ->sum('nominal');

            $data[] = [
                'name' => $date->format('D'),
                'pendapatan' => $pendapatan ?? 0,
                'pengeluaran' => $pengeluaran ?? 0,
                'tanggal' => $date->format('Y-m-d'),
            ];
        }

        return $data;
    }

    private function getMonthlyData($unitId)
    {
        $data = [];
        $startDate = Carbon::now()->subDays(29);

        for ($week = 0; $week < 5; $week++) {
            $weekStart = $startDate->copy()->addWeeks($week);
            $weekEnd = $weekStart->copy()->addDays(6)->min(Carbon::now());

            $pendapatan = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
                $query->where('id_units', $unitId);
            })
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->with('rent')
                ->get()
                ->sum(fn($income) => $income->rent->total_bayar ?? 0);

            $pengeluaran = Expense::where('unit_id', $unitId)
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->sum('nominal');

            $data[] = [
                'name' => 'Week ' . ($week + 1),
                'pendapatan' => $pendapatan ?? 0,
                'pengeluaran' => $pengeluaran ?? 0,
                'periode' => $weekStart->format('M d') . ' - ' . $weekEnd->format('M d'),
            ];
        }

        return $data;
    }

    private function getStatistics($unitId)
    {
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $pendapatanBulanIni = Income::whereHas('rent.tarif.unit', fn($q) => $q->where('id_units', $unitId))
            ->where('created_at', '>=', $thisMonth)
            ->with('rent')
            ->get()
            ->sum(fn($income) => $income->rent->total_bayar ?? 0);

        $pendapatanBulanLalu = Income::whereHas('rent.tarif.unit', fn($q) => $q->where('id_units', $unitId))
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->with('rent')
            ->get()
            ->sum(fn($income) => $income->rent->total_bayar ?? 0);

        $pertumbuhan = $pendapatanBulanLalu > 0
            ? (($pendapatanBulanIni - $pendapatanBulanLalu) / $pendapatanBulanLalu) * 100
            : 0;

        $totalTransaksi = Income::whereHas('rent.tarif.unit', fn($q) => $q->where('id_units', $unitId))
            ->where('created_at', '>=', $thisMonth)
            ->count();

        $pengeluaran = Expense::where('unit_id', $unitId)
            ->where('created_at', '>=', $thisMonth)
            ->sum('nominal');

        return [
            'pendapatan_bulan_ini' => $pendapatanBulanIni ?? 0,
            'pendapatan_bulan_lalu' => $pendapatanBulanLalu ?? 0,
            'pertumbuhan_pendapatan' => round($pertumbuhan, 2),
            'total_transaksi' => $totalTransaksi ?? 0,
            'rata_rata_pendapatan' => round($pendapatanBulanIni / max(Carbon::now()->day, 1), 2),
            'pengeluaran_bulan_ini' => $pengeluaran ?? 0,
            'net_profit_bulan_ini' => ($pendapatanBulanIni - $pengeluaran) ?? 0,
        ];
    }
}
