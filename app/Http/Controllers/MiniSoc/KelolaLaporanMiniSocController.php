<?php

namespace App\Http\Controllers\MiniSoc;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelolaLaporanMiniSocController extends Controller
{
    public function index() {
        return Inertia::render("MiniSoc/KelolaLaporanMiniSoc");
    }
}
