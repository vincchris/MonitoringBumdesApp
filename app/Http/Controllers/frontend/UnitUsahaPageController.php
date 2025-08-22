<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Carbon\Carbon;
use Inertia\Inertia;

class UnitUsahaPageController extends Controller
{
    public function index()
    {
        $tarifs = Tarif::all()
            ->groupBy('unit_id')
            ->map(function ($items) {
                return $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'label' => $item->category_name,
                        'detail' => 'Rp' . number_format($item->harga_per_unit, 0, ',', '.') . ' / ' . $item->satuan,
                        'basePrice' => (int) $item->harga_per_unit,
                    ];
                });
            });

        $currentMonth = Carbon::now()->month;
        $currentYear  = Carbon::now()->year;

        $bookings = RentTransaction::with('tarif')
            ->whereHas('tarif', function ($q) {
                $q->whereIn('unit_id', [1, 2]); // hanya Mini Soccer & Buper
            })
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id_rent,
                    'tenant' => $item->pengguna ?? 'penyewa',
                    // 'tenant' => $item->tennat_name ?? 'penyewa',
                    'tarif_id' => $item->tarif_id,
                    'unit_id' => $item->tarif->unit_id,
                    'nominal' => $item->nominal ?? 0,
                    'total' => $item->total_bayar ?? 0,
                    'description' => $item->description ?? '-',
                    'created_at' => $item->created_at->format('Y-m-d H:i:s'),
                ];
            });


        return Inertia::render('UnitUsaha-page', [
            'tarifs' => $tarifs,
            'bookings' => $bookings,
        ]);
    }
}
