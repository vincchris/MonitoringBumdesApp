<?php

namespace App\Http\Controllers\kepala_desa;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['pengelola', 'kepala_desa'])) {
            abort(403);
        }

        // Pagination: ambil 10 user per halaman
        $users = User::with('units')
            ->latest('updated_at')
            ->paginate(10)
            ->through(function ($user) {
                return [
                    'id_users' => $user->id_users,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles,
                    'created_at' => optional($user->created_at)->format('Y-m-d H:i:s'),
                    'updated_at' => optional($user->updated_at)->format('Y-m-d H:i:s'),
                    'units' => $user->units->map(fn($unit) => [
                        'id' => $unit->id_units,
                        'name' => $unit->name ?? 'Unit tidak diketahui',
                    ]),
                ];
            });

        return Inertia::render('kepala_desa/User', [
            'user' => $currentUser->only(['id_users', 'name', 'email', 'roles']),
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['pengelola', 'kepala_desa'])) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'roles' => 'required|in:kepala_desa,pengelola',
        ]);

        try {
            DB::beginTransaction();

            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'roles' => $validated['roles'],
                'email_verified_at' => now(),
            ];

            User::create($userData);

            DB::commit();

            return back()->with('info', [
                'message' => 'User berhasil ditambahkan',
                'method' => 'create',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambah user: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, string $id)
    {
        $currentUser = Auth::user();
        if (!in_array($currentUser->roles, ['pengelola', 'kepala_desa'])) {
            abort(403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user->id_users, 'id_users'),
            ],
            'password' => 'nullable|string|min:8',
            'roles' => 'required|in:kepala_desa,pengelola',
        ]);

        try {
            DB::beginTransaction();

            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'roles' => $validated['roles'],
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $user->update($userData);

            DB::commit();

            return back()->with('info', [
                'message' => 'User berhasil diupdate',
                'method' => 'update',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengubah user: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $id)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['pengelola', 'kepala_desa'])) {
            abort(403);
        }

        if ($currentUser->id_users == $id) {
            return back()->withErrors(['error' => 'Anda tidak bisa menghapus akun sendiri']);
        }

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            $user->units()->detach();
            $user->delete();

            DB::commit();

            return back()->with('info', [
                'message' => 'User berhasil dihapus',
                'method' => 'delete',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus user: ' . $e->getMessage()]);
        }
    }

    public function show(string $id)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['pengelola', 'kepala_desa'])) {
            abort(403);
        }

        $user = User::with('units')->findOrFail($id);

        $formatted = [
            'id_users' => $user->id_users,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => optional($user->created_at)->format('Y-m-d H:i:s'),
            'updated_at' => optional($user->updated_at)->format('Y-m-d H:i:s'),
            'units' => $user->units->map(fn($unit) => [
                'id' => $unit->id_units,
                'name' => $unit->name ?? 'Unit tidak diketahui',
            ]),
        ];

        return Inertia::render('Bumdes/User', [
            'user' => $currentUser->only(['id_users', 'name', 'email', 'roles']),
            'userData' => $formatted,
        ]);
    }

    public function toggleStatus(string $id)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['pengelola', 'kepala_desa'])) {
            abort(403);
        }

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            $user->email_verified_at = $user->email_verified_at ? null : now();
            $user->save();

            DB::commit();

            return back()->with('info', [
                'message' => 'Status user berhasil diubah',
                'method' => 'update',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal ubah status: ' . $e->getMessage()]);
        }
    }
}
