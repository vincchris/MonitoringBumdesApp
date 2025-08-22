<?php

use Illuminate\Support\Facades\Route;

// Controller kepala desa
use App\Http\Controllers\kepala_desa\MiniSocController;
use App\Http\Controllers\kepala_desa\BuperController;
use App\Http\Controllers\kepala_desa\KiosController;

// Controller kepala bumdes
use App\Http\Controllers\kepala_bumdes\AirWeslikController;
use App\Http\Controllers\kepala_bumdes\InternetDesaController;

// Backend pemasukan & pengeluaran
use App\Http\Controllers\backend\MiniSoc\PemasukanMiniSocController;
use App\Http\Controllers\backend\MiniSoc\PengeluaranMiniSocController;
use App\Http\Controllers\backend\Buper\PemasukanBuperController;
use App\Http\Controllers\backend\Buper\PengeluaranBuperController;
use App\Http\Controllers\backend\SewaKios\PemasukanSewKiosController;
use App\Http\Controllers\backend\SewaKios\PengeluaranSewKiosController;
use App\Http\Controllers\backend\Airweslik\PemasukanAirweslikController;
use App\Http\Controllers\backend\Airweslik\PengeluaranAirweslikController;
use App\Http\Controllers\backend\Internetdesa\PemasukanInterdesaController;
use App\Http\Controllers\backend\Internetdesa\PengeluaranInterdesaController;

Route::middleware(['auth', 'verified'])->group(function () {
    // ================= MiniSoccer =================
    Route::resource('MiniSoccer', MiniSocController::class);
    Route::prefix('MiniSoccer')->name('minisoc.')->controller(MiniSocController::class)->group(function () {
        Route::get('/download-pdf/{bulan}', 'downloadPdfDetail')->name('downloadPdfDetail');
        Route::get('/download-excel/{bulan}', 'downloadExcelDetail')->name('downloadExcelDetail');
    });
    Route::prefix('unit/{unitId}/minisoc')->as('minisoc.')->controller(MiniSocController::class)->group(function () {
        Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');
        Route::post('/tarif', 'storeTarif')->name('storeTarif');
        Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
        Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');
        Route::get('/tarif', 'getTarif')->name('getTarif');
        Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
    });
    Route::resource('pemasukan-minisoc', PemasukanMiniSocController::class);
    Route::resource('pengeluaran-minisoc', PengeluaranMiniSocController::class);

    // ================= Buper =================
    Route::resource('Buper', BuperController::class);
    Route::prefix('unit/{unitId}/buper')->as('buper.')->controller(BuperController::class)->group(function () {
        Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');
        Route::post('/tarif', 'storeTarif')->name('storeTarif');
        Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
        Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');
        Route::get('/tarif', 'getTarif')->name('getTarif');
        Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
    });
    Route::resource('pemasukan-buper', PemasukanBuperController::class);
    Route::resource('pengeluaran-buper', PengeluaranBuperController::class);

    // ================= Kios =================
    Route::resource('Kios', KiosController::class);
    Route::prefix('unit/{unitId}/kios')->as('kios.')->controller(KiosController::class)->group(function () {
        Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');
        Route::post('/tarif', 'storeTarif')->name('storeTarif');
        Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
        Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');
        Route::get('/tarif', 'getTarif')->name('getTarif');
        Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
    });
    Route::resource('pemasukan-sewakios', PemasukanSewKiosController::class);
    Route::resource('pengeluaran-sewakios', PengeluaranSewKiosController::class);

    // ================= Air Weslik =================
    Route::resource('Airweslik', AirWeslikController::class);
    Route::prefix('unit/{unitId}/airweslik')->as('airweslik.')->controller(AirWeslikController::class)->group(function () {
        Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');
        Route::post('/tarif', 'storeTarif')->name('storeTarif');
        Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
        Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');
        Route::get('/tarif', 'getTarif')->name('getTarif');
        Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
    });
    Route::resource('pemasukan-airweslik', PemasukanAirweslikController::class);
    Route::resource('pengeluaran-airweslik', PengeluaranAirweslikController::class);

    // ================= Internet Desa =================
    Route::resource('InterDesa', InternetDesaController::class);
    Route::prefix('unit/{unitId}/interdesa')->as('interdesa.')->controller(InternetDesaController::class)->group(function () {
        Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');
        Route::post('/tarif', 'storeTarif')->name('storeTarif');
        Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
        Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');
        Route::get('/tarif', 'getTarif')->name('getTarif');
        Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
    });
    Route::resource('pemasukan-interdesa', PemasukanInterdesaController::class);
    Route::resource('pengeluaran-interdesa', PengeluaranInterdesaController::class);
});
