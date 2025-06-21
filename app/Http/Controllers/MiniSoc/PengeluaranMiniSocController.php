<?php

namespace App\Http\Controllers\MiniSoc;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengeluaranMiniSocController extends Controller
{
    public function index() {
        return Inertia::render('MiniSoc/PengeluaranMiniSoc');
    }
}
