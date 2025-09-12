<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\profileBumdes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class tentangBumdesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $profile = profileBumdes::get()->first();
        return Inertia::render('admin/TentangBumdes', [
            'profile' => $profile
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'kepala_bumdes' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'keunggulan' => 'required|string',
            'visi' => 'required|string',
            'misi' => 'required|string',
            'foto_kepala_bumdes' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        $data = [
            'kepala_bumdes' => $request->kepala_bumdes,
            'email' => $request->email,
            'telepon' => $request->telepon,
            'alamat' => $request->alamat,
            'keunggulan' => $request->keunggulan,
            'visi' => $request->visi,
            'misi' => $request->misi,
            'updated_at' => now(),
        ];

        // Handle foto upload
        if ($request->hasFile('foto_kepala_bumdes')) {
            // Get current profile to delete old image
            $profile = profileBumdes::find($id);

            // Delete old image if exists
            if ($profile && $profile->foto_kepala_bumdes && Storage::disk('public')->exists($profile->foto_kepala_bumdes)) {
                Storage::disk('public')->delete($profile->foto_kepala_bumdes);
            }

            // Store new image
            $foto = $request->file('foto_kepala_bumdes');
            $filename = 'kepala_bumdes_' . time() . '.' . $foto->getClientOriginalExtension();
            $path = $foto->storeAs('bumdes/kepala', $filename, 'public');

            $data['foto_kepala_bumdes'] = $path;
        }

        profileBumdes::where('id', $id)->update($data);

        return back()->with('info', [
            'message' => 'Data Bumdes berhasil diperbarui',
            'method' => 'update'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}