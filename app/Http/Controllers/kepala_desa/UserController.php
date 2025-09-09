<?php

namespace App\Http\Controllers\kepala_desa;

use App\Http\Controllers\Controller;
use App\Models\Unit;
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

        if (!in_array($currentUser->roles, ['pengelola', 'kepala_desa', 'kepala_bumdes', 'admin'])) {
            abort(403);
        }

        // Pagination: ubah menjadi 5 user per halaman (minimal 5)
        $users = User::with('units')
            ->latest('updated_at')
            ->paginate(5) // Ubah dari 10 menjadi 5
            ->through(function ($user) {
                return [
                    'id_users' => $user->id_users,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null, // Pastikan null handling yang benar
                    'roles' => $user->roles,
                    'created_at' => optional($user->created_at)->format('Y-m-d H:i:s'),
                    'updated_at' => optional($user->updated_at)->format('Y-m-d H:i:s'),
                    'units' => $user->units->map(fn($unit) => [
                        'id' => $unit->id_units,
                        'name' => $unit->unit_name ?? 'Unit tidak diketahui',
                    ]),
                ];
            });

        return Inertia::render('kepala_desa/User', [
            'user' => $currentUser->only(['id_users', 'name', 'email', 'roles']),
            'users' => $users,
            'units' => Unit::all(['id_units as id', 'unit_name as name'])
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['kepala_desa', 'kepala_bumdes'])) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20|regex:/^[0-9+\-\s()]*$/', // Ubah ke nullable
            'password' => 'required|string|min:8',
            'roles' => 'required|in:kepala_desa,pengelola,kepala_bumdes,admin',
            'unit_id' => 'nullable|exists:units,id_units',
        ]);

        // 🔒 Cek unik role sebelum create
        if ($validated['roles'] === 'kepala_desa' && User::where('roles', 'kepala_desa')->exists()) {
            return back()->withErrors(['error' => 'Hanya boleh ada 1 user dengan role Kepala Desa']);
        }

        if ($validated['roles'] === 'kepala_bumdes' && User::where('roles', 'kepala_bumdes')->exists()) {
            return back()->withErrors(['error' => 'Hanya boleh ada 1 user dengan role Kepala Bumdes']);
        }

        // ✅ VALIDASI PENGELOLA PER UNIT - LEBIH KETAT
        if ($validated['roles'] === 'pengelola') {
            if (empty($validated['unit_id'])) {
                return back()->withErrors(['error' => 'Pengelola harus memiliki unit usaha']);
            }

            // Cek apakah sudah ada pengelola di unit ini
            $sudahAdaPengelola = User::where('roles', 'pengelola')
                ->whereHas('units', function($q) use ($validated) {
                    $q->where('units.id_units', $validated['unit_id']);
                })
                ->exists();

            if ($sudahAdaPengelola) {
                $unit = Unit::find($validated['unit_id']);
                return back()->withErrors(['error' => 'Unit "' . ($unit->unit_name ?? 'Tidak diketahui') . '" sudah memiliki pengelola. Satu unit hanya boleh memiliki satu pengelola.']);
            }
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null, // Handle nullable phone
                'password' => Hash::make($validated['password']),
                'roles' => $validated['roles'],
            ]);

            if ($validated['roles'] === 'pengelola' && !empty($validated['unit_id'])) {
                $user->units()->sync([$validated['unit_id']]);
            }

            DB::commit();

            return back()->with('info', [
                'message' => 'User berhasil ditambahkan',
                'method' => 'store',
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
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id_users, 'id_users'),
            ],
            'phone' => 'nullable|string|max:20|regex:/^[0-9+\-\s()]*$/', // Ubah ke nullable
            'password' => 'nullable|string|min:8',
            'roles' => 'required|in:kepala_desa,pengelola,kepala_bumdes,admin',
            'unit_id' => 'nullable|exists:units,id_units',
        ]);

        // 🔒 Validasi unik role (abaikan user yg sedang diupdate)
        if (
            $validated['roles'] === 'kepala_desa' &&
            User::where('roles', 'kepala_desa')->where('id_users', '!=', $user->id_users)->exists()
        ) {
            return back()->withErrors(['error' => 'Hanya boleh ada 1 user dengan role Kepala Desa']);
        }

        if (
            $validated['roles'] === 'kepala_bumdes' &&
            User::where('roles', 'kepala_bumdes')->where('id_users', '!=', $user->id_users)->exists()
        ) {
            return back()->withErrors(['error' => 'Hanya boleh ada 1 user dengan role Kepala Bumdes']);
        }

        // ✅ VALIDASI PENGELOLA PER UNIT SAAT UPDATE - LEBIH KETAT
        if ($validated['roles'] === 'pengelola') {
            if (empty($validated['unit_id'])) {
                return back()->withErrors(['error' => 'Pengelola harus memiliki unit usaha']);
            }

            // Cek apakah ada pengelola lain di unit yang sama (selain user yang sedang diedit)
            $sudahAdaPengelolaLain = User::where('roles', 'pengelola')
                ->where('id_users', '!=', $user->id_users) // Exclude user yang sedang diedit
                ->whereHas('units', function($q) use ($validated) {
                    $q->where('units.id_units', $validated['unit_id']);
                })
                ->exists();

            if ($sudahAdaPengelolaLain) {
                $unit = Unit::find($validated['unit_id']);
                return back()->withErrors(['error' => 'Unit "' . ($unit->unit_name ?? 'Tidak diketahui') . '" sudah memiliki pengelola lain. Satu unit hanya boleh memiliki satu pengelola.']);
            }
        }

        try {
            DB::beginTransaction();

            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null, // Handle nullable phone
                'roles' => $validated['roles'],
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $user->update($userData);

            // Handle unit assignment
            if ($validated['roles'] === 'pengelola' && !empty($validated['unit_id'])) {
                $user->units()->sync([$validated['unit_id']]);
            } else {
                // Jika bukan pengelola, hapus semua unit
                $user->units()->detach();
            }

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
            'phone' => $user->phone ?? null, // Handle nullable phone
            'roles' => $user->roles,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => optional($user->created_at)->format('Y-m-d H:i:s'),
            'updated_at' => optional($user->updated_at)->format('Y-m-d H:i:s'),
            'unit_id' => $user->units->first()->id_units ?? null,
            'unit_name' => $user->units->first()->name ?? null,
        ];

        return Inertia::render('kepala_desa/User', [
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