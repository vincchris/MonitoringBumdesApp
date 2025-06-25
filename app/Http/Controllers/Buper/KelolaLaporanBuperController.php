<?php

namespace App\Http\Controllers\Buper;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LaporanExport;
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

    public function index()
    {
        $user = auth()->user();
        $unit = $user->units()->first();

        if (!$unit) {
            abort(403, 'Anda tidak memiliki unit yang dapat diakses.');
        }

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

        $initialBalance = InitialBalance::where('unit_id', $unit->id_units)->value('nominal') ?? 0;

        // Hitung saldo kas
        $saldo = $initialBalance;
        $finalLaporan = $merged->map(function ($item) use ($saldo) {
            $selisih = $item['jenis'] === 'Pendapatan'
                ? $item['nominal']
                : -$item['nominal'];

            return [
                ...$item,
                'saldo' => number_format($saldo ?? 0, 0, '', ','),    // tetap pakai initialBalance saja
                'selisih' => $selisih,
            ];
        });


        return Inertia::render('Buper/KelolaLaporanBuper', [
            'auth' => [
                'user' => $user->only(['name', 'role', 'image']),
            ],
            'unit_id' => $unit->id_units,
            'laporanKeuangan' => $finalLaporan,
        ]);
    }
}
