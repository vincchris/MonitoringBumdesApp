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

        $page = (int) $request->get('page', 1);
        $perPage = self::DEFAULT_PER_PAGE;
        $paged = $histories->forPage($page, $perPage)->values();

        return Inertia::render('Bumdes/MiniSoccer', [
            'auth' => [
                'user' => Auth::user()->only(['name', 'role', 'image']),
            ],
            'laporanKeuangan' => $paged,
            'initial_balance' => $this->getInitialBalance($unitId),
            'tanggal_diubah' => $this->getInitialBalanceTanggal($unitId),
            'tarif' => $tarif,
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
                'jenis_penyewa' => $validated['jenis_penyewa'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'berlaku_dari' => $validated['tanggal'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Hapus cache agar data terbaru bisa dimuat
            Cache::forget("current_tarif_{$unitID}");
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
            'jenis_penyewa' => 'required|string|max:255',
            'harga_per_unit' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $unitID, $tarifID) {
            $tarif = Tarif::where('id_tarif', $tarifID)
                ->where('unit_id', $unitID)
                ->firstOrFail();

            $tarif->update([
                'jenis_penyewa' => $validated['jenis_penyewa'],
                'harga_per_unit' => $validated['harga_per_unit'],
                'berlaku_dari' => $validated['tanggal'],
                'updated_at' => now(),
            ]);

            // Hapus cache agar data terbaru bisa dimuat
            Cache::forget("current_tarif_{$unitID}");
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
                'jenis_penyewa' => $tarif->jenis_penyewa,
                'harga_per_unit' => $tarif->harga_per_unit,
                'updated_at' => $tarif->updated_at->format('Y-m-d H:i:s'),
            ];
        });
    }

    public function getTarif()
    {
        $this->authorize('member'); // hanya role member

        $tarifs = Tarif::where('unit_id', self::UNIT_ID)->get();

        return response()->json($tarifs);
    }

    // Update tarif tertentu (method yang sudah ada, bisa tetap digunakan untuk API)
    public function updateTarifAPI(Request $request)
    {
        $this->authorize('member');

        $validated = $request->validate([
            'id_tarif' => 'required|exists:tarifs,id_tarif',
            'harga_per_unit' => 'required|numeric|min:0',
        ]);

        $tarif = Tarif::where('id_tarif', $validated['id_tarif'])
            ->where('unit_id', self::UNIT_ID)
            ->firstOrFail();

        $tarif->update([
            'harga_per_unit' => $validated['harga_per_unit'],
        ]);

        return response()->json(['message' => 'Tarif berhasil diperbarui']);
    }
}