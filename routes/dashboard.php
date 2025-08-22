<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\backend\MiniSoc\DashboardMiniSocController;
use App\Http\Controllers\backend\Buper\DashboardBuperController;
use App\Http\Controllers\backend\SewaKios\DashboardSewKiosController;
use App\Http\Controllers\backend\Airweslik\DashboardAirweslikController;
use App\Http\Controllers\backend\Internetdesa\DashboardInterDesaController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('unit/{unitId}')->name('unit.')->group(function () {
        Route::get('/dashboard', function ($unitId) {
            $user = Auth::user();
            $unit = $user->units()->where('id_units', $unitId)->first();

            if (!$unit) abort(403, 'Anda tidak memiliki akses ke unit ini.');

            return match ($unit->id_units) {
                1 => app(DashboardMiniSocController::class)->index($unitId),
                2 => app(DashboardBuperController::class)->index($unitId),
                3 => app(DashboardSewKiosController::class)->index($unitId),
                4 => app(DashboardAirweslikController::class)->index($unitId),
                5 => app(DashboardInterDesaController::class)->index($unitId),
                default => abort(404, 'Dashboard unit tidak ditemukan.'),
            };
        })->name('dashboard');
    });
});
