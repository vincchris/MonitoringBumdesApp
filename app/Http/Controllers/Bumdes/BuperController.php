<?php

namespace App\Http\Controllers\Bumdes;

use App\Http\Controllers\Controller;
use App\Models\{BalanceHistory, Expense, Income, InitialBalance, RentTransaction, Unit};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Cache, DB};
use Inertia\Inertia;

class BuperController extends Controller
{
    private const UNIT_ID = 2;
    private const CACHE_TTL = 3600;
    private const DEFAULT_PER_PAGE = 10;

    public function index(Request $request)
    {
        $unitId = self::UNIT_ID;
        $unit = Unit::findOrFail($unitId);
        $histories = $this->getRingkasanLaporanBulanan($unitId);

        $page = (int) $request->get('page', 1);
        $perPage = self::DEFAULT_PER_PAGE;
        $paged = $histories->forPage($page, $perPage)->values();

        return Inertia::render('Bumdes/Buper', [
            'auth' => [
                'user' => Auth::user()->only(['name', 'role', 'image']),
            ],
            'laporanKeuangan' => $paged,
            'initial_balance' => $this->getInitialBalance($unitId),
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
}
