<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\profileBumdes;
use Illuminate\Http\Request;
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
            'keunggulan' => 'required|string',
            'visi' => 'required|string',
            'misi' => 'required|string',
        ]);

        profileBumdes::where('id', $id)->update([
            'keunggulan' => $request->keunggulan,
            'visi' => $request->visi,
            'misi' => $request->misi,
            'updated_at' => now(),
        ]);
        return back()->with('info', [
            'message' => 'Data Bumdes berhasil diubah',
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
