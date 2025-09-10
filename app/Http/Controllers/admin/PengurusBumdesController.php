<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\PengurusBumdes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pengurus' => 'required|string|max:255',
            'jabatan'       => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'pekerjaan'     => 'nullable|string|max:255',
            'kategori'      => 'required|string|max:255',
            'foto_pengurus' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // Handle file upload
            if ($request->hasFile('foto_pengurus')) {
                $file = $request->file('foto_pengurus');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $validated['foto_pengurus'] = $file->storeAs('pengurus', $filename, 'public');
            }

            PengurusBumdes::create($validated);

            DB::commit();

            return back()->with('info', [
                'message' => 'Data pengurus BUMDes berhasil ditambahkan',
                'method'  => 'create'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating pengurus bumdes: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $pengurusBumdes = PengurusBumdes::findOrFail($id);

        $validated = $request->validate([
            'nama_pengurus' => 'required|string|max:255',
            'jabatan'       => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'pekerjaan'     => 'nullable|string|max:255',
            'kategori'      => 'required|string|max:255',
            'foto_pengurus' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        DB::beginTransaction();
        try {
            if ($request->hasFile('foto_pengurus')) {
                if ($pengurusBumdes->foto_pengurus && Storage::disk('public')->exists($pengurusBumdes->foto_pengurus)) {
                    Storage::disk('public')->delete($pengurusBumdes->foto_pengurus);
                }

                $file = $request->file('foto_pengurus');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $validated['foto_pengurus'] = $file->storeAs('pengurus', $filename, 'public');
            } else {
                unset($validated['foto_pengurus']);
            }

            $pengurusBumdes->update($validated);
            DB::commit();

            return back()->with('info', [
                'message' => 'Data pengurus BUMDes berhasil diperbarui',
                'method'  => 'update'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating pengurus bumdes: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat memperbarui data.'
            ]);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $pengurusBumdes = PengurusBumdes::findOrFail($id);

        DB::beginTransaction();
        try {
            // Delete photo file if exists
            if ($pengurusBumdes->foto_pengurus && Storage::disk('public')->exists($pengurusBumdes->foto_pengurus)) {
                Storage::disk('public')->delete($pengurusBumdes->foto_pengurus);
            }

            // Delete the record
            $pengurusBumdes->delete();

            DB::commit();

            return back()->with('info', [
                'message' => 'Data pengurus BUMDes berhasil dihapus',
                'method'  => 'delete'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting pengurus bumdes: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat menghapus data: ' . $e->getMessage()
            ]);
        }
    }
}
