<?php

namespace App\Http\Controllers\Bumdes;

use App\Http\Controllers\Controller;
use App\Models\{BalanceHistory, Expense, Income, InitialBalance, RentTransaction, Unit};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Cache, DB};
use Inertia\Inertia;
use App\Models\Tarif;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AirWeslikController extends Controller
{
    use AuthorizesRequests;
    private const UNIT_ID = 4;
    private const CACHE_TTL = 3600;
    private const DEFAULT_PER_PAGE = 10;

    public function index(Request $request)
    {
        $unitId = self::UNIT_ID;
        $unit = Unit::findOrFail($unitId);
        $histories = $this->getRingkasanLaporanBulanan($unitId);
        $tarif = $this->getCurrentTarif($unitId);
        $allTarifs = $this->getAllTarifs($unitId); // Tambahan untuk semua data tarif
        $currentMonthSummary = $this->getCurrentMonthSummary($unitId);

        $page = (int) $request->get('page', 1);
        $perPage = self::DEFAULT_PER_PAGE;
        $paged = $histories->forPage($page, $perPage)->values();

        return Inertia::render('Bumdes/Airweslik', [
            'auth' => [
                'user' => Auth::user()->only(['name', 'role', 'image']),
            ],
            'laporanKeuangan' => $paged,
            'initial_balance' => $this->getInitialBalance($unitId),
            'tanggal_diubah' => $this->getInitialBalanceTanggal($unitId),
            'currentMonthSummary' => $currentMonthSummary,
            'tarif' => $tarif,
            'allTarifs' => $allTarifs, // Data semua tarif untuk modal
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

            // Hapus cache agar data terbaru bisa dimuat
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

        return Inertia::render('Bumdes/DetailLaporan', [
            'auth' => [
                'user' => Auth::user()->only(['name', 'role', 'image']),
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
                'tanggal' => $item->updated_at->translatedFormat('d F Y'),
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
        return Cache::remember("ringkasan_laporan_{$unitId}", self::CACHE_TTL, function () use ($unitId) {
            $histories = BalanceHistory::where('unit_id', $unitId)
                ->orderByDesc('updated_at')
                ->get();

            return $histories->groupBy(fn($item) => $item->updated_at->format('Y-m'))
                ->map(function ($items) use ($unitId) {
                    $item = $items->sortByDesc('updated_at')->first();
                    return [
                        'tanggal' => $item->updated_at->translatedFormat('d F Y'),
                        'keterangan' => $this->getTransactionDescription($item, $unitId),
                        'jenis' => $item->jenis,
                        'selisih' => $this->calculateSelisih($item),
                        'saldo' => number_format($item->saldo_sekarang, 0, '', ','),
                        'updated_at' => $item->updated_at,
                        'bulan' => $item->updated_at->format('Y-m'),
                    ];
                })->values();
        });
    }

    private function getCurrentMonthSummary(int $unitId)
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $histories = BalanceHistory::where('unit_id', $unitId)
            ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
            ->get();

        $pendapatan = $histories->where('jenis', 'Pendapatan')->sum(function($item) {
            return $this->calculateSelisih($item);
        });

        $pengeluaran = $histories->where('jenis', 'Pengeluaran')->sum(function($item) {
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
        $tanggalAwal = $item->updated_at->copy()->startOfDay();
        $tanggalAkhir = $item->updated_at->copy()->endOfDay();

        if ($item->jenis === 'Pendapatan') {
            $income = Income::with(['rent.tarif.unit'])
                ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                ->get()
                ->filter(fn($i) => optional($i->rent?->tarif?->unit)->id_units == $unitId)
                ->sortByDesc('updated_at')
                ->first();

            return $income->rent->description ?? 'Pemasukan dari sewa';
        }

        if ($item->jenis === 'Pengeluaran') {
            return Expense::where('unit_id', $unitId)
                ->whereBetween('updated_at', [$tanggalAwal, $tanggalAkhir])
                ->orderByDesc('updated_at')
                ->value('description') ?? 'Pengeluaran operasional';
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
            'jenis_penyewa' => 'required|string|max:255',
            'harga_per_unit' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitID) {
            Tarif::create([
                'unit_id' => $unitID,
                'satuan' => 'jam', // Default satuan untuk mini soccer
                'category_name' => $validated['jenis_penyewa'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'berlaku_dari' => $validated['tanggal'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Hapus cache agar data terbaru bisa dimuat
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
            'category_name' => 'required|string|in:Umum,Member',
            'harga_per_unit' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitID, $tarifID) {
            $tarif = Tarif::where('unit_id', $unitID)
                ->where('category_name', $validated['category_name'])
                ->firstOrFail();


            $tarif->update([
                'category_name' => $validated['category_name'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'berlaku_dari' => $validated['tanggal'],
                'updated_at' => now(),
            ]);

            // Hapus cache agar data terbaru bisa dimuat
            Cache::forget("current_tarif_{$unitID}");
            Cache::forget("all_tarifs_{$unitID}");
        });

        return back()->with('info', [
            'message' => 'Tarif berhasil diperbarui',
            'method' => 'update'
        ]);
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
                'jenis_penyewa' => $tarif->category_name ?? $tarif->jenis_penyewa, // Fallback untuk kompabilitas
                'harga_per_unit' => $tarif->harga_per_unit,
                'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
            ];
        });
    }

    /**
     * Method baru untuk mengambil semua data tarif unit
     */
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
                    'satuan' => $tarif->satuan ?? 'jam', // Default ke 'jam' jika null
                    'category_name' => $tarif->category_name ?? $tarif->jenis_penyewa, // Fallback untuk kompabilitas
                    'harga_per_unit' => $tarif->harga_per_unit,
                    'created_at' => $tarif->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
                ];
            })->toArray();
        });
    }

    public function getTarif()
    {
        $this->authorize('member'); // hanya role member

        $tarifs = $this->getAllTarifs(self::UNIT_ID);

        return response()->json($tarifs);
    }

    /**
     * API endpoint untuk mengambil semua tarif (jika diperlukan untuk AJAX)
     */
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

    // Update tarif tertentu (method yang sudah ada, bisa tetap digunakan untuk API)
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

        // Clear cache
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


    /**
     * Method untuk menghapus tarif (jika diperlukan)
     */
    public function deleteTarif(Request $request, $unitID, $tarifID)
    {
        $this->authorize('member');

        DB::transaction(function () use ($unitID, $tarifID) {
            $tarif = Tarif::where('id_tarif', $tarifID)
                ->where('unit_id', $unitID)
                ->firstOrFail();

            $tarif->delete();

            // Hapus cache
            Cache::forget("current_tarif_{$unitID}");
            Cache::forget("all_tarifs_{$unitID}");
        });

        return back()->with('info', [
            'message' => 'Tarif berhasil dihapus',
            'method' => 'delete'
        ]);
    }
}
