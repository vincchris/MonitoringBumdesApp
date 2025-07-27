<?php

use App\Http\Controllers\Bumdes\AirWeslikController;
use App\Http\Controllers\Bumdes\BuperController;
use App\Http\Controllers\Bumdes\InternetDesaController;
use App\Http\Controllers\Bumdes\KiosController;
use App\Http\Controllers\Bumdes\MiniSocController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\frontend\HomeController;
use App\Http\Controllers\frontend\UnitUsahaPageController;
use App\Http\Controllers\Bumdes\UserController;

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
use App\Http\Controllers\Bumdes\DashboardBumdesController;
use App\Http\Controllers\backend\Airweslik\DashboardAirweslikController;
use App\Http\Controllers\backend\Internetdesa\DashboardInterDesaController;

use App\Http\Controllers\backend\MiniSoc\PengeluaranMiniSocController;
use App\Http\Controllers\backend\SewaKios\PengeluaranSewKiosController;
use App\Http\Controllers\Bumdes\MiniSocContoller;

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


    // =============================
    // Route Kepala desa / bumdes
    // =============================

    Route::get('/dashboard-KepalaBumdes', [DashboardBumdesController::class, 'index'])->name('dashboard.bumdes');
    Route::post('/update-saldo-awal', [DashboardBumdesController::class, 'updateSaldoAwal'])->name('saldo-awal.update');
    Route::get('user', [UserController::class, 'index']);
    Route::resource('/admin/users', UserController::class)->except(['create', 'edit']);
    Route::resource('MiniSoccer', MiniSocController::class);
    Route::post('/store/{UNIT_ID}/initialBalance', [MiniSocController::class, 'storeInitialBalance'])->name('storeInitialBalance');
    Route::resource('Buper', BuperController::class);
    Route::resource('Kios', KiosController::class);
    Route::resource('Airweslik', AirWeslikController::class);
    Route::resource('InterDesa', InternetDesaController::class);
});

// =============================
// Route Tambahan
// =============================

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
