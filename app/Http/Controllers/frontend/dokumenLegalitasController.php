<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;
use App\Models\LegalitasBumdes;
use Illuminate\Http\Request;
use Inertia\Inertia;

class dokumenLegalitasController extends Controller
{
    public function index()
    {
        $dokumenLegalitas = LegalitasBumdes::all();

        return Inertia::render('Profil/legalitas', [
            'dokumenLegalitas' => $dokumenLegalitas,
        ]);
    }
}
