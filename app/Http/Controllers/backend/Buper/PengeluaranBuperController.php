<?php

namespace App\Http\Controllers\backend\Buper;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Expense;
use App\Models\InitialBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PengeluaranBuperController extends Controller
{
    
    public function index(Request $request, $unitId)
    {
        
        $user = Auth::user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        $expenses = Expense::where('unit_id', $unitId)
            ->orderByDesc('created_at')
            ->get();

        // Fix: Gunakan primary key yang benar sesuai model
        $formatted = $expenses->map(fn($item) => [
            'id' => $item->id_expense, // Primary key adalah id_expense
            'tanggal' => optional($item->created_at)->format('Y-m-d'),
            'kategori' => $item->category_expense,
            'deskripsi' => $item->description ?? '-',
            'biaya' => (int) $item->nominal,
        ]);

        // Pagination
        $page = $request->get('page', 1);
        $perPage = 10;

        $paged = $expenses->forPage($page, $perPage)->values();
        $totalItems = $expenses->count();

        return Inertia::render('Buper/PengeluaranBuper', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pengeluaran' => $formatted,
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
        $user = Auth::user()->load('units');

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

            $waktuTransaksi = $validated['tanggal'] . ' ' . now()->format('H:i:s');
            $saldoSebelumnya = BalanceHistory::where('unit_id', $unitId)->latest()->value('saldo_sekarang');

            if (is_null($saldoSebelumnya)) {
                $initialBalance = InitialBalance::where('unit_id', $unitId)->first();
                $saldoSebelumnya = $initialBalance?->nominal ?? 0;
                $initialBalanceId = $initialBalance?->id_initial_balance;
            } else {
                $initialBalanceId = null;
            }
            Expense::create([
                'unit_id' => $unitId,
                'category_expense' => $validated['kategori'],
                'description' => $validated['deskripsi'],
                'nominal' => $validated['biaya'],
                'created_at' => $waktuTransaksi,
                'updated_at' => $waktuTransaksi,
            ]);
            BalanceHistory::create([
                'unit_id' => $unitId,
                'initial_balance_id' => $initialBalanceId,
                'saldo_sebelum' => $saldoSebelumnya,
                'jenis' => 'Pengeluaran',
                'saldo_sekarang' => $saldoSebelumnya - $validated['biaya'],
                'created_at' => $waktuTransaksi,
                'updated_at' => $waktuTransaksi,
            ]);
            DB::commit();

            return back()->with('info', [
                'message' => 'Data pengeluaran berhasil ditambah',
                'method' => 'create'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $unitId, $id)
    {
        $user = Auth::user()->load('units');

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

            $expense = Expense::where('unit_id', $unitId)
                ->where('id_expense', $id)
                ->firstOrFail();

            $biayaLama = $expense->nominal;
            $biayaBaru = $validated['biaya'];
            $selisih = $biayaBaru - $biayaLama;
            $waktuUpdate = $validated['tanggal'] . ' ' . now()->format('H:i:s');

            $expense->update([
                'category_expense' => $validated['kategori'],
                'description' => $validated['deskripsi'],
                'nominal' => $biayaBaru,
                'updated_at' => $waktuUpdate,
            ]);

            $lastHistory = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pengeluaran')
                ->latest()
                ->first();

            if ($lastHistory) {
                $lastHistory->update([
                    'saldo_sekarang' => $lastHistory->saldo_sekarang - $selisih,
                    'updated_at' => $waktuUpdate,
                ]);
            }

            DB::commit();

            return back()->with('info', [
                'message' => 'Data pengeluaran berhasil diubah',
                'method' => 'update'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update pengeluaran: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui data: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $unitId, string $id)
    {
        $user = Auth::user()->load('units');

        $unitIds = $user->units->pluck('id_units')->map(fn($val) => (int) $val)->toArray();

        // Validasi akses ke unit
        if (!in_array((int) $unitId, $unitIds)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        try {
            DB::transaction(function () use ($unitId, $id) {
                $expense = Expense::where('id_expense', $id)
                    ->where('unit_id', $unitId)
                    ->firstOrFail();

                $jumlah = $expense->nominal;

                // Cari histori pengeluaran yang sesuai untuk dihapus
                $history = BalanceHistory::where('unit_id', $unitId)
                    ->where('jenis', 'Pengeluaran')
                    ->where('saldo_sebelum', '>=', $jumlah) // bantu filter aman
                    ->where('saldo_sekarang', DB::raw('saldo_sebelum - ' . $jumlah))
                    ->orderByDesc('created_at')
                    ->first();

                if (!$history) {
                    throw new \Exception('Tidak ditemukan histori pengeluaran yang sesuai.');
                }

                // Hapus histori dan pengeluaran
                $history->delete();
                $expense->delete();
            });

            return back()->with('info', [
                'message' => 'Data pengeluaran berhasil dihapus',
                'method' => 'delete',
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal hapus pengeluaran: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus data.']);
        }
    }
}
