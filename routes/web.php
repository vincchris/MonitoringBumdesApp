<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\MiniSoc\KelolaLaporanMiniSocController;
use App\Http\Controllers\Buper\KelolaLaporanBuperController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\MiniSoc\PemasukanMiniSocController;
use App\Http\Controllers\Buper\PemasukanBuperController;
use App\Http\Controllers\Buper\PengeluaranBuperController;
use App\Http\Controllers\MiniSoc\PengeluaranMiniSocController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// =============================
// Public Routes
// =============================

Route::get('/', function () {
    return Inertia::render('welcome'); // pastikan case 'Welcome' sesuai dengan file
})->name('home');

Route::get('/Login', [LoginController::class, 'index'])->name('loginform');
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/login');
})->name('logout');

Route::get('/Home', [HomeController::class, 'index'])->name('HomeCompro');
Route::get('/tes', fn() => 'Tes kolab');

// =============================
// Protected Routes (authenticated & verified users)
// =============================

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('MiniSoc/DashboardMiniSoc');
    })->name('dashboard');

    Route::prefix('unit/{unitId}')->name('unit.')->group(function () {

        // Dashboard unit tertentu
        Route::get('/dashboard', function () {
            $user = Auth::user();
            $unit = $user->units()->first();

            if (!$unit) {
                abort(403, 'Anda tidak memiliki unit yang dapat diakses.');
            }

            $page = match ($unit->id_units) {
                1 => 'MiniSoc/DashboardMiniSoc',
                2 => 'Buper/DashboardBuper',
                default => 'dashboard',
            };

            return Inertia::render($page, [
                'unit_id' => $unit->id_units,
            ]);
        })->middleware(['auth', 'verified'])->name('dashboard');

        // Pemasukan
        Route::resource('pemasukan', PemasukanMiniSocController::class);
        Route::resource('pemasukan', PemasukanBuperController::class)->only(['index', 'store', 'update', 'destroy']);
        // Pengeluaran
        Route::resource('pengeluaran', PengeluaranMiniSocController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('pengeluaran', PengeluaranBuperController::class)->only(['index', 'store', 'update', 'destroy']);
        // Kelola Laporan
        Route::get('/kelolalaporan', [KelolaLaporanMiniSocController::class, 'index'])->name('laporan.kelola');
        Route::get('/kelolalaporan', [KelolaLaporanBuperController::class, 'index'])->name('laporan.kelola');


        Route::middleware(['auth'])->group(function () {
            Route::get('/kelolalaporan/export-pdf', [KelolaLaporanMiniSocController::class, 'exportPDF']);
            Route::get('/kelolalaporan/export-excel', [KelolaLaporanMiniSocController::class, 'exportExcel']);
        });
    });


    // Laporan & Pengeluaran
    // Route::get('/KelolaLaporanMiniSoc', [KelolaLaporanMiniSocController::class, 'index'])->name('laporan.kelola');
    // // Route::get('/PengeluaranMiniSoc', [PengeluaranMiniSocController::class, 'index'])->name('pengeluaranminisoc'); // jika ingin dipakai kembali
});

// =============================
// Route Tambahan
// =============================

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
