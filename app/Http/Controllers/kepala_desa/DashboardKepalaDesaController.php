<?php

namespace App\Http\Controllers\kepala_desa;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardKepalaDesaController extends Controller
{
    // Target hanya unit 1, 2, dan 3
    private const TARGET_UNIT_IDS = [1, 2, 3];

    public function index()
    {
        $user = Auth::user();
        $unitId = self::TARGET_UNIT_IDS;

        $dashboardData = $this->getDashboardData($unitId);

        return Inertia::render('kepala_desa/DashboardKepalaDesa', [
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
        // Override dengan target unit IDs
        $unitId = self::TARGET_UNIT_IDS;

        $dashboardData = $this->getDashboardData($unitId);

        return response()->json([
            'success' => true,
            'data' => $dashboardData
        ]);
    }

    private function getDashboardData($unitId)
    {
        // Override unitId dengan target units
        $unitId = self::TARGET_UNIT_IDS;

        // Cache key untuk dashboard data
        $unitIdString = implode(',', $unitId);
        $cacheKey = "dashboard_kepala_desa_data_" . md5($unitIdString);

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

        // Pendapatan bulan ini dari unit 1, 2, dan 3 saja
        $pendapatanBulanIni = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->whereIn('id_units', $unitId);
        })
            ->where('created_at', '>=', $thisMonth)
            ->with('rent')
            ->get()
            ->sum(fn($income) => $income->rent->total_bayar ?? 0);

        // Pengeluaran bulan ini dari unit 1, 2, dan 3 saja
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
            $cacheKey = "dashboard_kepala_desa_data_{$unitId}" . md5(implode(',', $unitId));
            Cache::forget($cacheKey);
        } else {
            // Clear all dashboard cache if no specific units
            Cache::flush();
        }
    }

    private function getTotalBalance($unitIds)
    {
        $totalBalance = 0;

        foreach (self::TARGET_UNIT_IDS as $unitId) {
            $balance = BalanceHistory::where('unit_id', $unitId)->latest()->value('saldo_sekarang')
                ?? InitialBalance::where('unit_id', $unitId)->value('nominal')
                ?? 0;
            $totalBalance += $balance;
        }

        return $totalBalance;
    }

    private function getUnitBalances($unitIds)
    {
        $histories = BalanceHistory::with(['unit.initialBalance'])
            ->whereIn('unit_id', self::TARGET_UNIT_IDS)
            ->latest()
            ->get()
            ->unique('unit_id');

        $balances = [];

        foreach ($histories as $history) {
            $unit = $history->unit;

            $balances[] = [
                'unit_id'         => $unit->id_units,
                'unit_name'       => $unit->unit_name ?? 'Unit ' . $unit->id_units,
                'initial_balance' => $unit->initialBalance->nominal ?? 0,
                'latest_balance'  => $history->saldo_sekarang ?? 0,
                'balance'         => $history->saldo_sekarang ?? 0,
            ];
        }

        // Handle jika unit 1, 2, atau 3 tidak memiliki balance history
        $existingUnitIds = collect($balances)->pluck('unit_id')->toArray();
        $missingUnitIds = array_diff(self::TARGET_UNIT_IDS, $existingUnitIds);

        foreach ($missingUnitIds as $missingId) {
            $unit = Unit::with('initialBalance')->where('id_units', $missingId)->first();

            if ($unit) {
                $balances[] = [
                    'unit_id'         => $unit->id_units,
                    'unit_name'       => $unit->unit_name ?? 'Unit ' . $unit->id_units,
                    'initial_balance' => $unit->initialBalance->nominal ?? 0,
                    'latest_balance'  => $unit->initialBalance->nominal ?? 0,
                    'balance'         => $unit->initialBalance->nominal ?? 0,
                ];
            } else {
                // Jika unit tidak ada, buat entry kosong
                $balances[] = [
                    'unit_id'         => $missingId,
                    'unit_name'       => 'Unit ' . $missingId,
                    'initial_balance' => 0,
                    'latest_balance'  => 0,
                    'balance'         => 0,
                ];
            }
        }

        // Sort berdasarkan unit_id
        usort($balances, function ($a, $b) {
            return $a['unit_id'] <=> $b['unit_id'];
        });

        return $balances;
    }

    private function getMonthlyPendapatan($unitId)
    {
        // Override dengan target unit IDs
        $unitId = self::TARGET_UNIT_IDS;

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

    public function updateSaldoAwal(Request $request)
    {
        $validated = $request->validate([
            'id_unit' => 'required|exists:units,id_units',
            'nominal' => 'required|numeric|min:0',
        ]);

        // Validasi hanya untuk unit 1, 2, dan 3
        if (!in_array($validated['id_unit'], self::TARGET_UNIT_IDS)) {
            return back()->withErrors(['error' => 'Akses ditolak. Hanya unit 1, 2, dan 3 yang diizinkan.']);
        }

        try {
            DB::beginTransaction();

            // Cek apakah initial balance sudah ada
            $initialBalance = InitialBalance::where('unit_id', $validated['id_unit'])->first();

            if ($initialBalance) {
                $initialBalance->update([
                    'nominal' => $validated['nominal'],
                ]);
            } else {
                InitialBalance::create([
                    'unit_id' => $validated['id_unit'],
                    'nominal' => $validated['nominal'],
                ]);
            }

            DB::commit();

            return back()->with('info', [
                'message' => 'Saldo awal berhasil diperbarui.',
                'method' => $initialBalance ? 'update' : 'create',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambahkan data: ' . $e->getMessage()]);
        }
    }

    private function getMonthlyPengeluaran($unitId)
    {
        // Override dengan target unit IDs
        $unitId = self::TARGET_UNIT_IDS;

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
        // Override dengan target unit IDs
        $unitId = self::TARGET_UNIT_IDS;

        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // Pendapatan bulan ini dan bulan lalu dari unit 1, 2, dan 3 saja
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

        // Pengeluaran bulan ini dan bulan lalu dari unit 1, 2, dan 3 saja
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
