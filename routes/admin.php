<?php

use App\Http\Controllers\admin\dashboardAdminController;
use App\Http\Controllers\admin\dataUmumController;
use App\Http\Controllers\admin\editAkunAdminController;
use App\Http\Controllers\admin\LegalitasBumdesController;
use App\Http\Controllers\admin\PengurusBumdesController;
use App\Http\Controllers\admin\sekretariatController;
use App\Http\Controllers\admin\tentangBumdesController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard-admin', [dashboardAdminController::class, 'index'])->name('dashboard.admin');
    Route::prefix('profil')->group(function () {
        Route::resource('data-umum', DataUmumController::class);
        Route::resource('sekretariat', sekretariatController::class);
        Route::resource('tentang', tentangBumdesController::class);
        Route::resource('pengurus-bumdes', PengurusBumdesController::class)->names([
            'index' => 'profil.pengurus-bumdes.index',
            'create' => 'profil.pengurus-bumdes.create',
            'store' => 'profil.pengurus-bumdes.store',
            'show' => 'profil.pengurus-bumdes.show',
            'edit' => 'profil.pengurus-bumdes.edit',
            'update' => 'profil.pengurus-bumdes.update',
            'destroy' => 'profil.pengurus-bumdes.destroy',
        ]);
        Route::resource('legalitas', LegalitasBumdesController::class);
    });

    Route::prefix('akun')->group(function () {
        Route::resource('edit', editAkunAdminController::class);
    });
});
