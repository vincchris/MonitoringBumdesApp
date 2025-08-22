<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\kepala_bumdes\DashboardKepalaBumdesController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard-kepalaBumdes', [DashboardKepalaBumdesController::class, 'index'])->name('dashboard.kepalaBumdes');
});
