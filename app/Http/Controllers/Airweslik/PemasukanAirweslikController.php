<?php

namespace App\Http\Controllers\Airweslik;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PemasukanAirweslikController extends Controller
{
    public function index(Request $request, $unitId)
    {
        $user = auth()->user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $incomes = Income::whereHas('rent.tarif', fn($q) => $q->where('unit_id', $unitId))
            ->with(['rent.tarif'])
            ->latest('updated_at')
            ->get();

        $formatted = $incomes->map(function ($item) {
            return [
                'id' => $item->rent->id_rent,
                'tanggal' => optional($item->updated_at)->format('Y-m-d'),
                'pelanggan' => $item->rent->tenant_name,
                'kategori' => $item->rent->tarif->category_name ?? '-',
                'pemakaian' => $item->rent->durasi,
                'tarif' => $item->rent->tarif->harga_per_unit ?? 0,
                'total' => $item->rent->total_bayar ?? 0,
            ];
        });

        $tarifs = Tarif::where('unit_id', $unitId)
            ->where('satuan', 'm3') // Hanya ambil tarif air (per m³)
            ->get(['id_tarif', 'category_name', 'harga_per_unit']);

        return Inertia::render('Airweslik/PemasukanAirweslik', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pemasukan' => $formatted,
            'tarifs' => $tarifs,
        ]);
    }

    public function store(Request $request, $unitId)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'pelanggan' => 'required|string|max:255',
            'kategori' => 'required|string',
            'pemakaian' => 'required|integer|min:1',
            'tarif' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $tarif = Tarif::where('unit_id', $unitId)
                ->where('satuan', 'm3')
                ->where('category_name', $validated['kategori'])
                ->first();

            if (!$tarif) {
                throw new \Exception('Tarif air untuk kategori ini tidak ditemukan');
            }

            $totalBayar = $validated['pemakaian'] * $validated['tarif'];

            $rent = RentTransaction::create([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['pelanggan'],
                'nominal' => $validated['tarif'],
                'durasi' => $validated['pemakaian'],
                'total_bayar' => $totalBayar,
                'description' => '', // Tidak pakai keterangan
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => now(),
            ]);

            Income::create([
                'rent_id' => $rent->id_rent,
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => now(),
            ]);

            $initialBalance = InitialBalance::where('unit_id', $unitId)->first();
            if ($initialBalance) {
                $initialBalance->update([
                    'nominal' => $initialBalance->nominal + $totalBayar,
                ]);
            }

            DB::commit();
            return redirect()->back()->with('info', [
                'message' => 'Data pemasukan berhasil ditambah',
                'method' => 'create',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, string $unitId, string $id)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'pelanggan' => 'required|string|max:255',
            'kategori' => 'required|string',
            'pemakaian' => 'required|integer|min:1',
            'tarif' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $rent = RentTransaction::with(['income', 'tarif'])->findOrFail($id);
            $totalLama = $rent->total_bayar;

            $tarif = Tarif::where('unit_id', $unitId)
                ->where('satuan', 'm3')
                ->where('category_name', $validated['kategori'])
                ->first();

            if (!$tarif) {
                throw new \Exception('Tarif air untuk kategori ini tidak ditemukan');
            }

            $totalBaru = $validated['pemakaian'] * $validated['tarif'];

            $rent->update([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['pelanggan'],
                'nominal' => $validated['tarif'],
                'durasi' => $validated['pemakaian'],
                'total_bayar' => $totalBaru,
                'description' => '',
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => now(),
            ]);

            $selisih = $totalBaru - $totalLama;
            $initialBalance = InitialBalance::where('unit_id', $unitId)->first();
            if ($initialBalance) {
                $initialBalance->update([
                    'nominal' => $initialBalance->nominal + $selisih,
                ]);
            }

            DB::commit();
            return redirect()->back()->with('info', [
                'message' => 'Data pemasukan berhasil diubah',
                'method' => 'update',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal mengubah data: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $unitId, string $id)
    {
        try {
            DB::beginTransaction();

            $rent = RentTransaction::with(['income', 'tarif'])->findOrFail($id);

            if ($rent->income) {
                $initialBalance = InitialBalance::where('unit_id', $unitId)->first();

                if ($initialBalance) {
                    $initialBalance->update([
                        'nominal' => $initialBalance->nominal - $rent->total_bayar,
                    ]);
                }

                $rent->income->delete();
            }

            $rent->delete();

            DB::commit();
            return redirect()->back()->with('info', [
                'message' => 'Data pemasukan berhasil dihapus',
                'method' => 'delete',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal menghapus data: ' . $e->getMessage()]);
        }
    }
}
