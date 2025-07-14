<?php

namespace App\Http\Controllers\backend\MiniSoc;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardMiniSocController extends Controller
{
    public function index($unitId)
    {
        $user = Auth::user()->load('units');

        // Pastikan user punya akses ke unit ini
        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        // Ambil data dashboard
        $dashboardData = $this->getDashboardData($unitId);

        return Inertia::render('MiniSoc/DashboardMiniSoc', [
            'unit_id' => $unitId,
            'auth' => [
                'user' => $user->only(['id_users', 'name', 'email', 'roles'])
            ],
            'dashboard_data' => $dashboardData
        ]);
    }

    private function getDashboardData($unitId)
    {
        $today = Carbon::today();
        $currentWeek = Carbon::now()->startOfWeek();
        $currentMonth = Carbon::now()->startOfMonth();

        // Pendapatan hari ini
        $pendapatanHariIni = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->where('id_units', $unitId);
        })
        ->whereDate('created_at', $today)
        ->with('rent')
        ->get()
        ->sum('rent.total_bayar') ?? 0;

        // Pengeluaran hari ini - sesuaikan dengan model Expense yang ada
        $pengeluaranHariIni = DB::table('expenses')
            ->where('unit_id', $unitId)
            ->whereDate('created_at', $today)
            ->sum('nominal') ?? 0;

        // Saldo Kas saat ini
        $saldoKas = $this->getCurrentBalance($unitId);

        // Data chart mingguan (7 hari terakhir)
        $weeklyData = $this->getWeeklyData($unitId);

        // Data chart bulanan (30 hari terakhir dalam bentuk mingguan)
        $monthlyData = $this->getMonthlyData($unitId);

        // Statistik tambahan
        $statistics = $this->getStatistics($unitId);

        return [
            'pendapatan_hari_ini' => $pendapatanHariIni,
            'pengeluaran_hari_ini' => $pengeluaranHariIni,
            'saldo_kas' => $saldoKas,
            'weekly_chart' => $weeklyData,
            'monthly_chart' => $monthlyData,
            'statistics' => $statistics,
            'last_updated' => now()->format('Y-m-d H:i:s')
        ];
    }

    private function getCurrentBalance($unitId)
    {
        // Ambil saldo terakhir dari balance history
        $lastBalance = BalanceHistory::where('unit_id', $unitId)
            ->latest()
            ->first();

        if ($lastBalance) {
            return $lastBalance->saldo_sekarang;
        }

        // Jika tidak ada history, ambil dari initial balance
        $initialBalance = InitialBalance::where('unit_id', $unitId)->first();
        return $initialBalance?->nominal ?? 0;
    }

    private function getWeeklyData($unitId)
    {
        $data = [];
        $startDate = Carbon::now()->subDays(6); // 7 hari terakhir

        for ($i = 0; $i < 7; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dayName = $date->format('D'); // Mon, Tue, Wed, etc.

            // Pendapatan per hari
            $pendapatan = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
                $query->where('id_units', $unitId);
            })
            ->whereDate('created_at', $date)
            ->with('rent')
            ->get()
            ->sum('rent.total_bayar') ?? 0;

            // Pengeluaran per hari
            $pengeluaran = DB::table('expenses')
                ->where('unit_id', $unitId)
                ->whereDate('created_at', $date)
                ->sum('nominal') ?? 0;

            $data[] = [
                'name' => $dayName,
                'pendapatan' => $pendapatan,
                'pengeluaran' => $pengeluaran,
                'tanggal' => $date->format('Y-m-d')
            ];
        }

        return $data;
    }

    private function getMonthlyData($unitId)
    {
        $data = [];
        $startDate = Carbon::now()->subDays(29); // 30 hari terakhir

        // Group by week untuk monthly chart
        for ($week = 0; $week < 5; $week++) {
            $weekStart = $startDate->copy()->addWeeks($week);
            $weekEnd = $weekStart->copy()->addDays(6);

            // Pastikan tidak melebihi hari ini
            if ($weekEnd->isFuture()) {
                $weekEnd = Carbon::now();
            }

            $weekName = 'Week ' . ($week + 1);

            // Pendapatan per minggu
            $pendapatan = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
                $query->where('id_units', $unitId);
            })
            ->whereBetween('created_at', [$weekStart, $weekEnd])
            ->with('rent')
            ->get()
            ->sum('rent.total_bayar') ?? 0;

            // Pengeluaran per minggu
            $pengeluaran = DB::table('expenses')
                ->where('unit_id', $unitId)
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->sum('nominal') ?? 0;

            $data[] = [
                'name' => $weekName,
                'pendapatan' => $pendapatan,
                'pengeluaran' => $pengeluaran,
                'periode' => $weekStart->format('M d') . ' - ' . $weekEnd->format('M d')
            ];
        }

        return $data;
    }

    private function getStatistics($unitId)
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // Pendapatan bulan ini
        $pendapatanBulanIni = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->where('id_units', $unitId);
        })
        ->where('created_at', '>=', $currentMonth)
        ->with('rent')
        ->get()
        ->sum('rent.total_bayar') ?? 0;

        // Pendapatan bulan lalu
        $pendapatanBulanLalu = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->where('id_units', $unitId);
        })
        ->whereBetween('created_at', [$lastMonth, $lastMonthEnd])
        ->with('rent')
        ->get()
        ->sum('rent.total_bayar') ?? 0;

        // Pertumbuhan pendapatan
        $pertumbuhanPendapatan = $pendapatanBulanLalu > 0
            ? (($pendapatanBulanIni - $pendapatanBulanLalu) / $pendapatanBulanLalu) * 100
            : 0;

        // Total transaksi bulan ini
        $totalTransaksi = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->where('id_units', $unitId);
        })
        ->where('created_at', '>=', $currentMonth)
        ->count();

        // Rata-rata pendapatan per hari
        $hariDalamBulan = Carbon::now()->day;
        $rataRataPendapatan = $hariDalamBulan > 0 ? $pendapatanBulanIni / $hariDalamBulan : 0;

        // Pengeluaran bulan ini
        $pengeluaranBulanIni = DB::table('expenses')
            ->where('unit_id', $unitId)
            ->where('created_at', '>=', $currentMonth)
            ->sum('nominal') ?? 0;

        // Net profit bulan ini
        $netProfitBulanIni = $pendapatanBulanIni - $pengeluaranBulanIni;

        return [
            'pendapatan_bulan_ini' => $pendapatanBulanIni,
            'pendapatan_bulan_lalu' => $pendapatanBulanLalu,
            'pertumbuhan_pendapatan' => round($pertumbuhanPendapatan, 2),
            'total_transaksi' => $totalTransaksi,
            'rata_rata_pendapatan' => round($rataRataPendapatan, 2),
            'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
            'net_profit_bulan_ini' => $netProfitBulanIni
        ];
    }
}