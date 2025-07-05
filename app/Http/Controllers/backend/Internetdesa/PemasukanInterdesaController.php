<?php

namespace App\Http\Controllers\backend\Internetdesa;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PemasukanInterdesaController extends Controller
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
                'pelanggan' => $item->rent->tenant_name ?? 'Pelanggan tidak diketahui',
                'kategori' => $item->rent->tarif->category_name ?? 'kategori tidak diketahui',
                'durasi' => (int)($item->rent->nominal ?? 0),
                'tarif' => (int) ($item->rent->tarif->harga_per_unit ?? 0),
                'total' => (int) ($item->rent->total_bayar ?? 0),
            ];
        });

        $tarifs = Tarif::where('unit_id', $unitId)
            ->where('satuan', 'bulan')
            ->get(['id_tarif', 'category_name', 'harga_per_unit']);

        return Inertia::render('Internetdesa/PemasukanInterdesa', [
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
            'durasi' => 'required|integer|min:1',
            'tarif' => 'required|numeric|min:1',
        ]);

        try {
            DB::beginTransaction();

            $tarif = Tarif::where('unit_id', $unitId)
                ->where('satuan', 'bulan')
                ->where('category_name', $validated['kategori'])
                ->first();

            if (!$tarif) {
                throw new \Exception('Tarif Internet untuk kategori ini tidak ditemukan');
            }

            $totalBayar = $validated['durasi'] * $validated['tarif'];

            $rent = RentTransaction::create([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['pelanggan'],
                'nominal' => $validated['durasi'],
                'total_bayar' => $totalBayar,
                'description' => '',
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
            'pelanggan' => 'required|string|max:255',
            'kategori' => 'required|string',
            'durasi' => 'required|integer|min:1',
            'tarif' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();
            $rent = RentTransaction::with(['income', 'tarif'])->findOrFail($id);
            $totalLama = $rent->total_bayar;

            $tarif = Tarif::where('unit_id', $unitId)
                ->where('satuan', 'bulan')
                ->where('category_name', $validated['kategori'])
                ->first();

            if (!$tarif) {
                throw new \Exception('Tarif Internet desa untuk kategori ini tidak ditemukan');
            }

            $totalBaru = $validated['durasi'] * $validated['tarif'];

            $waktuUpdate = $validated['tanggal'] . ' ' . now()->format('H:i:s');

            $rent->update([
                'tarif_id'     => $tarif->id_tarif,
                'tenant_name'  => $validated['pelanggan'],
                'nominal'      => $validated['durasi'],
                'total_bayar'  => $totalBaru,
                'description'  => '',
                'updated_at'   => $waktuUpdate,
            ]);

            if ($rent->income) {
                $rent->income->update([
                    'updated_at' => $waktuUpdate,
                ]);
            }

            $selisih = $totalBaru - $totalLama;
            $lastHistory = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pendapatan')
                ->latest()
                ->first();

            if ($lastHistory) {
                $saldoSebelum = $lastHistory->saldo_sekarang;

                if ($selisih !== 0) {
                    // Jika ada perubahan nominal, update saldo dan waktu
                    $saldoSesudah = $saldoSebelum + $selisih;

                    $lastHistory->update([
                        'saldo_sebelum'   => $saldoSebelum,
                        'saldo_sekarang' => $saldoSesudah,
                        'updated_at'      => $waktuUpdate,
                    ]);
                } else {
                    // Jika nominal tidak berubah, hanya update waktu
                    $lastHistory->update([
                        'updated_at' => $waktuUpdate,
                    ]);
                }
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

            $totalBayar = $rent->total_bayar ?? 0;

            if ($rent->income) {
                // Ambil histori saldo terakhir
                $lastHistory = BalanceHistory::where('unit_id', $unitId)
                    ->latest()
                    ->first();

                // Cek apakah histori terakhir ini punya nilai saldo_setelah yang sama (karena transaksi pemasukan ini)
                if ($lastHistory && $lastHistory->saldo_sekarang == ($lastHistory->saldo_sebelum + $totalBayar)) {
                    $lastHistory->delete();
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
