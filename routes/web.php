<?php

use App\Http\Controllers\Airweslik\KelolaLaporanAirweslikController;
use App\Http\Controllers\Airweslik\PemasukanAirweslikController;
use App\Http\Controllers\Airweslik\PengeluaranAirweslikController;
use App\Http\Controllers\HomeController;

// Kelola Laporan Controller
use App\Http\Controllers\laporanTransparansiController;
use App\Http\Controllers\MiniSoc\KelolaLaporanMiniSocController;
use App\Http\Controllers\Buper\KelolaLaporanBuperController;
use App\Http\Controllers\Internetdesa\KelolaLaporanInterdesaController;
use App\Http\Controllers\LoginController;

// Pemasukan Controller
use App\Http\Controllers\MiniSoc\PemasukanMiniSocController;
use App\Http\Controllers\Buper\PemasukanBuperController;
use App\Http\Controllers\SewaKios\PemasukanSewKiosController;
use App\Http\Controllers\Internetdesa\PemasukanInterdesaController;

// Pengeluaran Controller
use App\Http\Controllers\Buper\PengeluaranBuperController;
use App\Http\Controllers\Internetdesa\PengeluaranInterdesaController;
use App\Http\Controllers\MiniSoc\PengeluaranMiniSocController;
use App\Http\Controllers\SewaKios\KelolaLaporanSewKiosController;
use App\Http\Controllers\SewaKios\PengeluaranSewKiosController;

use App\Http\Controllers\UnitUsahaPageController;
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
    return redirect('/Login');
})->name('logout');

// =============================
// Public Routes for company profile
// =============================

Route::get('/Home', [HomeController::class, 'index'])->name('HomeCompro');
Route::get('/unit-usaha', [UnitUsahaPageController::class, 'index'])->name('UnitUsahaPage');
Route::get('/galeri', fn() => Inertia::render('galeri'));
Route::get('/laporan-transparansi', [laporanTransparansiController::class, 'index'])->name('laporan-transparansi');
Route::get('/laporan-transparansi/download', [laporanTransparansiController::class, 'download'])->name('laporan.download');

Route::prefix('profil')->group(function () {
    Route::get('/tentang-kami', fn() => Inertia::render('Profil/TentangKami'));
    Route::get('/struktur-organisasi', fn() => Inertia::render('Profil/StrukturOrganisasi'));
    Route::get('/legalitas', fn() => Inertia::render('Profil/legalitas'));
});


// =============================
// Protected Routes (authenticated & verified users)
// =============================

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('MiniSoc/DashboardMiniSoc');
    })->name('dashboard');

    Route::prefix('unit/{unitId}')->name('unit.')->group(function () {

        // Dashboard unit tertentu
        Route::get('/dashboard', function ($unitId) {
            $user = Auth::user();
            $unit = $user->units()->where('id_units', $unitId)->first();

            if (!$unit) {
                abort(403, 'Anda tidak memiliki akses ke unit ini.');
            }

            $page = match ($unit->id_units) {
                1 => 'MiniSoc/DashboardMiniSoc',
                2 => 'Buper/DashboardBuper',
                3 => 'Sewakios/DashboardSewakios',
                4 => 'Airweslik/DashboardAirweslik',
                5 => 'Internetdesa/DashboardInterdesa',
                default => 'Dashboard',
            };

            try {
                return Inertia::render($page, [
                    'unit_id' => $unit->id_units,
                    'auth' => [
                        'user' => $user
                    ]
                ]);
            } catch (\Exception $e) {
                // Tampilkan error yang sebenarnya (misalnya file tidak ditemukan)
                dd("Gagal me-render halaman '$page': " . $e->getMessage());
            }
        })->middleware(['auth', 'verified'])->name('dashboard');

        // Pemasukan
        Route::resource('pemasukan-minisoc', PemasukanMiniSocController::class);
        Route::resource('pemasukan-buper', PemasukanBuperController::class);
        Route::resource('pemasukan-sewakios', PemasukanSewKiosController::class);
        Route::resource('pemasukan-airweslik', PemasukanAirweslikController::class);
        Route::resource('pemasukan-interdesa', PemasukanInterdesaController::class);



        // Pengeluaran
        Route::resource('pengeluaran-minisoc', PengeluaranMiniSocController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('pengeluaran-buper', PengeluaranBuperController::class);
        Route::resource('pengeluaran-sewakios', PengeluaranSewKiosController::class);
        Route::resource('pengeluaran-airweslik', PengeluaranAirweslikController::class);
        Route::resource('pengeluaran-interdesa', PengeluaranInterdesaController::class);


        // Kelola Laporan
        Route::get('/kelolalaporan-minisoc', [KelolaLaporanMiniSocController::class, 'index'])->name('laporan.minisoc.kelola');
        Route::get('/kelolalaporan-buper', [KelolaLaporanBuperController::class, 'index'])->name('laporan.buper.kelola');
        Route::get('/kelolalaporan-sewakios', [KelolaLaporanSewKiosController::class, 'index'])->name('laporan.sewakios.kelola');
        Route::get('/kelolalaporan-airweslik', [KelolaLaporanAirweslikController::class, 'index'])->name('laporan.airweslik.kelola');
        Route::get('/kelolalaporan-interdesa', [KelolaLaporanInterdesaController::class, 'index'])->name('laporan.airweslik.kelola');





        Route::middleware(['auth'])->group(function () {
            Route::get('/kelolalaporan/export-pdf', [KelolaLaporanMiniSocController::class, 'exportPDF']);
            Route::get('/kelolalaporan/export-excel', [KelolaLaporanMiniSocController::class, 'exportExcel']);
        });
        Route::middleware(['auth'])->group(function () {
            Route::get('/kelolalaporan/export-pdf', [KelolaLaporanBuperController::class, 'exportPDF']);
            Route::get('/kelolalaporan/export-excel', [KelolaLaporanBuperController::class, 'exportExcel']);
        });
        Route::middleware(['auth'])->group(function () {
            Route::get('/kelolalaporan/export-pdf', [KelolaLaporanSewKiosController::class, 'exportPDF']);
            Route::get('/kelolalaporan/export-excel', [KelolaLaporanSewKiosController::class, 'exportExcel']);
        });
        Route::middleware(['auth'])->group(function () {
            Route::get('/kelolalaporan/export-pdf', [KelolaLaporanAirweslikController::class, 'exportPDF']);
            Route::get('/kelolalaporan/export-excel', [KelolaLaporanAirweslikController::class, 'exportExcel']);
        });
        Route::middleware(['auth'])->group(function () {
            Route::get('/kelolalaporan/export-pdf', [KelolaLaporanInterdesaController::class, 'exportPDF']);
            Route::get('/kelolalaporan/export-excel', [KelolaLaporanInterdesaController::class, 'exportExcel']);
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
