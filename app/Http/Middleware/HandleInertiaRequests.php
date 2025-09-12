<?php

namespace App\Http\Middleware;

use App\Models\profileBumdes;
use App\Models\profileDesa;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Ambil data logos dari database
        $desa = profileDesa::first();
        $bumdes = profileBumdes::first();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'info' => fn() => $request->session()->get('info') ?? []
            ],
            // Tambahkan data logos yang akan di-share ke semua halaman
            'logos' => [
                'logo_desa' => $desa?->logo_desa ? asset('storage/' . $desa->logo_desa) : null,
                'logo_bumdes' => $bumdes?->logo_bumdes ? asset('storage/' . $bumdes->logo_bumdes) : null,
            ],
            'photos' => [
                'foto_kantor_desa' => $desa?->foto_kantor_desa ? asset('storage/' . $desa->foto_kantor_desa) : null,
                'foto_sekretariat' => $bumdes?->foto_sekretariat ? asset('storage/' . $bumdes->foto_sekretariat) : null,
            ],
        ];
    }
}