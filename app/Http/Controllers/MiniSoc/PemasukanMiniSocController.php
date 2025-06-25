<?php

namespace App\Http\Controllers\MiniSoc;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PemasukanMiniSocController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, $unitId)
    {
        $user = auth()->user();

        $user->load('units');

        // Pastikan user punya akses ke unit ini via pivot
        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        // Ambil pemasukan untuk unit tertentu
        $incomes = Income::whereHas('rent.tarif.unit', function ($query) use ($unitId) {
            $query->where('id_units', $unitId);
        })
            ->with([
                'rent:id_rent,tenant_name,tarif_id,nominal,total_bayar,description,updated_at',
                'rent.tarif:id_tarif,category_name,harga_per_unit',
            ])
            ->orderBy('updated_at', 'desc')
            ->get();

        $formatted = $incomes->map(function ($item) {
            return [
                'id' => $item->rent->id_rent,
                'tanggal' => optional($item->updated_at)->format('Y-m-d'),
                'penyewa' => $item->rent->tenant_name ?? '-',
                'durasi' => (int) $item->rent->nominal ?? 0,
                'tipe_penyewa' => $item->rent->tarif->category_name ?? '-',
                'tarif_per_jam' => (int) $item->rent->tarif->harga_per_unit ?? 0,
                'total_bayar' => (int) $item->rent->total_bayar ?? 0,
                'keterangan' => $item->rent->description ?? '-',
            ];
        });

        // Pagination
        $page = $request->get('page', 1);
        $perPage = 10;

        $paged = $incomes->forPage($page, $perPage)->values();
        $totalItems = $incomes->count();

        return Inertia::render('MiniSoc/PemasukanMiniSoc', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email']),
            'pemasukan' => $formatted,
            'pagination' => [
                'total' => $totalItems,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => ceil($totalItems / $perPage),
            ]
        ]);

        // return response()->json([
        //     'unit_id' => $unitId,
        //     'user' => $user->only(['id_users', 'name', 'email']),
        //     'pemasukan' => $formatted,
        // ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $unitId)
    {
        // Masih ngebug

        $user = auth()->user();

        $user->load('units');


        // Pastikan user punya akses ke unit ini
        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        // Validasi input
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'penyewa' => 'required|string|max:255',
            'tipe' => ['required', Rule::exists('tarifs', 'category_name')->where('unit_id', $unitId)],
            'durasi' => 'required|numeric|min:0.1',
            'keterangan' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $tarif = Tarif::where('unit_id', $unitId)
                ->where('category_name', $validated['tipe'])
                ->first();

            if (!$tarif) {
                return back()->withErrors(['tipe' => 'Tarif tidak ditemukan']);
            }

            // Hitung total bayar
            $totalBayar = $validated['durasi'] * $tarif->harga_per_unit;

            // Buat rent transaction
            $rentTransaction = RentTransaction::create([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['penyewa'],
                'nominal' => $validated['durasi'],
                'total_bayar' => $totalBayar,
                'description' => $validated['keterangan'] ?? '',
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' => now(),
            ]);

            // Buat income record
            Income::create([
                'rent_id' => $rentTransaction->id_rent,
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
            return back()->with('info', [
                'message' => 'Data pemasukan berhasil ditambah',
                'method' => 'create'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambahkan data: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $unitId, string $id)
    {
        $user = auth()->user();

        $user->load('units');


        if (!$user->units->contains('id_units', $unitId)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'penyewa' => 'required|string|max:255',
            'tipe' => ['required', Rule::exists('tarifs', 'category_name')->where('unit_id', $unitId)],
            'durasi' => 'required|numeric|min:0.1',
            'keterangan' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            $tarif = Tarif::where('unit_id', $unitId)
                ->where('category_name', $validated['tipe'])
                ->firstOrFail();

            $totalBayarBaru = $validated['durasi'] * $tarif->harga_per_unit;

            $rent = RentTransaction::with('income')->findOrFail($id);
            $totalBayarLama = $rent->total_bayar ?? 0;

            $rent->update([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['penyewa'],
                'nominal' => $validated['durasi'],
                'total_bayar' => $totalBayarBaru,
                'description' => $validated['keterangan'],
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

            // Koreksi saldo awal
            $selisih = $totalBayarBaru - $totalBayarLama;
            $initialBalance = InitialBalance::where('unit_id', $unitId)->first();
            if ($initialBalance) {
                $initialBalance->update([
                    'nominal' => $initialBalance->nominal + $selisih,
                ]);
            }

            DB::commit();
            return back()->with('info', [
                'message' => 'Data pemasukan berhasil diubah',
                'method' => 'update'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui data: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $unitId, string $id)
    {
        $user = auth()->user()->load('units');

        // Ambil semua unit ID yang dimiliki user
        $unitIds = $user->units->pluck('id_units')->map(fn($val) => (int) $val)->toArray();

        // Validasi akses ke unit
        if (!in_array((int) $unitId, $unitIds)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        DB::beginTransaction();

        try {
            $rent = RentTransaction::with('income', 'tarif')->where('id_rent', $id)->firstOrFail();

            if ((int) $rent->tarif->unit_id !== (int) $unitId) {
                abort(403, 'Transaksi ini tidak berasal dari unit Anda');
            }

            // Update saldo awal jika income ada
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
                'method' => 'delete'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus data: ' . $e->getMessage());
            return back()->with('info', [
                'message' => 'Gagal menghapus data',
                'method' => 'delete'
            ]);
        }
    }
}
