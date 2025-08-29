<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\PengurusBumdes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengurusBumdesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pengurus_bumdes = PengurusBumdes::all()->map(function ($item) {
            $item->foto_url = $item->foto_pengurus
                ? asset('storage/' . $item->foto_pengurus)
                : null;
            return $item;
        });

        return Inertia::render('admin/PengurusBumdes', [
            'pengurus_bumdes' => $pengurus_bumdes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pengurus' => 'required|string|max:255',
            'jabatan'       => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'pekerjaan'     => 'nullable|string|max:255',
            'kategori'      => 'required|string|max:255',
            'foto_pengurus' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        DB::beginTransaction();
        try {
            if ($request->hasFile('foto_pengurus')) {
                $validated['foto_pengurus'] = $request->file('foto_pengurus')->store('pengurus', 'public');
            }

            PengurusBumdes::create($validated);

            DB::commit();

            return back()->with('info', [
                'message' => 'Data Bumdes berhasil ditambahkan',
                'method'  => 'store'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Update data
     */
    public function update(Request $request, PengurusBumdes $pengurusBumdes)
    {
        $validated = $request->validate([
            'nama_pengurus' => 'required|string|max:255',
            'jabatan'       => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'pekerjaan'     => 'nullable|string|max:255',
            'kategori'      => 'required|string|max:255',
            'foto_pengurus' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        DB::beginTransaction();
        try {
            if ($request->hasFile('foto_pengurus')) {
                // hapus foto yang sebelumnya
                if ($pengurusBumdes->foto_pengurus && Storage::disk('public')->exists($pengurusBumdes->foto_pengurus)) {
                    Storage::disk('public')->delete($pengurusBumdes->foto_pengurus);
                }
                $validated['foto_pengurus'] = $request->file('foto_pengurus')->store('pengurus', 'public');
            }

            $pengurusBumdes->update($validated);

            DB::commit();

            return back()->with('info', [
                'message' => 'Data Bumdes berhasil diubah',
                'method'  => 'update'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(PengurusBumdes $pengurusBumdes)
    {
        DB::beginTransaction();
        try {
            // Hapus file foto jika ada di storage
            if ($pengurusBumdes->foto_pengurus && Storage::disk('public')->exists($pengurusBumdes->foto_pengurus)) {
                Storage::disk('public')->delete($pengurusBumdes->foto_pengurus);
            }

            // Hapus data pengurus
            $pengurusBumdes->delete();

            DB::commit();

            return back()->with('info', [
                'message' => 'Data Bumdes berhasil dihapus',
                'method'  => 'delete'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
