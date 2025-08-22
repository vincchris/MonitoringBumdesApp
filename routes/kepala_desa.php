<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\kepala_desa\UserController;
use App\Http\Controllers\kepala_desa\DashboardKepalaDesaController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard-KepalaDesa', [DashboardKepalaDesaController::class, 'index'])->name('dashboard.kepalaDesa');
    Route::post('/update-saldo-awal', [DashboardKepalaDesaController::class, 'updateSaldoAwal'])->name('saldo-awal.update');

    Route::get('user', [UserController::class, 'index']);
    Route::resource('/admin/users', UserController::class)->except(['create', 'edit']);
});
