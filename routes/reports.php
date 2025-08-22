<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\backend\MiniSoc\KelolaLaporanMiniSocController;
use App\Http\Controllers\backend\Buper\KelolaLaporanBuperController;
use App\Http\Controllers\backend\SewaKios\KelolaLaporanSewKiosController;
use App\Http\Controllers\backend\Airweslik\KelolaLaporanAirweslikController;
use App\Http\Controllers\backend\Internetdesa\KelolaLaporanInterdesaController;

Route::middleware(['auth', 'verified'])->group(function () {
    $laporanUnits = [
        'minisoc'   => KelolaLaporanMiniSocController::class,
        'buper'     => KelolaLaporanBuperController::class,
        'sewakios'  => KelolaLaporanSewKiosController::class,
        'airweslik' => KelolaLaporanAirweslikController::class,
        'interdesa' => KelolaLaporanInterdesaController::class,
    ];

    foreach ($laporanUnits as $key => $controller) {
        Route::prefix("kelolalaporan-{$key}")->name("laporan.{$key}.")->group(function () use ($controller) {
            Route::get('/', [$controller, 'index'])->name('kelola');
            Route::get('/export-pdf', [$controller, 'exportPDF'])->name('export.pdf');
            Route::get('/export-excel', [$controller, 'exportExcel'])->name('export.excel');
        });
    }
});
