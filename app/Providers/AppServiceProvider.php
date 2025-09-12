<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\profileDesa;
use App\Models\profileBumdes;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('auth.user', fn() => auth()->check() ? [
            'id' => auth()->user()->id,
            'name' => auth()->user()->name,
            'email' => auth()->user()->email,
            'role' => auth()->user()->role,
            'unit_id' => auth()->user()->units_id,
            'image' => auth()->user()->image,
        ] : null);

        Inertia::share([
            'logos' => function () {
                $desa = profileDesa::first();
                $bumdes = profileBumdes::first();

                return [
                    'logo_desa' => $desa?->logo_desa ? asset('storage/' . $desa->logo_desa) : null,
                    'logo_bumdes' => $bumdes?->logo_bumdes ? asset('storage/' . $bumdes->logo_bumdes) : null,
                ];
            }
        ]);
    }
}
