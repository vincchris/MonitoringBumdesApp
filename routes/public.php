<?php

use App\Http\Controllers\frontend\tentangKamiController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\frontend\HomeController;
use App\Http\Controllers\frontend\UnitUsahaPageController;
use App\Http\Controllers\frontend\laporanTransparansiController;
use App\Http\Controllers\frontend\strukturOrganisasiController;

Route::get('/', fn() => Inertia::render('welcome'))->name('home');

Route::get('/login', [LoginController::class, 'index'])->name('login');
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect()->route('login');
})->name('logout');

// Company profile
Route::get('/Home', [HomeController::class, 'index'])->name('HomeCompro');
Route::get('/unit-usaha', [UnitUsahaPageController::class, 'index'])->name('UnitUsahaPage');
Route::get('/galeri', fn() => Inertia::render('galeri'));
Route::get('/kontak', fn() => Inertia::render('kontak'));

Route::prefix('laporan-transparansi')->controller(laporanTransparansiController::class)->group(function () {
    Route::get('/', 'index')->name('laporan-transparansi');
    Route::get('download', 'download')->name('laporan.download');
});

Route::prefix('profil')->group(function () {
    Route::resource('/tentang-kami', tentangKamiController::class);
    Route::resource('/struktur-organisasi', strukturOrganisasiController::class);
    Route::get('/dokumen-legalitas', fn() => Inertia::render('Profil/legalitas'));
});
