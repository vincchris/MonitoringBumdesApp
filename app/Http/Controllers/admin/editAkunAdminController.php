<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;

class EditAkunAdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $admin = Auth::user() && Auth::user()->roles === 'admin'
                ? Auth::user()
                : User::where('roles', 'admin')->first();

            if (!$admin) {
                $admin = (object) [
                    'id' => 1,
                    'name' => 'Administrator Desa',
                    'email' => 'admin@desadigital.id',
                    'roles' => 'admin',
                    'created_at' => now(),
                    'updated_at' => now(),
                    'email_verified_at' => now(),
                ];
            }

            return Inertia::render('admin/EditAkunAdmin', [
                'admin' => [
                    'id' => $admin->id_users,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'roles' => $admin->roles ?? 'admin',
                    'created_at' => $admin->created_at ? Carbon::parse($admin->created_at)->format('d M Y') : 'Today',
                    'updated_at' => $admin->updated_at ? Carbon::parse($admin->updated_at)->diffForHumans() : 'Just now',
                    'email_verified' => isset($admin->email_verified_at) && $admin->email_verified_at !== null,
                ],
                'meta' => [
                    'title' => 'Edit Akun Admin',
                    'description' => 'Kelola informasi profil administrator sistem',
                ],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('flash', [
                'info' => [
                    'message' => 'Terjadi kesalahan saat memuat data admin.',
                    'method'  => 'error',
                ],
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
                'regex:/^[a-zA-Z\s]+$/',
            ],
            'email' => [
                'required',
                'email:rfc,dns',
                'max:255',
                'unique:users,email,' . $id . ',id_users',
            ],
            'password' => [
                'nullable',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->uncompromised(),
            ],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.min' => 'Nama lengkap minimal 2 karakter.',
            'name.regex' => 'Nama lengkap hanya boleh berisi huruf dan spasi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Alamat email sudah digunakan oleh pengguna lain.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.mixed_case' => 'Password harus mengandung huruf besar dan kecil.',
            'password.numbers' => 'Password harus mengandung minimal satu angka.',
            'password.uncompromised' => 'Password terlalu umum, silakan gunakan yang lebih aman.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput()
                ->with('flash', [
                    'info' => [
                        'message' => 'Terjadi kesalahan validasi data.',
                        'method'  => 'error',
                    ],
                ]);
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            if (!$user) {
                return redirect()->back()->with('flash', [
                    'info' => [
                        'message' => 'Admin tidak ditemukan.',
                        'method'  => 'error',
                    ],
                ]);
            }

           if (!empty($validated['password'])) {
                $user['password'] = Hash::make($validated['password']);
            }

            $user->name  = $validated['name'];
            $user->email = $validated['email'];

            $user->update();



            DB::commit();

            return redirect()->back()->with('flash', [
                'info' => [
                    'message' => 'Akun admin berhasil diperbarui.',
                    'method'  => 'success',
                ],
            ]);
        } catch (QueryException $e) {
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['email' => 'Alamat email sudah digunakan.'])
                ->withInput()
                ->with('flash', [
                    'info' => [
                        'message' => 'Kesalahan database saat update akun.',
                        'method'  => 'error',
                    ],
                ]);
        } catch (Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('flash', [
                    'info' => [
                        'message' => 'Terjadi kesalahan yang tidak terduga.',
                        'method'  => 'error',
                    ],
                ])
                ->withInput();
        }
    }
}
