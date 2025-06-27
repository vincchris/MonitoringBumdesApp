<?php

namespace App\Http\Controllers\Buper;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\Expense;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LaporanExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KelolaLaporanBuperController extends Controller
{
    public function exportPDF()
    {
        $laporan = $this->getLaporanData();

        // Tambahkan perhitungan selisih dan saldo untuk PDF
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

        return $pdf->download('laporan_keuangan_buper.pdf');
    }

    public function exportExcel()
    {
        $laporan = $this->getLaporanData();
        return Excel::download(new LaporanExport($laporan), 'laporan_keuangan_buper.xlsx');
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

        // Debug: Cek apakah ada data BalanceHistory
        $historyCount = BalanceHistory::where('unit_id', $unit->id_units)->count();
        Log::info('Buper Debug - History Count:', ['count' => $historyCount, 'unit_id' => $unit->id_units]);

        // Jika tidak ada data BalanceHistory, gunakan data langsung dari Income dan Expense
        if ($historyCount == 0) {
            Log::info('Buper Debug: No BalanceHistory found, using direct Income/Expense data');

            // Ambil data langsung dari Income dan Expense
            $incomes = Income::whereHas('rent.tarif.unit', function ($query) use ($unit) {
                $query->where('id_units', $unit->id_units);
            })
                ->with(['rent' => function($query) {
                    $query->select('id_rent', 'tenant_name', 'total_bayar', 'description');
                }])
                ->when($tanggalDipilih, function ($query) use ($tanggalDipilih) {
                    $query->whereDate('created_at', $tanggalDipilih);
                })
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($item) {
                    return [
                        'tanggal' => optional($item->created_at)->format('Y-m-d'),
                        'keterangan' => $item->rent->tenant_name ?? ($item->rent->description ?? 'Pemasukan'),
                        'jenis' => 'Pendapatan',
                        'selisih' => (int) $item->rent->total_bayar ?? 0,
                        'saldo' => 0, // Will be calculated below
                        'created_at' => $item->created_at,
                    ];
                });

            $expenses = Expense::where('unit_id', $unit->id_units)
                ->when($tanggalDipilih, function ($query) use ($tanggalDipilih) {
                    $query->whereDate('created_at', $tanggalDipilih);
                })
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($item) {
                    return [
                        'tanggal' => optional($item->created_at)->format('Y-m-d'),
                        'keterangan' => $item->description ?? 'Pengeluaran',
                        'jenis' => 'Pengeluaran',
                        'selisih' => -(int) $item->nominal,
                        'saldo' => 0, // Will be calculated below
                        'created_at' => $item->created_at,
                    ];
                });

            // Gabungkan dan hitung saldo
            $merged = $incomes->concat($expenses)->sortByDesc('created_at');

            // Get initial balance
            $initialBalance = InitialBalance::where('unit_id', $unit->id_units)->value('nominal') ?? 0;
            $saldo = $initialBalance;

            $histories = $merged->map(function ($item) use (&$saldo) {
                $saldo += $item['selisih'];
                return [
                    ...$item,
                    'saldo' => number_format($saldo, 0, '', ','),
                ];
            })->values();

        } else {
            // Gunakan BalanceHistory seperti sebelumnya (dengan perbaikan)
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
                            ->with(['rent' => function($query) {
                                $query->select('id_rent', 'tenant_name', 'total_bayar', 'description');
                            }])
                            ->orderBy('created_at', 'desc')
                            ->first();

                        if ($income && $income->rent) {
                            $description = $income->rent->tenant_name ?? ($income->rent->description ?? 'Pemasukan');
                        } else {
                            // Fallback: cari rent transaction langsung
                            $rent = RentTransaction::whereHas('tarif.unit', function ($q) use ($item) {
                                $q->where('id_units', $item->unit_id);
                            })
                                ->whereBetween('created_at', [$tanggalAwal, $tanggalAkhir])
                                ->orderBy('created_at', 'desc')
                                ->first();

                            $description = $rent ? ($rent->tenant_name ?? ($rent->description ?? 'Pemasukan')) : 'Pemasukan';
                        }

                        Log::info('Buper Income Description Debug:', [
                            'unit_id' => $item->unit_id,
                            'tanggal' => $item->created_at->format('Y-m-d H:i:s'),
                            'income_found' => $income ? 'Yes' : 'No',
                            'rent_data' => $income ? $income->rent : null,
                            'final_description' => $description,
                        ]);

                    } elseif ($item->jenis === 'Pengeluaran') {
                        $expense = Expense::where('unit_id', $item->unit_id)
                            ->whereBetween('created_at', [$tanggalAwal, $tanggalAkhir])
                            ->orderBy('created_at', 'desc')
                            ->first();

                        $description = $expense ? ($expense->description ?? 'Pengeluaran operasional') : 'Pengeluaran';

                        Log::info('Buper Expense Description Debug:', [
                            'unit_id' => $item->unit_id,
                            'tanggal' => $item->created_at->format('Y-m-d H:i:s'),
                            'expense_found' => $expense ? 'Yes' : 'No',
                            'final_description' => $description,
                        ]);
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
        }

        // Pagination manual
        $page = $request->get('page', 1);
        $perPage = 10;
        $paged = $histories->forPage($page, $perPage)->values();
        $totalItems = $histories->count();

        Log::info('Buper Debug - Final Data:', [
            'total_items' => $totalItems,
            'current_page' => $page,
            'sample_data' => $paged->take(2)->toArray()
        ]);

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