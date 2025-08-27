<?php

use App\Http\Controllers\admin\dashboardAdminController;
use App\Http\Controllers\admin\dataUmumController;
use App\Http\Controllers\admin\sekretariatController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard-admin', [dashboardAdminController::class, 'index'])->name('dashboard.admin');
    Route::prefix('profil')->group(function () {
        Route::resource('data-umum', DataUmumController::class);
        Route::resource('sekretariat', sekretariatController::class);
    });
});
