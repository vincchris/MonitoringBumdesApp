<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pemasukan;

class PemasukanMiniSocController extends Controller
{
   public function index(Request $request, $unitId)
{
    $user = auth()->user();

    // Pastikan user punya akses ke unit ini
    if (!$user->units->contains('id_units', $unitId)) {
        abort(403, 'Anda tidak memiliki akses ke unit ini');
    }

    $data = Pemasukan::where('user_id', $user->id)
                     ->where('unit_id', $unitId)
                     ->orderBy('tanggal', 'desc')
                     ->get();

    return Inertia::render('PemasukanMiniSoc', [
        'auth' => [
            'user' => $user,
        ],
        'data' => $data,
        'unit_id' => $unitId,
    ]);
}

}
