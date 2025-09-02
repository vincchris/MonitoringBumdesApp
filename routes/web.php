<?php

use App\Http\Controllers\kepala_bumdes\AirWeslikController;
use App\Http\Controllers\kepala_desa\BuperController;
use App\Http\Controllers\kepala_bumdes\InternetDesaController;
use App\Http\Controllers\kepala_desa\KiosController;
use App\Http\Controllers\kepala_desa\MiniSocController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\kepala_desa\UserController;

// Kelola Laporan Controller
use App\Http\Controllers\frontend\laporanTransparansiController;
use App\Http\Controllers\backend\MiniSoc\KelolaLaporanMiniSocController;
use App\Http\Controllers\backend\Buper\KelolaLaporanBuperController;
use App\Http\Controllers\backend\SewaKios\KelolaLaporanSewKiosController;
use App\Http\Controllers\backend\Internetdesa\KelolaLaporanInterdesaController;
use App\Http\Controllers\backend\Airweslik\KelolaLaporanAirweslikController;

// Pemasukan Controller
use App\Http\Controllers\backend\MiniSoc\PemasukanMiniSocController;
use App\Http\Controllers\backend\Buper\PemasukanBuperController;
use App\Http\Controllers\backend\SewaKios\PemasukanSewKiosController;
use App\Http\Controllers\backend\Airweslik\PemasukanAirweslikController;
use App\Http\Controllers\backend\Internetdesa\PemasukanInterdesaController;

// Pengeluaran Controller
use App\Http\Controllers\backend\Buper\PengeluaranBuperController;
use App\Http\Controllers\backend\Internetdesa\PengeluaranInterdesaController;
use App\Http\Controllers\backend\Airweslik\PengeluaranAirweslikController;
use App\Http\Controllers\backend\MiniSoc\DashboardMiniSocController;
use App\Http\Controllers\backend\Buper\DashboardBuperController;
use App\Http\Controllers\backend\SewaKios\DashboardSewKiosController;
use App\Http\Controllers\kepala_desa\DashboardKepalaDesaController;

use App\Http\Controllers\backend\MiniSoc\PengeluaranMiniSocController;
use App\Http\Controllers\backend\SewaKios\PengeluaranSewKiosController;
use App\Http\Controllers\kepala_bumdes\DashboardKepalaBumdesController;


// =============================
// Public Routes
// =============================

require __DIR__ . '/public.php';

// =============================
// Protected Routes (authenticated & verified users)
// =============================

