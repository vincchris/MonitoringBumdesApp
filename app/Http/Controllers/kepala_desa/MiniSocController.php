<?php

namespace App\Http\Controllers\kepala_desa;

use App\Http\Controllers\Controller;
use App\Models\{BalanceHistory, Expense, Income, InitialBalance, RentTransaction, Unit};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Cache, DB};
use Inertia\Inertia;
use App\Models\Tarif;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\DetailLaporanExport;
use Illuminate\Support\Facades\Log;



class MiniSocController extends Controller
{
    use AuthorizesRequests;
    private const UNIT_ID = 1;
    private const CACHE_TTL = 3600;
    private const DEFAULT_PER_PAGE = 10;

    public function index(Request $request)
    {
        $unitId = self::UNIT_ID;
        $unit = Unit::findOrFail($unitId);
        $histories = $this->getRingkasanLaporanBulanan($unitId);
        $tarif = $this->getCurrentTarif($unitId);
        $allTarifs = $this->getAllTarifs($unitId);
        $currentMonthSummary = $this->getCurrentMonthSummary($unitId);

        $page = (int) $request->get('page', 1);
        $perPage = self::DEFAULT_PER_PAGE;
        $paged = $histories->forPage($page, $perPage)->values();

        return Inertia::render('kepala_desa/MiniSoccer', [
            // PERBAIKAN: Pastikan struktur data sesuai dengan yang diharapkan AppSidebarLayout
            'auth' => [
                'user' => [
                    'name' => Auth::user()->name,
                    'roles' => Auth::user()->role ?? 'kepala_desa', 
                    'image' => Auth::user()->image,
                ],
            ],
            'unit_id' => $unitId, // TAMBAHAN: Kirim unit_id
            'laporanKeuangan' => $paged,
            'initial_balance' => $this->getInitialBalance($unitId),
            'tanggal_diubah' => $this->getInitialBalanceTanggal($unitId),
            'currentMonthSummary' => $currentMonthSummary,
            'tarif' => $tarif,
            'allTarifs' => $allTarifs,
            'unit' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type,
            ],
            'pagination' => [
                'total' => $histories->count(),
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($histories->count() / $perPage),
            ]
        ]);
    }
    public function downloadPdfDetail($bulan)
    {
        try {
            $unitId = self::UNIT_ID;

            // Validasi dan parsing parameter bulan
            $year = null;
            $month = null;

            if (strpos($bulan, '-') !== false) {
                // Format: YYYY-MM
                [$year, $month] = explode('-', $bulan);
            } elseif (strlen($bulan) === 6 && is_numeric($bulan)) {
                // Format: YYYYMM
                $year = substr($bulan, 0, 4);
                $month = substr($bulan, 4, 2);
            } else {
                // Coba parse sebagai string bulan
                try {
                    $date = Carbon::parse($bulan);
                    $year = $date->year;
                    $month = $date->month;
                } catch (\Exception $e) {
                    return back()->withErrors(['error' => 'Format bulan tidak valid: ' . $bulan]);
                }
            }

            // Validasi year dan month
            if (!$year || !$month || !is_numeric($year) || !is_numeric($month)) {
                return back()->withErrors(['error' => 'Parameter bulan tidak valid']);
            }

            // Pastikan month dalam format 2 digit
            $month = str_pad($month, 2, '0', STR_PAD_LEFT);

            $unit = Unit::findOrFail($unitId);
            $histories = $this->getDetailLaporan($unitId, $year, $month);

            // Debugging: Log data yang akan digunakan
            Log::info('PDF Data Debug', [
                'unitId' => $unitId,
                'year' => $year,
                'month' => $month,
                'histories_count' => $histories->count(),
                'unit' => $unit->toArray()
            ]);

            $summary = [
                'totalPendapatan' => $histories->where('jenis', 'Pendapatan')->sum('selisih'),
                'totalPengeluaran' => $histories->where('jenis', 'Pengeluaran')->sum('selisih'),
                'selisih' => $histories->where('jenis', 'Pendapatan')->sum('selisih')
                    - $histories->where('jenis', 'Pengeluaran')->sum('selisih'),
                'jumlahTransaksi' => $histories->count(),
            ];

            $data = [
                'detailLaporan' => $histories->sortByDesc('updated_at')->values(),
                'bulan' => Carbon::createFromDate($year, $month, 1)->translatedFormat('F Y'),
                'unit' => $unit,
                'summary' => $summary,
                'generated_at' => now()->translatedFormat('l, d F Y H:i') . ' WIB',
                'generated_by' => Auth::user()->name,
            ];

            // Debugging: Log data sebelum generate PDF
            Log::info('PDF Generation Data', [
                'bulan' => $data['bulan'],
                'summary' => $summary,
                'laporan_count' => $data['detailLaporan']->count()
            ]);

            // Pastikan view ada dan dapat diakses
            if (!view()->exists('exports.laporan_pdf')) {
                Log::error('PDF View not found: exports.laporan_pdf');
                return back()->withErrors(['error' => 'Template PDF tidak ditemukan']);
            }

            try {
                $pdf = PDF::loadView('exports.laporan_pdf', $data);
                $pdf->setPaper('A4', 'landscape');

                // Set timeout untuk PDF generation
                $pdf->setTimeout(300);

                $filename = "Detail-Transaksi-Mini-Soccer-{$year}-{$month}.pdf";

                // Log sebelum download
                Log::info('PDF Download attempt', ['filename' => $filename]);

                // Gunakan stream untuk debugging
                // return $pdf->stream($filename); // Untuk test di browser

                // Untuk download langsung
                return $pdf->download($filename);
            } catch (\Exception $pdfError) {
                Log::error('PDF Generation Error', [
                    'error' => $pdfError->getMessage(),
                    'trace' => $pdfError->getTraceAsString()
                ]);
                return back()->withErrors(['error' => 'Gagal generate PDF: ' . $pdfError->getMessage()]);
            }
        } catch (\Exception $e) {
            Log::error('Error downloading PDF: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'bulan' => $bulan
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan saat mendownload PDF: ' . $e->getMessage()]);
        }
    }

    public function downloadExcelDetail($bulan)
    {
        try {
            $unitId = self::UNIT_ID;

            // Validasi dan parsing parameter bulan (sama seperti PDF)
            $year = null;
            $month = null;

            if (strpos($bulan, '-') !== false) {
                // Format: YYYY-MM
                [$year, $month] = explode('-', $bulan);
            } elseif (strlen($bulan) === 6 && is_numeric($bulan)) {
                // Format: YYYYMM
                $year = substr($bulan, 0, 4);
                $month = substr($bulan, 4, 2);
            } else {
                // Coba parse sebagai string bulan
                try {
                    $date = Carbon::parse($bulan);
                    $year = $date->year;
                    $month = $date->month;
                } catch (\Exception $e) {
                    return back()->withErrors(['error' => 'Format bulan tidak valid: ' . $bulan]);
                }
            }

            // Validasi year dan month
            if (!$year || !$month || !is_numeric($year) || !is_numeric($month)) {
                return back()->withErrors(['error' => 'Parameter bulan tidak valid']);
            }

            $filename = "Detail-Transaksi-Mini-Soccer-{$year}-{$month}.xlsx";

            return Excel::download(new DetailLaporanExport($unitId, $year, $month), $filename);
        } catch (\Exception $e) {
            Log::error('Error downloading Excel: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat mendownload Excel']);
        }
    }

    public function storeInitialBalance(Request $request, $unitID)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'nominal' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitID) {
            InitialBalance::updateOrCreate(
                ['unit_id' => $unitID],
                ['nominal' => $validated['nominal']]
            );

            Cache::forget("initial_balance_{$unitID}");
        });

        return back()->with('info', [
            'message' => 'Saldo awal berhasil diubah',
            'method' => 'create'
        ]);
    }

    public function show($bulan)
    {
        $unitId = self::UNIT_ID;
        [$year, $month] = explode('-', $bulan);
        $unit = Unit::findOrFail($unitId);
        $histories = $this->getDetailLaporan($unitId, $year, $month);

        $summary = [
            'totalPendapatan' => $histories->where('jenis', 'Pendapatan')->sum('selisih'),
            'totalPengeluaran' => $histories->where('jenis', 'Pengeluaran')->sum('selisih'),
            'selisih' => $histories->where('jenis', 'Pendapatan')->sum('selisih')
                - $histories->where('jenis', 'Pengeluaran')->sum('selisih'),
            'jumlahTransaksi' => $histories->count(),
        ];

        return Inertia::render('kepala_desa/DetailLaporan', [
            'auth' => [
                'user' => Auth::user()->only(['name', 'roles', 'image']),
            ],
            'bulan' => Carbon::createFromDate($year, $month, 1)->translatedFormat('F Y'),
            'unit' => [
                'id' => $unit->id_units,
                'name' => $unit->unit_name,
            ],
            'detailLaporan' => $histories->sortByDesc('updated_at')->values(),
            'summary' => $summary,
        ]);
    }

    private function getInitialBalance(int $unitId): int
    {
        return Cache::remember("initial_balance_{$unitId}", self::CACHE_TTL, function () use ($unitId) {
            return InitialBalance::where('unit_id', $unitId)->value('nominal') ?? 0;
        });
    }

    private function getInitialBalanceTanggal(int $unitId): ?string
    {
        return optional(
            InitialBalance::where('unit_id', $unitId)->value('updated_at')
        )?->format('Y-m-d H:i');
    }

    private function getDetailLaporan(int $unitId, string $year, string $month)
    {
        $histories = BalanceHistory::where('unit_id', $unitId)
            ->whereYear('updated_at', $year)
            ->whereMonth('updated_at', $month)
            ->orderByDesc('updated_at')
            ->get();

        return $histories->map(function ($item) use ($unitId) {
            return [
                'id' => $item->id,
                'tanggal' => $item->updated_at->translatedFormat('d F Y'),
                'tanggal_raw' => $item->updated_at->format('Y-m-d'),
                'keterangan' => $this->getTransactionDescription($item, $unitId),
                'jenis' => $item->jenis,
                'selisih' => $this->calculateSelisih($item),
                'saldo' => number_format($item->saldo_sekarang, 0, '', ','),
                'updated_at' => $item->updated_at,
            ];
        });
    }

    private function getRingkasanLaporanBulanan(int $unitId)
    {
        $currentMonth = now()->format('Y-m');

        return BalanceHistory::where('unit_id', $unitId)
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy(fn($item) => $item->updated_at->format('Y-m'))
            ->map(function ($items, $month) use ($unitId, $currentMonth) {
                $totalPendapatan = $items->where('jenis', 'Pendapatan')->sum(fn($item) => $this->calculateSelisih($item));
                $totalPengeluaran = $items->where('jenis', 'Pengeluaran')->sum(fn($item) => $this->calculateSelisih($item));
                $jumlahTransaksi = $items->count();

                // Ambil transaksi terakhir untuk referensi tanggal
                $lastTransaction = $items->sortByDesc('updated_at')->first();

                return [
                    'tanggal' => $lastTransaction->updated_at->translatedFormat('F Y'),
                    'keterangan' => "Ringkasan {$jumlahTransaksi} transaksi",
                    'jenis' => 'Ringkasan',
                    'selisih' => $totalPendapatan - $totalPengeluaran,
                    'saldo' => number_format($lastTransaction->saldo_sekarang, 0, '', ','),
                    'updated_at' => $lastTransaction->updated_at,
                    'bulan' => $month,
                    'is_current_month' => $month === $currentMonth,
                    'summary' => [
                        'totalPendapatan' => $totalPendapatan,
                        'totalPengeluaran' => $totalPengeluaran,
                        'jumlahTransaksi' => $jumlahTransaksi,
                    ]
                ];
            })->values();
    }

    private function getCurrentMonthSummary(int $unitId)
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $histories = BalanceHistory::where('unit_id', $unitId)
            ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
            ->get();

        $pendapatan = $histories->where('jenis', 'Pendapatan')->sum(function ($item) {
            return $this->calculateSelisih($item);
        });

        $pengeluaran = $histories->where('jenis', 'Pengeluaran')->sum(function ($item) {
            return $this->calculateSelisih($item);
        });

        return [
            'pendapatan' => $pendapatan,
            'pengeluaran' => $pengeluaran,
            'selisih' => $pendapatan - $pengeluaran,
            'last_updated' => $histories->max('updated_at')?->format('Y-m-d H:i:s')
        ];
    }

    private function getTransactionDescription($item, int $unitId): string
    {
        $tanggal = $item->updated_at->toDateString();
        $selisih = $this->calculateSelisih($item);

        if ($item->jenis === 'Pendapatan') {
            $tanggal = $item->updated_at->toDateString();
            $selisih = $this->calculateSelisih($item);

            $matchingRents = RentTransaction::with('tarif.unit')
                ->whereDate('updated_at', $tanggal)
                ->get()
                ->filter(function ($r) use ($unitId, $selisih) {
                    return optional($r->tarif?->unit)->id_units == $unitId &&
                        (int) $r->total_bayar === (int) $selisih;
                })
                ->sortBy('updated_at')
                ->values();

            $matchingHistories = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pendapatan')
                ->whereDate('updated_at', $tanggal)
                ->get()
                ->filter(fn($h) => $this->calculateSelisih($h) == $selisih)
                ->sortBy('updated_at')
                ->values();

            $index = $matchingHistories->search(fn($h) => $h->id == $item->id);

            if ($index !== false && isset($matchingRents[$index])) {
                // dd($matchingRents->pluck('description'));
                return $matchingRents[$index]->description ?? 'Pemasukan dari sewa';
            }

            return 'Pemasukan dari sewa';
        }

        if ($item->jenis === 'Pengeluaran') {
            $expenses = Expense::where('unit_id', $unitId)
                ->whereDate('updated_at', $tanggal)
                ->where('nominal', (int) $selisih)
                ->orderBy('updated_at')
                ->get()
                ->values();

            $matchingHistories = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pengeluaran')
                ->whereDate('updated_at', $tanggal)
                ->get()
                ->filter(fn($h) => $this->calculateSelisih($h) == $selisih)
                ->sortBy('updated_at')
                ->values();

            $index = $matchingHistories->search(fn($h) => $h->id == $item->id);

            if ($index !== false && isset($expenses[$index])) {
                return $expenses[$index]->description ?? 'Pengeluaran operasional';
            }

            return 'Pengeluaran operasional';
        }

        return '-';
    }


    private function calculateSelisih($item): int
    {
        return $item->jenis === 'Pendapatan'
            ? $item->saldo_sekarang - $item->saldo_sebelum
            : $item->saldo_sebelum - $item->saldo_sekarang;
    }

    public function storeTarif(Request $request, $unitID)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'category_name' => 'required|string|max:255',
            'harga_per_unit' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitID) {
            Tarif::create([
                'unit_id' => $unitID,
                'satuan' => 'jam',
                'category_name' => $validated['category_name'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'created_at' => $validated['tanggal'],
                'updated_at' => $validated['tanggal'],
            ]);

            Cache::forget("current_tarif_{$unitID}");
            Cache::forget("all_tarifs_{$unitID}");
        });

        return back()->with('info', [
            'message' => 'Tarif berhasil disimpan',
            'method' => 'create'
        ]);
    }

    public function updateTarif(Request $request, $unitID, $tarifID)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'category_name' => 'required|string',
            'harga_per_unit' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitID, $tarifID) {
            // Perbaikan: Gunakan id_tarif untuk find tarif yang spesifik
            $tarif = Tarif::where('unit_id', $unitID)
                ->where('id_tarif', $tarifID)
                ->firstOrFail();

            $tarif->update([
                'category_name' => $validated['category_name'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'berlaku_dari' => $validated['tanggal'],
                'updated_at' => now(),
            ]);

            Cache::forget("current_tarif_{$unitID}");
            Cache::forget("all_tarifs_{$unitID}");
        });

        return back()->with('info', [
            'message' => 'Tarif berhasil diperbarui',
            'method' => 'update'
        ]);
    }

    // Method baru untuk delete tarif
    public function deleteTarif(Request $request, $unitID, $tarifID)
    {
        try {
            DB::transaction(function () use ($unitID, $tarifID) {
                $tarif = Tarif::where('id_tarif', $tarifID)
                    ->where('unit_id', $unitID)
                    ->firstOrFail();

                $tarif->delete();

                // Clear cache
                Cache::forget("current_tarif_{$unitID}");
                Cache::forget("all_tarifs_{$unitID}");
            });

            return back()->with('info', [
                'message' => 'Tarif berhasil dihapus',
                'method' => 'delete'
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Gagal menghapus tarif: ' . $e->getMessage()
            ]);
        }
    }

    private function getCurrentTarif(int $unitId): ?array
    {
        return Cache::remember("current_tarif_{$unitId}", self::CACHE_TTL, function () use ($unitId) {
            $tarif = Tarif::where('unit_id', $unitId)
                ->orderByDesc('updated_at')
                ->first();

            if (!$tarif) {
                return null;
            }

            return [
                'id_tarif' => $tarif->id_tarif,
                'jenis_penyewa' => $tarif->category_name ?? $tarif->jenis_penyewa,
                'category_name' => $tarif->category_name ?? $tarif->jenis_penyewa,
                'harga_per_unit' => $tarif->harga_per_unit,
                'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
                'tanggal' => $tarif->berlaku_dari ? Carbon::parse($tarif->berlaku_dari)->format('Y-m-d') : $tarif->updated_at->format('Y-m-d'),
            ];
        });
    }

    private function getAllTarifs(int $unitId): array
    {
        return Cache::remember("all_tarifs_{$unitId}", self::CACHE_TTL, function () use ($unitId) {
            $tarifs = Tarif::where('unit_id', $unitId)
                ->orderByDesc('updated_at')
                ->get();

            return $tarifs->map(function ($tarif) {
                return [
                    'id_tarif' => $tarif->id_tarif,
                    'unit_id' => $tarif->unit_id,
                    'satuan' => $tarif->satuan ?? 'jam',
                    'category_name' => $tarif->category_name ?? $tarif->jenis_penyewa,
                    'harga_per_unit' => $tarif->harga_per_unit,
                    'created_at' => $tarif->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
                ];
            })->toArray();
        });
    }

    public function getTarif()
    {
        $this->authorize('member');

        $tarifs = $this->getAllTarifs(self::UNIT_ID);

        return response()->json($tarifs);
    }

    public function getAllTarifsAPI(Request $request)
    {
        $this->authorize('member');

        $unitId = $request->get('unit_id', self::UNIT_ID);
        $tarifs = $this->getAllTarifs($unitId);

        return response()->json([
            'data' => $tarifs,
            'meta' => [
                'total' => count($tarifs),
                'unit_id' => $unitId,
            ]
        ]);
    }

    public function updateTarifAPI(Request $request)
    {
        $this->authorize('member');

        $validated = $request->validate([
            'id_tarif' => 'required|exists:tarifs,id_tarif',
            'harga_per_unit' => 'required|numeric|min:0',
            'category_name' => 'required|string|in:Umum,Member',
        ]);

        $tarif = Tarif::where('id_tarif', $validated['id_tarif'])
            ->where('unit_id', self::UNIT_ID)
            ->where('category_name', $validated['category_name'])
            ->firstOrFail();

        $updateData = [
            'harga_per_unit' => $validated['harga_per_unit'],
        ];

        $tarif->update($updateData);

        Cache::forget("current_tarif_" . self::UNIT_ID);
        Cache::forget("all_tarifs_" . self::UNIT_ID);

        return response()->json([
            'message' => 'Tarif berhasil diperbarui',
            'data' => [
                'id_tarif' => $tarif->id_tarif,
                'unit_id' => $tarif->unit_id,
                'satuan' => $tarif->satuan,
                'category_name' => $tarif->category_name,
                'harga_per_unit' => $tarif->harga_per_unit,
                'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }
}
