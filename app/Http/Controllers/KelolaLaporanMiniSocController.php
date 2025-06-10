<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class KelolaLaporanMiniSocController extends Controller
{
    public function index() {
        return Inertia::render("KelolaLaporanMiniSoc");
    }
}