Route::middleware(['auth', 'verified'])->group(function () {

    Route::prefix('unit/{unitId}')->name('unit.')->group(function () {

        // Dashboard unit tertentu
        Route::get('/dashboard', function ($unitId) {
            $user = Auth::user();
            $unit = $user->units()->where('id_units', $unitId)->first();

            if (!$unit) {
                abort(403, 'Anda tidak memiliki akses ke unit ini.');
            }

            $response = match ($unit->id_units) {
                1 => app(DashboardMiniSocController::class)->index($unitId),
                2 => app(DashboardBuperController::class)->index($unitId),
                3 => app(DashboardSewKiosController::class)->index($unitId),
                4 => app(DashboardBuperController::class)->index($unitId),
                5 => app(DashboardBuperController::class)->index($unitId),

                default => abort(404, 'Dashboard unit tidak ditemukan.'),
            };

            return $response;
        })->name('dashboard');

        // ========== Rute Pemasukan ==========
        Route::resource('pemasukan-minisoc', PemasukanMiniSocController::class);
        Route::resource('pemasukan-buper', PemasukanBuperController::class);
        Route::resource('pemasukan-sewakios', PemasukanSewKiosController::class);
        Route::resource('pemasukan-airweslik', PemasukanAirweslikController::class);
        Route::resource('pemasukan-interdesa', PemasukanInterdesaController::class);


        // ========== Rute Pengeluaran ==========
        Route::resource('pengeluaran-minisoc', PengeluaranMiniSocController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('pengeluaran-buper', PengeluaranBuperController::class);
        Route::resource('pengeluaran-sewakios', PengeluaranSewKiosController::class);
        Route::resource('pengeluaran-airweslik', PengeluaranAirweslikController::class);
        Route::resource('pengeluaran-interdesa', PengeluaranInterdesaController::class);

        // ========== Kelola Laporan + Ekspor ==========
        $laporanUnits = [
            'minisoc'     => KelolaLaporanMiniSocController::class,
            'buper'       => KelolaLaporanBuperController::class,
            'sewakios'    => KelolaLaporanSewKiosController::class,
            'airweslik'   => KelolaLaporanAirweslikController::class,
            'interdesa'   => KelolaLaporanInterdesaController::class,
        ];

        foreach ($laporanUnits as $key => $controller) {
            Route::prefix("kelolalaporan-{$key}")->name("laporan.{$key}.")->group(function () use ($controller) {
                Route::get('/', [$controller, 'index'])->name('kelola');
                Route::get('/export-pdf', [$controller, 'exportPDF'])->name('export.pdf');
                Route::get('/export-excel', [$controller, 'exportExcel'])->name('export.excel');
            });
        }
    });


    // ==============================================
    // Route Kepala desa
    // ==============================================

    Route::get('/dashboard-KepalaDesa', [DashboardKepalaDesaController::class, 'index'])->name('dashboard.kepalaDesa');
    Route::get('/dashboard-kepalaBumdes', [DashboardKepalaBumdesController::class, 'index'])->name('dashboard.kepalaBumdes');
    Route::post('/update-saldo-awal', [DashboardKepalaDesaController::class, 'updateSaldoAwal'])->name('saldo-awal.update');
    Route::get('user', [UserController::class, 'index']);
    Route::resource('/admin/users', UserController::class)->except(['create', 'edit']);

    // =============================
    // Route kepala_desa Minisoc
    // =============================

    Route::resource('MiniSoccer', MiniSocController::class);
    Route::prefix('MiniSoccer')->name('minisoc.')->controller(MiniSocController::class)->group(function () {
        Route::get('/download-pdf/{bulan}', 'downloadPdfDetail')->name('downloadPdfDetail')->where('bulan', '[0-9]{4}-[0-9]{2}|[0-9]{6}|[A-Za-z]+\s[0-9]{4}');
        Route::get('/download-excel/{bulan}', 'downloadExcelDetail')->name('downloadExcelDetail');
    });

    Route::prefix('unit/{unitId}/minisoc')
        ->as('minisoc.')
        ->controller(MiniSocController::class)
        ->group(function () {
            // Route untuk saldo awal
            Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');

            // Routes untuk tarif
            Route::post('/tarif', 'storeTarif')->name('storeTarif');
            Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
            Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');

            Route::get('/tarif', 'getTarif')->name('getTarif');
            Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
        });

    // =============================
    // Route kepala_desa Buper
    // =============================

    Route::resource('Buper', BuperController::class);
    Route::prefix('Buper')->name('buper.')->controller(BuperController::class)->group(function () {
        Route::get('/download-pdf/{bulan}', 'downloadPdfDetail')->name('downloadPdfDetail')->where('bulan', '[0-9]{4}-[0-9]{2}|[0-9]{6}|[A-Za-z]+\s[0-9]{4}');
        Route::get('/download-excel/{bulan}', 'downloadExcelDetail')->name('downloadExcelDetail');
    });

    Route::prefix('unit/{unitId}/buper')
        ->as('buper.')
        ->controller(BuperController::class)
        ->group(function () {
            // Route untuk saldo awal
            Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');

            // Routes untuk tarif
            Route::post('/tarif', 'storeTarif')->name('storeTarif');
            Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
            Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');

            Route::get('/tarif', 'getTarif')->name('getTarif');
            Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
        });

    // =============================
    // Route kepala_desa Kios
    // =============================
    Route::resource('Kios', KiosController::class);
    Route::prefix('Kios')->name('Kios.')->controller(KiosController::class)->group(function () {
        Route::get('/download-pdf/{bulan}', 'downloadPdfDetail')->name('downloadPdfDetail')->where('bulan', '[0-9]{4}-[0-9]{2}|[0-9]{6}|[A-Za-z]+\s[0-9]{4}');
        Route::get('/download-excel/{bulan}', 'downloadExcelDetail')->name('downloadExcelDetail');
    });
    Route::prefix('unit/{unitId}/kios')
        ->as('Kios.')
        ->controller(KiosController::class)
        ->group(function () {
            Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');

            // Route tarif sewa
            Route::post('/tarif', 'storeTarif')->name('storeTarif');
            Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
            Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');

            // get tarif
            Route::get('/tarif', 'getTarif')->name('getTarif');
            Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
        });

    // =============================
    // Route Kepala bumdes Air Weslik
    // =============================
    Route::resource('airweslik', AirWeslikController::class);
    Route::prefix('airweslik')->name('airweslik.')->controller(AirWeslikController::class)->group(function () {
        Route::get('/download-pdf/{bulan}', 'downloadPdfDetail')->name('downloadPdfDetail')->where('bulan', '[0-9]{4}-[0-9]{2}|[0-9]{6}|[A-Za-z]+\s[0-9]{4}');
        Route::get('/download-excel/{bulan}', 'downloadExcelDetail')->name('downloadExcelDetail');
    });
    Route::prefix('unit/{unitId}/airweslik')
        ->as('airweslik.')
        ->controller(AirWeslikController::class)
        ->group(function () {
            Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');

            // Route tarif
            Route::post('/tarif', 'storeTarif')->name('storeTarif');
            Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
            Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');

            Route::get('/tarif', 'getTarif')->name('getTarif');
            Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
        });

    // =============================
    // Route Kepala bumdes Internet Desa
    // =============================
    Route::resource('InterDesa', InternetDesaController::class);
    Route::prefix('interdesa')->name('interdesa.')->controller(InternetDesaController::class)->group(function () {
        Route::get('/download-pdf/{bulan}', 'downloadPdfDetail')->name('downloadPdfDetail')->where('bulan', '[0-9]{4}-[0-9]{2}|[0-9]{6}|[A-Za-z]+\s[0-9]{4}');
        Route::get('/download-excel/{bulan}', 'downloadExcelDetail')->name('downloadExcelDetail');
    });
    Route::prefix('unit/{unitId}/interdesa')
        ->as('interdesa.')
        ->controller(InternetDesaController::class)
        ->group(function () {
            Route::post('/initial-balance', 'storeInitialBalance')->name('storeInitialBalance');
            Route::post('/tarif', 'storeTarif')->name('storeTarif');
            Route::put('/tarif/{tarifId}', 'updateTarif')->name('updateTarif');
            Route::delete('/tarif/{tarifId}', 'deleteTarif')->name('deleteTarif');
            Route::get('/tarif', 'getTarif')->name('getTarif');
            Route::get('/tarif/all', 'getAllTarifsAPI')->name('getAllTarifs');
        });
});

// =============================
// Route Tambahan
// =============================

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// =============================
// admin Routes
// =============================

require __DIR__ . '/admin.php';
