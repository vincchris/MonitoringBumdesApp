<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\profileDesa;
use App\Models\profileBumdes;
use Illuminate\Support\Facades\DB;

class DataUmumController extends Controller
{
    public function index()
    {
        $desa = profileDesa::first();
        $bumdes = profileBumdes::first();

        return Inertia::render('admin/EditDataUmum', [
            'desa' => $desa,
            'bumdes' => $bumdes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Desa
            'nama_desa' => 'required|string|max:255',
            'alamat_desa' => 'nullable|string|max:500',
            'kepala_desa' => 'required|string|max:255',
            'periode_kepala_desa' => 'nullable|string|max:255',
            'email_desa' => 'nullable|email|max:255',
            'telepon_desa' => 'nullable|string|max:20',
            'luas_desa' => 'nullable|numeric|min:0',

            // Bumdes
            'nama_bumdes' => 'required|string|max:255',
            'kepala_bumdes' => 'required|string|max:255',
            'alamat_bumdes' => 'nullable|string|max:500',
            'email_bumdes' => 'nullable|email|max:255',
            'telepon_bumdes' => 'nullable|string|max:20',
        ]);

        DB::beginTransaction();

        try {
            // Create or update Desa data
            $desa = profileDesa::create([
                'nama_desa' => $validated['nama_desa'],
                'alamat' => $validated['alamat_desa'],
                'kepala_desa' => $validated['kepala_desa'],
                'periode_kepala_desa' => $validated['periode_kepala_desa'],
                'email' => $validated['email_desa'],
                'telepon' => $validated['telepon_desa'],
                'luas_desa' => $validated['luas_desa'] ? (float) $validated['luas_desa'] : null,
            ]);

            // Create or update Bumdes data
            profileBumdes::create([
                'desa_id' => $desa->id,
                'nama_bumdes' => $validated['nama_bumdes'],
                'kepala_bumdes' => $validated['kepala_bumdes'],
                'alamat' => $validated['alamat_bumdes'],
                'email' => $validated['email_bumdes'],
                'telepon' => $validated['telepon_bumdes'],
            ]);

            DB::commit();

            return redirect()->route('data-umum.index')->with('success', 'Data umum berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollback();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            // Desa
            'nama_desa' => 'required|string|max:255',
            'alamat_desa' => 'nullable|string|max:500',
            'kepala_desa' => 'required|string|max:255',
            'periode_kepala_desa' => 'nullable|string|max:255',
            'email_desa' => 'nullable|email|max:255',
            'telepon_desa' => 'nullable|string|max:20',
            'luas_desa' => 'nullable|numeric|min:0',

            // Bumdes
            'nama_bumdes' => 'required|string|max:255',
            'kepala_bumdes' => 'required|string|max:255',
            'alamat_bumdes' => 'nullable|string|max:500',
            'email_bumdes' => 'nullable|email|max:255',
            'telepon_bumdes' => 'nullable|string|max:20',
        ]);

        DB::beginTransaction();

        try {
            // Update Desa data
            $desa = profileDesa::findOrFail($id);
            $desa->update([
                'nama_desa' => $validated['nama_desa'],
                'alamat' => $validated['alamat_desa'],
                'kepala_desa' => $validated['kepala_desa'],
                'periode_kepala_desa' => $validated['periode_kepala_desa'],
                'email' => $validated['email_desa'],
                'telepon' => $validated['telepon_desa'],
                'luas_desa' => $validated['luas_desa'] ? (float) $validated['luas_desa'] : null,
            ]);

            // Update or create Bumdes data
            $bumdes = profileBumdes::where('desa_id', $desa->id)->first();

            if ($bumdes) {
                $bumdes->update([
                    'nama_bumdes' => $validated['nama_bumdes'],
                    'kepala_bumdes' => $validated['kepala_bumdes'],
                    'alamat' => $validated['alamat_bumdes'],
                    'email' => $validated['email_bumdes'],
                    'telepon' => $validated['telepon_bumdes'],
                ]);
            } else {
                profileBumdes::create([
                    'desa_id' => $desa->id,
                    'nama_bumdes' => $validated['nama_bumdes'],
                    'kepala_bumdes' => $validated['kepala_bumdes'],
                    'alamat' => $validated['alamat_bumdes'],
                    'email' => $validated['email_bumdes'],
                    'telepon' => $validated['telepon_bumdes'],
                ]);
            }

            DB::commit();

            return redirect()->route('data-umum.index')->with('success', 'Data umum berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollback();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show($id)
    {
        $desa = profileDesa::findOrFail($id);
        $bumdes = profileBumdes::where('desa_id', $desa->id)->first();

        return response()->json([
            'desa' => $desa,
            'bumdes' => $bumdes,
        ]);
    }
}
