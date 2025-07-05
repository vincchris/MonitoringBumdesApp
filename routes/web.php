<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\frontend\HomeController;
use App\Http\Controllers\frontend\UnitUsahaPageController;

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
use App\Http\Controllers\backend\MiniSoc\PengeluaranMiniSocController;
use App\Http\Controllers\backend\SewaKios\PengeluaranSewKiosController;

// =============================
// Public Routes
// =============================

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/Login', [LoginController::class, 'index'])->name('loginform');
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect()->route('loginform');
})->name('logout');

// =============================
// Public Routes for company profile
// =============================

Route::get('/Home', [HomeController::class, 'index'])->name('HomeCompro');
Route::get('/unit-usaha', [UnitUsahaPageController::class, 'index'])->name('UnitUsahaPage');
Route::get('/galeri', fn() => Inertia::render('galeri'));

Route::prefix('laporan-transparansi')->controller(laporanTransparansiController::class)->group(function () {
    Route::get('/', 'index')->name('laporan-transparansi');
    Route::get('download', 'download')->name('laporan.download');
});

Route::get('/kontak', fn() => Inertia::render('kontak'));

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
                6 => 'Bumdes/DashboardBumdes',
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


    // Laporan & Pengeluaran
    // Route::get('/KelolaLaporanMiniSoc', [KelolaLaporanMiniSocController::class, 'index'])->name('laporan.kelola');
    // // Route::get('/PengeluaranMiniSoc', [PengeluaranMiniSocController::class, 'index'])->name('pengeluaranminisoc'); // jika ingin dipakai kembali
});

// =============================
// Route Tambahan
// =============================

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
