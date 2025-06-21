<?php

namespace App\Http\Controllers\MiniSoc;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PengeluaranMiniSocController extends Controller
{
    public function index(Request $request, $unitId)
    {
        $user = auth()->user();

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $expenses = Expense::where('unit_id', $unitId)->orderBy('created_at', 'desc')->get();

        $formatted = $expenses->map(function ($item) {
            return [
                'tanggal' => $item->created_at->format('Y-m-d'),
                'kategori' => $item->category_expense,
                'deskripsi' => $item->description ?? '-',
                'biaya' => (int) $item->nominal,
            ];
        });

        return Inertia::render('MiniSoc/PengeluaranMiniSoc', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pengeluaran' => $formatted,
        ]);
    }

    public function store(Request $request, $unitId)
    {
        $user = auth()->user();

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:1000',
            'biaya' => 'required|numeric|min:0',
        ]);

        Expense::create([
            'unit_id' => $unitId,
            'category_expense' => $validated['kategori'],
            'description' => $validated['deskripsi'],
            'nominal' => $validated['biaya'],
            'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Pengeluaran berhasil ditambahkan.');
    }
}
