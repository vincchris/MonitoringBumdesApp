<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;
use App\Models\profileBumdes;
use App\Models\profileDesa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Ambil data logos dari database
        $desa = profileDesa::first();
        $bumdes = profileBumdes::first();

        return Inertia::render('home', [
            'logos' => [
                'logo_desa' => $desa?->logo_desa ? asset('storage/' . $desa->logo_desa) : null,
                'logo_bumdes' => $bumdes?->logo_bumdes ? asset('storage/' . $bumdes->logo_bumdes) : null,
            ]
        ]);
    }

    // Method lainnya juga perlu mengirim data logos
    public function about()
    {
        $desa = profileDesa::first();
        $bumdes = profileBumdes::first();

        return Inertia::render('AboutPage', [
            'logos' => [
                'logo_desa' => $desa?->logo_desa ? asset('storage/' . $desa->logo_desa) : null,
                'logo_bumdes' => $bumdes?->logo_bumdes ? asset('storage/' . $bumdes->logo_bumdes) : null,
            ]
        ]);
    }
}