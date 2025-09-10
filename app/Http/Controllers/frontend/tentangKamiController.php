<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;
use App\Models\profileBumdes;
use App\Models\profileDesa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class tentangKamiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $desa = ProfileDesa::first();
        $bumdes = ProfileBumdes::where('desa_id', $desa->id ?? null)->first();

        return Inertia::render('Profil/TentangKami', [
            'desa'   => $desa,
            'bumdes' => $bumdes,
        ]);
    }
}
