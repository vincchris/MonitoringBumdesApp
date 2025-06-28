<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitUsahaPageController extends Controller
{
    public function index(){
        return Inertia::render('UnitUsaha-page');
    }
}
