<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\profileBumdes;
use App\Models\profileDesa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class sekretariatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $desa = ProfileDesa::first();
        $bumdes = ProfileBumdes::first();

        return Inertia::render('admin/Sekretariat', [
            'desa' => [
                'logo_desa' => $desa?->logo_desa ? asset('storage/' . $desa->logo_desa) : null,
                'foto_kantor_desa' => $desa?->foto_kantor_desa ? asset('storage/' . $desa->foto_kantor_desa) : null,

            ],
            'bumdes' => [
                'logo_bumdes' => $bumdes?->logo_bumdes ? asset('storage/' . $bumdes->logo_bumdes) : null,
                'foto_sekretariat' => $bumdes?->foto_sekretariat ? asset('storage/' . $bumdes->foto_sekretariat) : null,

            ],
        ]);
    }


    /**
     * Simpan atau update data sekretariat desa & bumdes.
     */
    public function store(Request $request)
    {
        $request->validate([
            'logo_desa' => 'nullable|image|mimes:jpeg,jpg,png,svg|max:2048',
            'foto_kantor_desa' => 'nullable|image|mimes:jpeg,jpg,png,svg|max:4096',
            'logo_bumdes' => 'nullable|image|mimes:jpeg,jpg,png,svg|max:2048',
            'foto_sekretariat' => 'nullable|image|mimes:jpeg,jpg,png,svg|max:4096',
        ]);

        DB::beginTransaction();
        try {
            $desa = profileDesa::first() ?? new profileDesa();
            $bumdes = profileBumdes::first() ?? new profileBumdes();

            $updatedFields = [];

            // Logo Desa
            if ($request->hasFile('logo_desa')) {
                if ($desa->logo_desa && Storage::disk('public')->exists($desa->logo_desa)) {
                    Storage::disk('public')->delete($desa->logo_desa);
                }
                $desa->logo_desa = $request->file('logo_desa')->store('desa', 'public');
                $updatedFields[] = 'Logo Desa';
            }

            // Foto Kantor Desa
            if ($request->hasFile('foto_kantor_desa')) {
                if ($desa->foto_kantor_desa && Storage::disk('public')->exists($desa->foto_kantor_desa)) {
                    Storage::disk('public')->delete($desa->foto_kantor_desa);
                }
                $desa->foto_kantor_desa = $request->file('foto_kantor_desa')->store('desa', 'public');
                $updatedFields[] = 'Foto Kantor Desa';
            }

            // Logo BUMDes
            if ($request->hasFile('logo_bumdes')) {
                if ($bumdes->logo_bumdes && Storage::disk('public')->exists($bumdes->logo_bumdes)) {
                    Storage::disk('public')->delete($bumdes->logo_bumdes);
                }
                $bumdes->logo_bumdes = $request->file('logo_bumdes')->store('bumdes', 'public');
                $updatedFields[] = 'Logo BUMDes';
            }

            // Foto Sekretariat BUMDes
            if ($request->hasFile('foto_sekretariat')) {
                if ($bumdes->foto_sekretariat && Storage::disk('public')->exists($bumdes->foto_sekretariat)) {
                    Storage::disk('public')->delete($bumdes->foto_sekretariat);
                }
                $bumdes->foto_sekretariat = $request->file('foto_sekretariat')->store('bumdes', 'public');
                $updatedFields[] = 'Foto Sekretariat BUMDes';
            }

            $desa->save();
            $bumdes->save();

            DB::commit();

            return back()->with('info', [
                'message' => !empty($updatedFields)
                    ? 'Berhasil memperbarui: ' . implode(', ', $updatedFields)
                    : 'Tidak ada perubahan pada gambar',
                'method' => 'create'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()
            ]);
        }
    }
}
