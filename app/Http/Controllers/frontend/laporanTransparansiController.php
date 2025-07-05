<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;

use App\Models\BalanceHistory;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Inertia\Inertia;

class laporanTransparansiController extends Controller
{
    public function index()
    {
        // Ambil semua data balance_histories
        $histories = BalanceHistory::all();

        // Grup per bulan dan hitung pemasukan + pengeluaran per bulan
        $grafik = $histories
            ->groupBy(function ($item) {
                return Carbon::parse($item->created_at)->format('M');
            })
            ->map(function ($items) {
                $pemasukan = $items->where('jenis', 'Pendapatan')->sum(function ($item) {
                    return $item->saldo_sekarang === $item->saldo_sebelum
                        ? $item->saldo_sekarang
                        : ($item->jenis === 'Pendapatan'
                            ? $item->saldo_sekarang - $item->saldo_sebelum
                            : $item->saldo_sebelum - $item->saldo_sekarang);
                });

                $pengeluaran = $items->where('jenis', 'Pengeluaran')->sum(function ($item) {
                    return $item->saldo_sebelum - $item->saldo_sekarang;
                });

                return [
                    'bulan' => Carbon::parse($items->first()->created_at)->format('M'),
                    'pemasukan' => $pemasukan,
                    'pengeluaran' => $pengeluaran,
                    'pemasukan_formatted' => 'Rp' . number_format($pemasukan, 0, ',', '.'),
                    'pengeluaran_formatted' => 'Rp' . number_format($pengeluaran, 0, ',', '.'),
                ];
            })
            ->values(); // untuk reset index numerik

        // Hitung ringkasan keseluruhan
        $pemasukan = $histories->where('jenis', 'Pendapatan')->sum(function ($item) {
            return $item->saldo_sekarang - $item->saldo_sebelum;
        });

        $pengeluaran = $histories->where('jenis', 'Pengeluaran')->sum(function ($item) {
            return $item->saldo_sebelum - $item->saldo_sekarang;
        });

        $surplus = $pemasukan - $pengeluaran;
        $saldo_akhir = optional($histories->sortByDesc('created_at')->first())->saldo_sekarang ?? 0;

        return Inertia::render('laporanTransparansi', [
            'grafik' => $grafik,
            'ringkasan' => [
                'total_pemasukan' => $pemasukan,
                'total_pengeluaran' => $pengeluaran,
                'surplus' => $surplus,
                'saldo_akhir' => $saldo_akhir,
                'total_pemasukan_formatted' => 'Rp' . number_format($pemasukan, 0, ',', '.'),
                'total_pengeluaran_formatted' => 'Rp' . number_format($pengeluaran, 0, ',', '.'),
                'surplus_formatted' => 'Rp' . number_format($surplus, 0, ',', '.'),
                'saldo_akhir_formatted' => 'Rp' . number_format($saldo_akhir, 0, ',', '.'),
            ],
        ]);
    }


    public function download()
    {
        // Eager load relasi 'unit'
        $histories = BalanceHistory::with('unit')->orderBy('created_at', 'asc')->get();

        // Ringkasan total
        $pemasukan = $histories->where('jenis', 'Pendapatan')->sum(fn($item) => $item->saldo_sekarang - $item->saldo_sebelum);
        $pengeluaran = $histories->where('jenis', 'Pengeluaran')->sum(fn($item) => $item->saldo_sebelum - $item->saldo_sekarang);
        $surplus = $pemasukan - $pengeluaran;
        $saldo_akhir = optional($histories->sortByDesc('created_at')->first())->saldo_sekarang ?? 0;

        $ringkasan = [
            'total_pemasukan' => 'Rp' . number_format($pemasukan, 0, ',', '.'),
            'total_pengeluaran' => 'Rp' . number_format($pengeluaran, 0, ',', '.'),
            'surplus' => 'Rp' . number_format($surplus, 0, ',', '.'),
            'saldo_akhir' => 'Rp' . number_format($saldo_akhir, 0, ',', '.'),
        ];

        // Rincian berdasarkan unit usaha + transaksi + tanggal
        $rincian = $histories->groupBy(fn($item) => $item->unit->unit_name ?? 'Tidak Diketahui')
            ->map(function ($items, $nama_unit) {
                $pemasukan = $items->where('jenis', 'Pendapatan')->sum(fn($item) => $item->saldo_sekarang - $item->saldo_sebelum);
                $pengeluaran = $items->where('jenis', 'Pengeluaran')->sum(fn($item) => $item->saldo_sebelum - $item->saldo_sekarang);
                $selisih = $pemasukan - $pengeluaran;

                $transaksi = $items->map(function ($item) {
                    return [
                        'tanggal' => Carbon::parse($item->created_at)->translatedFormat('d F Y'),
                        'jenis' => $item->jenis,
                        'saldo_sebelum' => 'Rp' . number_format($item->saldo_sebelum, 0, ',', '.'),
                        'saldo_sekarang' => 'Rp' . number_format($item->saldo_sekarang, 0, ',', '.'),
                        'selisih' => 'Rp' . number_format(abs($item->saldo_sekarang - $item->saldo_sebelum), 0, ',', '.'),
                    ];
                });

                return [
                    'unit_usaha' => $nama_unit,
                    'pemasukan' => 'Rp' . number_format($pemasukan, 0, ',', '.'),
                    'pengeluaran' => 'Rp' . number_format($pengeluaran, 0, ',', '.'),
                    'selisih' => 'Rp' . number_format($selisih, 0, ',', '.'),
                    'transaksi' => $transaksi,
                ];
            })->values();

        $total_keseluruhan = [
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'surplus' => $surplus,
        ];

        // Kirim ke view PDF
        $pdf = Pdf::loadView('pdf.laporan-keuangan', compact('ringkasan', 'rincian', 'total_keseluruhan'));

        return $pdf->download('laporan-keuangan.pdf');
    }
}
