<?php

namespace App\Http\Controllers\MiniSoc;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LaporanExport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelolaLaporanMiniSocController extends Controller
{
    public function exportPDF()
    {
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

        $pdf = PDF::loadView('exports.laporan_pdf', ['laporan' => $laporanDenganSelisih]);

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
                    'keterangan' => $item->rent->description ?? 'Pemasukan',
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

        // Ambil saldo awal terbaru dari initial_balances
        $initialBalance = InitialBalance::where('unit_id', $unit->id_units)->value('nominal') ?? 0;

        // Ambil data pemasukan
        $incomes = Income::whereHas('rent.tarif.unit', function ($query) use ($unit) {
            $query->where('id_units', $unit->id_units);
        })
            ->with('rent')
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => optional($item->created_at)->format('Y-m-d'),
                    'keterangan' => $item->rent->description ?? 'Pemasukan',
                    'jenis' => 'Pendapatan',
                    'nominal' => (int) $item->rent->total_bayar ?? 0,
                    'created_at' => $item->created_at,
                ];
            });

        // Ambil data pengeluaran
        $expenses = Expense::where('unit_id', $unit->id_units)
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => optional($item->created_at)->format('Y-m-d'),
                    'keterangan' => $item->description ?? 'Pengeluaran',
                    'jenis' => 'Pengeluaran',
                    'nominal' => (int) $item->nominal,
                    'created_at' => $item->created_at,
                ];
            });

        // Gabung dan urutkan berdasarkan waktu dibuat (ASC, agar saldo akurat)
        $merged = $incomes->concat($expenses)->sortBy('created_at')->values();

        $finalLaporan = collect();

        if ($tanggalDipilih) {
            // Filter transaksi di tanggal tertentu
            $laporanTanggal = $merged->filter(fn($item) => $item['tanggal'] === $tanggalDipilih);

            // Hitung saldo sebelumnya
            $saldoSebelumnya = $merged
                ->filter(fn($item) => $item['tanggal'] < $tanggalDipilih)
                ->reduce(function ($carry, $item) {
                    return $carry + ($item['jenis'] === 'Pendapatan' ? $item['nominal'] : -$item['nominal']);
                }, $initialBalance);

            $saldo = $saldoSebelumnya;

            $finalLaporan = $laporanTanggal->map(function ($item) {
                $selisih = $item['jenis'] === 'Pendapatan'
                    ? $item['nominal']
                    : -$item['nominal'];

                return [
                    ...$item,
                    'selisih' => $selisih,
                    'saldo' => $item['saldo'] ?? null, 
                ];
            });
        } else {
            // Hitung saldo penuh
            $saldo = $initialBalance;

            $finalLaporan = $merged->map(function ($item) use (&$saldo) {
                $selisih = $item['jenis'] === 'Pendapatan'
                    ? $item['nominal']
                    : -$item['nominal'];
                $saldo += $selisih;

                return [
                    ...$item,
                    'selisih' => $selisih,
                    'saldo' => number_format($saldo, 0, '', ','),
                ];
            });
        }

        // Urutkan tampilan berdasarkan yang terbaru (DESC), tapi saldo tetap benar
        $finalLaporan = $finalLaporan->sortByDesc(fn($item) => $item['created_at'])->values();

        // Pagination manual
        $page = $request->get('page', 1);
        $perPage = 10;
        $paged = $finalLaporan->forPage($page, $perPage)->values();
        $totalItems = $finalLaporan->count();

        return Inertia::render('MiniSoc/KelolaLaporanMiniSoc', [
            'auth' => [
                'user' => $user->only(['name', 'role', 'image']),
            ],
            'unit_id' => $unit->id_units,
            'laporanKeuangan' => $paged,
            'tanggal_dipilih' => $tanggalDipilih,
            'initial_balance' => $initialBalance,
            'pagination' => [
                'total' => $totalItems,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => ceil($totalItems / $perPage),
            ]
        ]);
    }
}
