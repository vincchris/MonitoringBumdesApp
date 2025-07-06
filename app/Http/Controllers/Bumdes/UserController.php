<?php

namespace App\Http\Controllers\Bumdes;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = Auth::user();

        // Hanya admin atau kepala desa yang bisa mengakses
        if (!in_array($currentUser->roles, ['admin', 'kepala_desa'])) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini');
        }

        $users = User::with(['units'])
            ->latest('updated_at')
            ->get();

        $formatted = $users->map(function ($user) {
            return [
                'id' => $user->id_users,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles,
                'image' => $user->image,
                'created_at' => optional($user->created_at)->format('Y-m-d H:i:s'),
                'updated_at' => optional($user->updated_at)->format('Y-m-d H:i:s'),
                'units' => $user->units->map(function ($unit) {
                    return [
                        'id' => $unit->id_units,
                        'name' => $unit->name ?? 'Unit tidak diketahui',
                    ];
                }),
            ];
        });

        return Inertia::render('Bumdes/User', [
            'user' => $currentUser->only(['id_users', 'name', 'email', 'roles', 'image']),
            'users' => $formatted,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['admin', 'kepala_desa'])) {
            abort(403, 'Anda tidak memiliki akses untuk menambah user');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|string|in:admin,kepala_desa,pengelola',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'roles' => $validated['roles'],
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('users', 'public');
                $userData['image'] = $imagePath;
            }

            User::create($userData);

            DB::commit();

            return back()->with('info', [
                'message' => 'User berhasil ditambahkan',
                'method' => 'create',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan user: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, string $id)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['admin', 'kepala_desa'])) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah user');
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id_users, 'id_users'),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'required|string|in:admin,kepala_desa,pengelola',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'roles' => $validated['roles'],
                'updated_at' => now(),
            ];

            // Update password only if provided
            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($user->image && file_exists(storage_path('app/public/' . $user->image))) {
                    unlink(storage_path('app/public/' . $user->image));
                }

                $imagePath = $request->file('image')->store('users', 'public');
                $userData['image'] = $imagePath;
            }

            $user->update($userData);

            DB::commit();

            return back()->with('info', [
                'message' => 'User berhasil diubah',
                'method' => 'update',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengubah user: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $id)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['admin', 'kepala_desa'])) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus user');
        }

        // Prevent self-deletion
        if ($currentUser->id_users == $id) {
            return back()->withErrors(['error' => 'Anda tidak dapat menghapus akun sendiri']);
        }

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            // Delete user image if exists
            if ($user->image && file_exists(storage_path('app/public/' . $user->image))) {
                unlink(storage_path('app/public/' . $user->image));
            }

            // Delete user relations if needed
            $user->units()->detach(); // Detach from units

            $user->delete();

            DB::commit();

            return back()->with('info', [
                'message' => 'User berhasil dihapus',
                'method' => 'delete',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus user: ' . $e->getMessage()]);
        }
    }

    public function show(string $id)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['admin', 'kepala_desa'])) {
            abort(403, 'Anda tidak memiliki akses untuk melihat detail user');
        }

        $user = User::with(['units'])->findOrFail($id);

        $formatted = [
            'id' => $user->id_users,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles,
            'image' => $user->image,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => optional($user->created_at)->format('Y-m-d H:i:s'),
            'updated_at' => optional($user->updated_at)->format('Y-m-d H:i:s'),
            'units' => $user->units->map(function ($unit) {
                return [
                    'id' => $unit->id_units,
                    'name' => $unit->name ?? 'Unit tidak diketahui',
                ];
            }),
        ];

        return Inertia::render('Admin/UserDetail', [
            'user' => $currentUser->only(['id_users', 'name', 'email', 'roles', 'image']),
            'userData' => $formatted,
        ]);
    }

    public function toggleStatus(string $id)
    {
        $currentUser = Auth::user();

        if (!in_array($currentUser->roles, ['admin', 'kepala_desa'])) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah status user');
        }

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            // Toggle email verification status
            $user->email_verified_at = $user->email_verified_at ? null : now();
            $user->save();

            DB::commit();

            $status = $user->email_verified_at ? 'diaktifkan' : 'dinonaktifkan';

            return back()->with('info', [
                'message' => "User berhasil {$status}",
                'method' => 'update',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengubah status user: ' . $e->getMessage()]);
        }
    }
}