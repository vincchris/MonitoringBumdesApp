<?php

namespace App\Http\Controllers\backend\SewaKios;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PemasukanSewKiosController extends Controller
{
    public function index(Request $request, $unitId)
    {
        $user = Auth::user()->load('units');

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
                'penyewa' => $item->rent->tenant_name,
                'lokasi_kios' => $item->rent->tarif->category_name ?? '-',
                'durasi_sewa' => $item->rent->durasi ?? 1,
                'biaya_sewa' => $item->rent->tarif->harga_per_unit ?? 0,
                'total_pembayaran' => $item->rent->total_bayar ?? 0,
            ];
        });

        $tarifs = Tarif::where('unit_id', $unitId)
            ->where('satuan', 'tahun') // hanya ambil yang sewa tahunan (kios)
            ->get(['id_tarif', 'category_name', 'harga_per_unit']);

        return Inertia::render('Sewakios/PemasukanSewkios', [
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
            'penyewa' => 'required|string|max:255',
            'lokasi_kios' => 'required|string',
            'biaya_sewa' => 'required|numeric|min:0',
            'durasi_sewa' => 'required|integer|min:1',
            'keterangan' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Cari tarif berdasarkan lokasi_kios
            $tarif = Tarif::where('unit_id', $unitId)
                ->where('satuan', 'tahun')
                ->where('category_name', $validated['lokasi_kios'])
                ->first();

            if (!$tarif) {
                throw new \Exception('Tarif untuk lokasi kios tidak ditemukan');
            }

            $totalBayar = $validated['biaya_sewa'] * $validated['durasi_sewa'];

            $rent = RentTransaction::create([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['penyewa'],
                'nominal' => $validated['biaya_sewa'],
                'durasi' => $validated['durasi_sewa'],
                'total_bayar' => $totalBayar,
                'description' => $validated['keterangan'] ?? '',
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

            Income::create([
                'rent_id' => $rent->id_rent,
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

            $saldoSebelumnya = BalanceHistory::where('unit_id', $unitId)->latest()->value('saldo_sekarang');

            if (is_null($saldoSebelumnya)) {
                $initialBalance = InitialBalance::where('unit_id', $unitId)->first();
                $saldoSebelumnya = $initialBalance?->nominal ?? 0;
                $initialBalanceId = $initialBalance?->id_initial_balance;
            } else {
                $initialBalanceId = null;
            }

            BalanceHistory::create([
                'unit_id' => $unitId,
                'initial_balance_id' => $initialBalanceId,
                'saldo_sebelum' => $saldoSebelumnya,
                'jenis' => 'Pendapatan',
                'saldo_sekarang' => $saldoSebelumnya + $totalBayar,
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

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
            'penyewa' => 'required|string|max:255',
            'lokasi_kios' => 'required|string',
            'biaya_sewa' => 'required|numeric|min:0',
            'durasi_sewa' => 'required|integer|min:1',
            'keterangan' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $rent = RentTransaction::with(['income', 'tarif'])->findOrFail($id);
            $totalLama = $rent->total_bayar;

            $tarif = Tarif::where('unit_id', $unitId)
                ->where('satuan', 'tahun')
                ->where('category_name', $validated['lokasi_kios'])
                ->first();

            if (!$tarif) {
                throw new \Exception('Tarif untuk lokasi kios tidak ditemukan');
            }

            $totalBaru = $validated['biaya_sewa'] * $validated['durasi_sewa'];

            $rent->update([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['penyewa'],
                'nominal' => $validated['biaya_sewa'],
                'durasi' => $validated['durasi_sewa'],
                'total_bayar' => $totalBaru,
                'description' => $validated['keterangan'] ?? '',
                'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

            $selisih = $totalBaru - $totalLama;

            $lastHistory = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pendapatan')
                ->latest()
                ->first();

            if ($lastHistory) {
                $saldoSebelum = $lastHistory->saldo_sekarang;
                $saldoSesudah = $saldoSebelum + $selisih;

                $lastHistory->update([
                    'saldo_sebelum' => $saldoSebelum,
                    'saldo_sekarang' => $saldoSesudah,
                    'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
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
