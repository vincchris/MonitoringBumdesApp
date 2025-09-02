<?php

namespace App\Http\Controllers\backend\MiniSoc;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
use App\Exports\LaporanExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KelolaLaporanMiniSocController extends Controller
{
    /**
     * Display laporan keuangan
     * Menerima parameter unitId dari route dan request untuk pagination/filter
     */
    public function index(Request $request, $unitId = null)
    {
        $user = Auth::user()->load('units');

        // Jika ada unitId dari parameter route, gunakan itu
        if ($unitId) {
            $unit = Unit::findOrFail($unitId);
            // Pastikan user memiliki akses ke unit ini
            if (!$user->units->contains('id_units', $unit->id_units)) {
                abort(403, 'Anda tidak memiliki akses ke unit ini.');
            }
        } else {
            // Jika tidak ada unitId, ambil unit pertama user
            $unit = $user->units()->first();
            if (!$unit) {
                abort(403, 'Anda tidak memiliki unit yang dapat diakses.');
            }
        }

        $tanggalDipilih = $request->get('tanggal');
        $page = $request->get('page', 1);
        $perPage = 10;

        // Cek apakah menggunakan BalanceHistory atau data manual
        if ($this->hasBalanceHistory($unit->id_units)) {
            $laporanKeuangan = $this->getLaporanFromBalanceHistory($unit->id_units, $tanggalDipilih, $page, $perPage);
        } else {
            $laporanKeuangan = $this->getLaporanManual($unit->id_units, $tanggalDipilih, $page, $perPage);
        }

        return Inertia::render('MiniSoc/KelolaLaporanMiniSoc', [
            'auth' => [
                'user' => $user->only(['id_users', 'name', 'roles', 'image']),
            ],
            'unit_id' => $unit->id_units,
            'laporanKeuangan' => $laporanKeuangan['data'],
            'tanggal_dipilih' => $tanggalDipilih,
            'initial_balance' => InitialBalance::where('unit_id', $unit->id_units)->value('nominal') ?? 0,
            'pagination' => $laporanKeuangan['pagination']
        ]);
    }

    public function exportPDF($unitId)
    {
        $unit = Unit::findOrFail($unitId);

        // Pastikan user memiliki akses
        $user = Auth::user();
        if (!$user->units->contains('id_units', $unit->id_units)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini.');
        }

        $laporan = $this->getLaporanDataForExport($unit->id_units);

        $pdf = PDF::loadView('exports.laporan_pdf', [
            'laporan' => $laporan,
            'unitName' => $unit->unit_name,
        ]);

        return $pdf->download("laporan_keuangan_{$unit->unit_name}.pdf");
    }

    public function exportExcel($unitId)
    {
        $unit = Unit::findOrFail($unitId);

        // Pastikan user memiliki akses
        $user = Auth::user();
        if (!$user->units->contains('id_units', $unit->id_units)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini.');
        }

        $laporan = $this->getLaporanDataForExport($unit->id_units);

        return Excel::download(
            new LaporanExport($laporan),
            "laporan_keuangan_{$unit->unit_name}.xlsx"
        );
    }

    /**
     * Cek apakah unit memiliki data BalanceHistory
     */
    private function hasBalanceHistory($unitId)
    {
        return BalanceHistory::where('unit_id', $unitId)->exists();
    }

    /**
     * Ambil laporan dari BalanceHistory (jika ada)
     */
    private function getLaporanFromBalanceHistory($unitId, $tanggalDipilih, $page, $perPage)
    {
        $historiesQuery = BalanceHistory::where('unit_id', $unitId)
            ->when($tanggalDipilih, function ($query) use ($tanggalDipilih) {
                $query->whereDate('updated_at', $tanggalDipilih);
            })
            ->orderByDesc('updated_at');

        $histories = $historiesQuery->paginate($perPage, ['*'], 'page', $page);

        $laporanKeuangan = $histories->getCollection()->map(function ($item) {
            $description = $this->getTransactionDescription($item);

            return [
                'tanggal' => optional($item->updated_at)->format('Y-m-d'),
                'keterangan' => $description,
                'jenis' => $item->jenis,
                'selisih' => $item->jenis === 'Pendapatan'
                    ? $item->saldo_sekarang - $item->saldo_sebelum
                    : $item->saldo_sebelum - $item->saldo_sekarang,
                'saldo' => $item->saldo_sekarang,
            ];
        });

        return [
            'data' => $laporanKeuangan,
            'pagination' => [
                'total' => $histories->total(),
                'per_page' => $histories->perPage(),
                'current_page' => $histories->currentPage(),
                'last_page' => $histories->lastPage(),
            ]
        ];
    }

    /**
     * Ambil laporan manual dari Income dan Expense (jika tidak ada BalanceHistory)
     */
    private function getLaporanManual($unitId, $tanggalDipilih, $page, $perPage)
    {
        // Ambil data income
        $incomesQuery = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->where('id_units', $unitId);
        })
            ->when($tanggalDipilih, function ($query) use ($tanggalDipilih) {
                $query->whereDate('created_at', $tanggalDipilih);
            })
            ->with(['rent']);

        // Ambil data expense
        $expensesQuery = Expense::where('unit_id', $unitId)
            ->when($tanggalDipilih, function ($query) use ($tanggalDipilih) {
                $query->whereDate('created_at', $tanggalDipilih);
            });

        // Gabungkan queries menggunakan Union (lebih efisien untuk pagination)
        $incomes = $incomesQuery->get()->map(function ($item) {
            return [
                'tanggal' => optional($item->created_at)->format('Y-m-d'),
                'keterangan' => $item->rent->description ?? 'Pemasukan',
                'jenis' => 'Pendapatan',
                'nominal' => (int) ($item->rent->total_bayar ?? 0),
                'created_at' => $item->created_at,
            ];
        });

        $expenses = $expensesQuery->get()->map(function ($item) {
            return [
                'tanggal' => optional($item->created_at)->format('Y-m-d'),
                'keterangan' => $item->description ?? 'Pengeluaran',
                'jenis' => 'Pengeluaran',
                'nominal' => (int) $item->nominal,
                'created_at' => $item->created_at,
            ];
        });

        // Gabungkan dan urutkan
        $merged = $incomes->concat($expenses)
            ->sortByDesc('created_at')
            ->values();

        // Hitung saldo berjalan
        $initialBalance = InitialBalance::where('unit_id', $unitId)->value('nominal') ?? 0;
        $saldo = $initialBalance;

        $finalLaporan = $merged->map(function ($item) use (&$saldo) {
            $selisih = $item['jenis'] === 'Pendapatan' ? $item['nominal'] : -$item['nominal'];
            $saldo += $selisih;

            return [
                'tanggal' => $item['tanggal'],
                'keterangan' => $item['keterangan'],
                'jenis' => $item['jenis'],
                'selisih' => $selisih,
                'saldo' => $saldo,
            ];
        });

        // Manual pagination
        $total = $finalLaporan->count();
        $paged = $finalLaporan->forPage($page, $perPage)->values();

        return [
            'data' => $paged,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => ceil($total / $perPage),
            ]
        ];
    }

    /**
     * Method untuk mendapatkan description transaksi dari BalanceHistory
     */
    private function getTransactionDescription($balanceHistory)
    {
        $tanggalAwal = Carbon::parse($balanceHistory->updated_at)->startOfDay();
        $tanggalAkhir = Carbon::parse($balanceHistory->updated_at)->endOfDay();

        if ($balanceHistory->jenis === 'Pendapatan') {
            $income = Income::whereHas('rent.tarif.unit', function ($q) use ($balanceHistory) {
                $q->where('id_units', $balanceHistory->unit_id);
            })
                ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                ->with(['rent' => function($query) {
                    $query->select('id_rent', 'description', 'total_bayar');
                }])
                ->orderBy('updated_at', 'desc')
                ->first();

            if ($income && $income->rent) {
                return $income->rent->description ?? 'Pemasukan dari sewa';
            }

            // Fallback: cari rent transaction
            $rent = RentTransaction::whereHas('tarif.unit', function ($q) use ($balanceHistory) {
                $q->where('id_units', $balanceHistory->unit_id);
            })
                ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                ->orderBy('updated_at', 'desc')
                ->first();

            return $rent ? ($rent->description ?? 'Pemasukan dari sewa') : 'Pemasukan';
        }

        if ($balanceHistory->jenis === 'Pengeluaran') {
            $expense = Expense::where('unit_id', $balanceHistory->unit_id)
                ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                ->orderBy('updated_at', 'desc')
                ->first();

            return $expense ? ($expense->description ?? 'Pengeluaran operasional') : 'Pengeluaran';
        }

        return '-';
    }

    /**
     * Method untuk export (mengambil semua data)
     */
    private function getLaporanDataForExport($unitId)
    {
        if ($this->hasBalanceHistory($unitId)) {
            // Gunakan BalanceHistory
            $histories = BalanceHistory::where('unit_id', $unitId)
                ->orderByDesc('updated_at')
                ->get();

            return $histories->map(function ($item) {
                $description = $this->getTransactionDescription($item);

                return [
                    'tanggal' => optional($item->updated_at)->format('Y-m-d'),
                    'keterangan' => $description,
                    'jenis' => $item->jenis,
                    'selisih' => $item->jenis === 'Pendapatan'
                        ? $item->saldo_sekarang - $item->saldo_sebelum
                        : $item->saldo_sebelum - $item->saldo_sekarang,
                    'saldo' => $item->saldo_sekarang,
                ];
            });
        } else {
            // Gunakan data manual
            return $this->getLaporanManual($unitId, null, 1, 999999)['data'];
        }
    }
}