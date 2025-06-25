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

        // Ambil tanggal dari query parameter (contoh: ?tanggal=2025-06-25)
        $tanggalDipilih = $request->get('tanggal');

        // Ambil saldo awal unit
        $initialBalance = InitialBalance::where('unit_id', $unit->id_units)->value('nominal') ?? 0;

        // Ambil pemasukan (Income)
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
                    'created_at' => optional($item->created_at)->format('Y-m-d'),
                ];
            });

        // Ambil pengeluaran (Expense)
        $expenses = Expense::where('unit_id', $unit->id_units)
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => optional($item->created_at)->format('Y-m-d'),
                    'keterangan' => $item->description ?? 'Pengeluaran',
                    'jenis' => 'Pengeluaran',
                    'nominal' => (int) $item->nominal,
                    'created_at' => optional($item->created_at)->format('Y-m-d'),
                ];
            });

        // Gabungkan pemasukan dan pengeluaran
        $merged = $incomes->concat($expenses)->sortByDesc('tanggal')->values();

        // Hitung saldo hanya pada tanggal yang dipilih (jika ada)
        $finalLaporan = collect();
        if ($tanggalDipilih) {
            $laporanTanggal = $merged->filter(fn($item) => $item['tanggal'] === $tanggalDipilih);

            // Hitung total pemasukan dan pengeluaran sebelum tanggal ini untuk mengetahui saldo awal harian
            $saldoSebelumnya = $merged
                ->filter(fn($item) => $item['tanggal'] < $tanggalDipilih)
                ->reduce(function ($carry, $item) {
                    return $carry + ($item['jenis'] === 'Pendapatan' ? $item['nominal'] : -$item['nominal']);
                }, $initialBalance);

            $saldo = $saldoSebelumnya;

            $finalLaporan = $laporanTanggal->map(function ($item) use (&$saldo) {
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
        } else {
            // Jika tidak memilih tanggal, tampilkan semua dengan saldo akumulatif penuh
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

        // Pagination
        $page = $request->get('page', 1);
        $perPage = 10;

        $paged = $finalLaporan->forPage($page, $perPage)->values();
        $totalItems = $finalLaporan->count();

        return Inertia::render('MiniSoc/KelolaLaporanMiniSoc', [
            'auth' => [
                'user' => $user->only(['name', 'role', 'image']),
            ],
            'unit_id' => $unit->id_units,
            'laporanKeuangan' => $finalLaporan,
            'tanggal_dipilih' => $tanggalDipilih,
            'pagination' => [
                'total' => $totalItems,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => ceil($totalItems / $perPage),
            ]
        ]);
    }
}
