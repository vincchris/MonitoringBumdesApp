<?php

namespace App\Http\Controllers\Buper;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PemasukanBuperController extends Controller
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
                'keterangan' => $item->rent->tenant_name,
                'jumlah_peserta' => (int) $item->rent->nominal,
                'biaya_sewa' => $item->rent->tarif->harga_per_unit ?? 0,
            ];
        });

        $tarifs = Tarif::where('unit_id', $unitId)
            ->whereIn('category_name', ['>300', '<=300'])
            ->get(['category_name', 'harga_per_unit']);

        return Inertia::render('Buper/PemasukanBuper', [
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
            'keterangan' => 'required|string|max:255',
            'jumlah_peserta' => 'required|integer|min:1',
            'biaya_sewa' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $kategori = $validated['jumlah_peserta'] > 300 ? '>300' : '<=300';
            $tarif = Tarif::where('unit_id', $unitId)->where('category_name', $kategori)->first();

            if (!$tarif) {
                throw new \Exception('Tarif tidak ditemukan');
            }

            $rent = RentTransaction::create([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['keterangan'],
                'nominal' => $validated['jumlah_peserta'],
                'total_bayar' => $validated['biaya_sewa'],
                'description' => '',
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
                    'nominal' => $initialBalance->nominal + $validated['biaya_sewa'],
                ]);
            }

            // dd($totalBayar);

            DB::commit();

            return back()->with('info', [
                'message' => 'Data pemasukan berhasil ditambah',
                'method' => 'create',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, string $unitId, string $id)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'jumlah_peserta' => 'required|integer|min:1',
            'biaya_sewa' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {

            $rent = RentTransaction::with(['income', 'tarif'])->findOrFail($id);
            $totalLama = $rent->total_bayar;

            $kategori = $validated['jumlah_peserta'] > 300 ? '>300' : '<=300';
            $tarif = Tarif::where('unit_id', $unitId)->where('category_name', $kategori)->first();

            if (!$tarif) {
                throw new \Exception('Tarif tidak ditemukan');
            }

            $totalBaru = $validated['biaya_sewa'];

            $rent->update([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['keterangan'],
                'nominal' => $validated['jumlah_peserta'],
                'total_bayar' => $totalBaru,
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

            $selisih = $totalBaru - $totalLama;
            $initialBalance = InitialBalance::where('unit_id', $unitId)->first();
            if ($initialBalance) {
                $initialBalance->update([
                    'nominal' => $initialBalance->nominal + $selisih,
                ]);
            }

            DB::commit();
            return back()->with('info', [
                'message' => 'Data pemasukan berhasil diubah',
                'method' => 'update',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengubah data: ' . $e->getMessage()]);
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
            return back()->with('info', [
                'message' => 'Data pemasukan berhasil dihapus',
                'method' => 'delete',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus data: ' . $e->getMessage()]);
        }
    }
}
