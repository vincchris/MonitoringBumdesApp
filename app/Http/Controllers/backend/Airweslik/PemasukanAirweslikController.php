<?php

namespace App\Http\Controllers\backend\Airweslik;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PemasukanAirweslikController extends Controller
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
            // Debug: Cek setiap item
            Log::info('Processing item:', [
                'rent_id' => $item->rent->id_rent,
                'durasi' => $item->rent->durasi,
                'tenant_name' => $item->rent->tenant_name,
                'total_bayar' => $item->rent->total_bayar,
                'tarif_info' => $item->rent->tarif ? $item->rent->tarif->toArray() : null
            ]);

            $result = [
                'id' => $item->rent->id_rent,
                'tanggal' => optional($item->updated_at)->format('Y-m-d'),
                'pelanggan' => $item->rent->tenant_name,
                'kategori' => $item->rent->tarif->category_name ?? '-',
                'pemakaian' => (int) $item->rent->nominal,
                'tarif' => (int) ($item->rent->tarif->harga_per_unit ?? 0),
                'total' => (int) ($item->rent->total_bayar ?? 0),
            ];
            return $result;
        });

        $tarifs = Tarif::where('unit_id', $unitId)
            ->where('satuan', 'm3')
            ->get(['id_tarif', 'category_name', 'harga_per_unit']);

        // Pagination
        $page = $request->get('page', 1);
        $perPage = 5; // Diubah dari 10 menjadi 5

        $paged = $formatted->forPage($page, $perPage)->values();
        $totalItems = $formatted->count();

        return Inertia::render('Airweslik/PemasukanAirweslik', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pemasukan' => $formatted,
            'tarifs' => $tarifs,
            'pagination' => [
                'total' => $totalItems,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => ceil($totalItems / $perPage),
            ]
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
                'nominal' => $validated['pemakaian'],
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
            'pemakaian' => 'required|integer|min:1',
            'tarif' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $rent = RentTransaction::with(['income', 'tarif'])->findOrFail($id);

            $totalLama = $rent->total_bayar;

            $tarif = Tarif::where('unit_id', $unitId)
                ->where('satuan', 'm3')
                ->where('category_name', $validated['kategori'])
                ->first();

            if (!$tarif) {
                throw new \Exception('Tarif air untuk kategori ini tidak ditemukan.');
            }

            $totalBaru = $validated['pemakaian'] * $validated['tarif'];
            $waktuUpdate = $validated['tanggal'] . ' ' . now()->format('H:i:s');

            // Update data sewa
            $rent->update([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['pelanggan'],
                'nominal' => $validated['pemakaian'],
                'total_bayar' => $totalBaru,
                'updated_at' => $waktuUpdate,
            ]);

            // Update income jika ada
            if ($rent->income) {
                $rent->income->update([
                    'updated_at' => $waktuUpdate,
                ]);
            }

            // Update saldo history (khusus pendapatan)
            $selisih = $totalBaru - $totalLama;

            $lastHistory = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pendapatan')
                ->latest()
                ->first();

            if ($lastHistory) {
                $saldoSebelum = $lastHistory->saldo_sebelum;
                $saldoSesudah = $saldoSebelum + $totalBaru;

                $lastHistory->update([
                    'saldo_sebelum' => $saldoSebelum,
                    'saldo_sekarang' => $saldoSesudah,
                    'updated_at' => $waktuUpdate,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('info', [
                'message' => 'Data pemasukan berhasil diubah',
                'method' => 'update',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Gagal mengubah data: ' . $e->getMessage(),
            ]);
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
