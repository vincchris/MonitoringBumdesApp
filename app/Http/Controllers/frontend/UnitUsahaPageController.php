<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class UnitUsahaPageController extends Controller
{
    public function index(){
        return Inertia::render('UnitUsaha-page');
    }
}
