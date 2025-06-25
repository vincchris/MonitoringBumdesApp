<?php

namespace App\Http\Controllers\Buper;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LaporanExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelolaLaporanBuperController extends Controller
{
    public function exportPDF()
    {
        $laporan = $this->getLaporanData();
        $pdf = PDF::loadView('exports.laporan_pdf', ['laporan' => $laporan]);

        return $pdf->download('laporan_keuangan.pdf');
    }

    public function exportExcel()
    {
        $laporan = $this->getLaporanData();
        return Excel::download(new LaporanExport($laporan), 'laporan_keuangan.xlsx');
    }

    // Refcator Data agar tidak duplikat
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
                    'keterangan' => $item->rent->tenant_name ?? 'Pemasukan',
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

        $merged = $incomes->concat($expenses)->sortBy('tanggal')->values();

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

        // Ambil histori saldo berdasarkan unit (Still bug)

        $histories = BalanceHistory::where('unit_id', $unit->id_units)
            ->when($tanggalDipilih, function ($query) use ($tanggalDipilih) {
                $query->whereDate('created_at', $tanggalDipilih);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($item) {
                $tanggalAwal = Carbon::parse($item->created_at)->startOfDay();
                $tanggalAkhir = Carbon::parse($item->created_at)->endOfDay();

                $description = '-';

                if ($item->jenis === 'Pendapatan') {
                    $income = Income::whereHas('rent.tarif.unit', function ($q) use ($item) {
                        $q->where('id_units', $item->unit_id);
                    })
                        ->whereBetween('created_at', [$tanggalAwal, $tanggalAkhir])
                        ->with('rent')
                        ->latest('created_at')
                        ->first();

                    $description = $income?->rent?->tenant_name ?? 'Pemasukan';
                } elseif ($item->jenis === 'Pengeluaran') {
                    $expense = Expense::where('unit_id', $item->unit_id)
                        ->whereBetween('created_at', [$tanggalAwal, $tanggalAkhir])
                        ->latest('created_at')
                        ->first();

                    $description = $expense?->description ?? 'Pengeluaran';
                }

                return [
                    'tanggal' => optional($item->created_at)->format('Y-m-d'),
                    'keterangan' => $description,
                    'jenis' => $item->jenis,
                    'selisih' => $item->jenis === 'Pendapatan'
                        ? $item->saldo_sekarang - $item->saldo_sebelum
                        : $item->saldo_sebelum - $item->saldo_sekarang,
                    'saldo' => number_format($item->saldo_sekarang, 0, '', ','),
                    'created_at' => $item->created_at,
                ];
            });

        // Pagination manual
        $page = $request->get('page', 1);
        $perPage = 10;
        $paged = $histories->forPage($page, $perPage)->values();
        $totalItems = $histories->count();

        return Inertia::render('Buper/KelolaLaporanBuper', [
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
