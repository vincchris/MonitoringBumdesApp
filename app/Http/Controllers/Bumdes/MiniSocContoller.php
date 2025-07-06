<?php

namespace App\Http\Controllers\Bumdes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MiniSocContoller extends Controller
{
    public function index() {
        return Inertia::render('Bumdes/MiniSoc', [
            
        ]);
    }
}
