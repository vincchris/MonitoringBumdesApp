<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        session()->regenerate();
        $user = Auth::user();
        $role = $user->getAttribute('roles');

        if ($role === 'admin') {
            return redirect()->route('dashboard.admin');
        } elseif ($role === 'kepala_desa') {
            return redirect()->route('dashboard.kepalaDesa');
        } elseif ($role === 'kepala_bumdes') {
            return redirect()->route('dashboard.kepalaBumdes');
        } elseif ($role === 'pengelola') {
            $unit = $user->units()->first();

            if ($unit) {
                return redirect()->route('unit.dashboard', ['unitId' => $unit->id_units]);
            }

            abort(403, 'Anda tidak memiliki akses ke unit manapun.');
        } else {
            abort(404, 'Role tidak dikenali.');
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
