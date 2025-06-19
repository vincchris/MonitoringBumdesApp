<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\KelolaLaporanMiniSocController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PemasukanMiniSocController;
use App\Http\Controllers\PengeluaranMiniSocController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('DashboardMiniSoc', function () {
        return Inertia::render('DashboardMiniSoc');
    })->name('dashboard');
});

Route::post('/logout', function() {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/login');
})->name('logout');

Route::get('/Login', [LoginController::class, 'index'])->name('loginform');
// Route::get('/PemasukanMiniSoc', [PemasukanMiniSocController::class, 'index'])->name('pemasukanminisoc');
Route::get('/PemasukanMiniSoc/{unitId}', [PemasukanMiniSocController::class, 'index'])->name('pemasukan.index');
Route::get('/PengeluaranMiniSoc', [PengeluaranMiniSocController::class, 'index'])->name('pengeluaranminisoc');
Route::get('/KelolaLaporanMiniSoc', [KelolaLaporanMiniSocController::class, 'index'])->name('pengeluaranminisoc');




Route::get('tes', fn() => 'Tes kolab');
Route::get('Home', [HomeController::class, 'index'])->name('HomeCompro');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
