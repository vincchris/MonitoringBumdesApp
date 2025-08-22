<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;
use App\Models\Tarif;
use Inertia\Inertia;

class UnitUsahaPageController extends Controller
{
    public function index()
    {
        // Ambil semua tarif
        $tarifs = Tarif::all()
            ->groupBy('unit_id')
            ->map(function ($items) {
                return $items->map(function ($item) {
                    return [
                        'label' => $item->category_name,
                        'detail' => 'Rp' . number_format($item->harga_per_unit, 0, ',', '.') . ' / ' . $item->satuan,
                        'basePrice' => (int) $item->harga_per_unit,
                    ];
                });
            });

        return Inertia::render('UnitUsaha-page', [
            'tarifs' => $tarifs,
        ]);
    }
}
