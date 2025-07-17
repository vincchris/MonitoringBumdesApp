<?php

namespace App\Http\Controllers\backend\Airweslik;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LaporanExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelolaLaporanAirweslikController extends Controller
{
    public function exportPDF($unitId)
    {
        $unit = Unit::findOrFail($unitId);
        $laporan = $this->getLaporanData();

        // Tambahkan perhitungan selisih (pendapatan = +, pengeluaran = -)
        $saldo = 0;
        $laporanDenganSelisih = $laporan->map(function ($item) use (&$saldo) {
            $selisih = $item['jenis'] === 'Pendapatan'
                ? $item['nominal']
                : -$item['nominal'];

            $saldo += $selisih;

            return [
                ...$item,
                'selisih' => $selisih,
                'saldo' => $saldo,
            ];
        });

        $pdf = PDF::loadView('exports.laporan_pdf',
        [
            'laporan' => $laporanDenganSelisih,
            'unitName' => $unit->unit_name,
        ]);

        return $pdf->download('laporan_keuangan.pdf');
    }

    public function exportExcel()
    {
        $laporan = $this->getLaporanData();
        return Excel::download(new LaporanExport($laporan), 'laporan_keuangan.xlsx');
    }

    // Refactor Data agar tidak duplikat
    private function getLaporanData()
    {
        $user = auth()->user();
        $unit = $user->units()->first();

        $incomes = Income::whereHas('rent.tarif.unit', function ($query) use ($unit) {
            $query->where('id_units', $unit->id_units);
        })
            ->with(['rent'])
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => optional($item->created_at)->format('Y-m-d'),
                    'keterangan' => $item->rent->tarif->category_name ?? 'Pemasukan',
                    'jenis' => 'Pendapatan',
                    'nominal' => (int) $item->rent->total_bayar ?? 0,
                ];
            });

        $expenses = Expense::where('unit_id', $unit->id_units)
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => optional($item->created_at)->format('Y-m-d'),
                    'keterangan' => $item->description ?? 'Pengeluaran',
                    'jenis' => 'Pengeluaran',
                    'nominal' => (int) $item->nominal,
                ];
            });

        $merged = $incomes->concat($expenses)->sortByDesc('tanggal')->values();

        $saldo = 0;
        $finalLaporan = $merged->map(function ($item) use (&$saldo) {
            $saldo += $item['jenis'] === 'Pendapatan' ? $item['nominal'] : -$item['nominal'];
            return [
                ...$item,
                'saldo' => $saldo,
            ];
        });

        return $finalLaporan;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $unit = $user->units()->first();

        if (!$unit) {
            abort(403, 'Anda tidak memiliki unit yang dapat diakses.');
        }

        $tanggalDipilih = $request->get('tanggal');

        // Ambil histori saldo berdasarkan unit
        $histories = BalanceHistory::where('unit_id', $unit->id_units)
            ->when($tanggalDipilih, function ($query) use ($tanggalDipilih) {
                $query->whereDate('updated_at', $tanggalDipilih);
            })
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($item) {
                $tanggalAwal = Carbon::parse($item->updated_at)->startOfDay();
                $tanggalAkhir = Carbon::parse($item->updated_at)->endOfDay();

                $description = '-';

                if ($item->jenis === 'Pendapatan') {
                    // Cari income berdasarkan tanggal dan unit
                    $income = Income::whereHas('rent.tarif.unit', function ($q) use ($item) {
                        $q->where('id_units', $item->unit_id);
                    })
                        ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                        ->with(['rent' => function ($query) {
                            $query->select('id_rent', 'tenant_name', 'total_bayar');
                        }])
                        ->orderBy('updated_at', 'desc')
                        ->first();

                    if ($income && $income->rent) {
                        $description = $income->rent->tenant_name ?? 'Pemasukan dari sewa';
                    } else {
                        $rent = RentTransaction::whereHas('tarif.unit', function ($q) use ($item) {
                            $q->where('id_units', $item->unit_id);
                        })
                            ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                            ->orderBy('updated_at', 'desc')
                            ->first();

                        $description = $rent ? ($rent->description ?? 'Pemasukan dari sewa') : 'Pemasukan';
                    }
                }

                if ($item->jenis === 'Pengeluaran') {
                    $expense = Expense::where('unit_id', $item->unit_id)
                        ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                        ->orderBy('updated_at', 'desc')
                        ->first();

                    $description = $expense ? ($expense->description ?? 'Pengeluaran operasional') : 'Pengeluaran';
                }

                return [
                    'tanggal' => optional($item->updated_at)->format('Y-m-d'),
                    'keterangan' => $description,
                    'jenis' => $item->jenis,
                    'selisih' => $item->jenis === 'Pendapatan'
                        ? $item->saldo_sekarang - $item->saldo_sebelum
                        : $item->saldo_sebelum - $item->saldo_sekarang,
                    'saldo' => number_format($item->saldo_sekarang, 0, '', ','),
                    'updated_at' => $item->updated_at,
                ];
            });

        // Pagination manual
        $page = $request->get('page', 1);
        $perPage = 10;
        $paged = $histories->forPage($page, $perPage)->values();
        $totalItems = $histories->count();

        return Inertia::render('Airweslik/KelolaLaporanAirweslik', [
            'auth' => [
                'user' => $user->only(['name', 'role', 'image']),
            ],
            'unit_id' => $unit->id_units,
            'laporanKeuangan' => $paged,
            'tanggal_dipilih' => $tanggalDipilih,
            'initial_balance' => InitialBalance::where('unit_id', $unit->id_units)->value('nominal') ?? 0,
            'pagination' => [
                'total' => $totalItems,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => ceil($totalItems / $perPage),
            ]
        ]);
    }
}
