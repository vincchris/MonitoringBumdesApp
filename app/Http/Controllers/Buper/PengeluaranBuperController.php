<?php

namespace App\Http\Controllers\Buper;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\InitialBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PengeluaranBuperController extends Controller
{
    public function index(Request $request, $unitId)
    {
        $user = auth()->user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $expenses = Expense::where('unit_id', $unitId)
            ->orderByDesc('created_at')
            ->get();

        $formatted = $expenses->map(fn($item) => [
            'id' => $item->id_expense,
            'tanggal' => optional($item->created_at)->format('Y-m-d'),
            'kategori' => $item->category_expense,
            'deskripsi' => $item->description ?? '-',
            'biaya' => (int) $item->nominal,
        ]);

        return Inertia::render('Buper/PengeluaranBuper', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pengeluaran' => $formatted,
        ]);
    }

    public function store(Request $request, $unitId)
    {
        $user = auth()->user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:1000',
            'biaya' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            Expense::create([
                'unit_id' => $unitId,
                'category_expense' => $validated['kategori'],
                'description' => $validated['deskripsi'],
                'nominal' => $validated['biaya'],
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => now(),
            ]);

            InitialBalance::where('unit_id', $unitId)->first()?->decrement('nominal', $validated['biaya']);

            DB::commit();
            return back()->with('info', ['message' => 'Data pengeluaran berhasil ditambah', 'method' => 'create']);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $unitId, $id)
    {
        $user = auth()->user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:1000',
            'biaya' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $expense = Expense::where('unit_id', $unitId)->where('id_expense', $id)->firstOrFail();
            $selisih = $validated['biaya'] - $expense->nominal;

            $expense->update([
                'category_expense' => $validated['kategori'],
                'description' => $validated['deskripsi'],
                'nominal' => $validated['biaya'],
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => now(),
            ]);

            InitialBalance::where('unit_id', $unitId)->first()?->decrement('nominal', $selisih);

            DB::commit();
            return back()->with('info', ['message' => 'Data pengeluaran berhasil diubah', 'method' => 'update']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update pengeluaran: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui data: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $unitId, string $id)
    {
        $user = auth()->user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        try {
            DB::beginTransaction();

            $expense = Expense::where('unit_id', $unitId)->where('id_expense', $id)->firstOrFail();
            $jumlah = $expense->nominal;

            InitialBalance::where('unit_id', $unitId)->first()?->increment('nominal', $jumlah);
            $expense->delete();

            DB::commit();
            return back()->with('info', ['message' => 'Data pengeluaran berhasil dihapus', 'method' => 'delete']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal hapus pengeluaran: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus data.']);
        }
    }
}
