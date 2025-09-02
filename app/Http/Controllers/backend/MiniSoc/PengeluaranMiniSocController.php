<?php

namespace App\Http\Controllers\backend\MiniSoc;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Expense;
use App\Models\InitialBalance;
use App\Models\Tarif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PengeluaranMiniSocController extends Controller
{
    public function index(Request $request, $unitId)
    {
        $user = Auth::user()->load('units');

        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        // Ambil semua tarif yang tersedia untuk unit ini
        $tarifs = Tarif::where('unit_id', $unitId)
            ->select('category_name', 'harga_per_unit')
            ->get()
            ->map(function ($tarif) {
                return [
                    'tipe' => $tarif->category_name,
                    'tarif' => (int) $tarif->harga_per_unit
                ];
            });

        $expenses = Expense::where('unit_id', $unitId)
            ->orderByDesc('created_at')
            ->get();

        // Format data pengeluaran
        $formatted = $expenses->map(fn($item) => [
            'id' => $item->id_expense, // Primary key adalah id_expense
            'tanggal' => optional($item->created_at)->format('Y-m-d'),
            'kategori' => $item->category_expense,
            'deskripsi' => $item->description ?? '-',
            'biaya' => (int) $item->nominal,
        ]);

        // Pagination - 5 per halaman
        $page = $request->get('page', 1);
        $perPage = 5;

        $paged = $formatted->forPage($page, $perPage)->values();
        $totalItems = $formatted->count();

        return Inertia::render('MiniSoc/PengeluaranMiniSoc', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pengeluaran' => $paged, // Ubah dari 'pemasukan' menjadi 'pengeluaran'
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

            // Update balance history terkait pengeluaran ini
            $lastHistory = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pengeluaran')
                ->latest()
                ->first();

            if ($lastHistory) {
                // Kurangi selisih dari saldo (karena pengeluaran mengurangi saldo)
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
                    ->where('saldo_sebelum', '>=', $jumlah)
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
            return back()->withErrors(['error' => 'Gagal menghapus data: ' . $e->getMessage()]);
        }
    }
}