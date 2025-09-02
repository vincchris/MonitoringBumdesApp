<?php

namespace App\Http\Controllers\backend\MiniSoc;

use App\Http\Controllers\Controller;
use App\Models\BalanceHistory;
use App\Models\Income;
use App\Models\InitialBalance;
use App\Models\RentTransaction;
use App\Models\Tarif;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $user = Auth::user()->load('units');

        // Pastikan user punya akses ke unit ini via pivot
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
                'tanggal' => optional($item->rent->updated_at)->format('Y-m-d'),
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
        $perPage = 5; // Diubah dari 10 menjadi 5

        $paged = $formatted->forPage($page, $perPage)->values();
        $totalItems = $formatted->count();

        return Inertia::render('MiniSoc/PemasukanMiniSoc', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pemasukan' => $paged, // Gunakan data yang sudah dipaginasi
            'tarifs' => $tarifs, // Kirim data tarif ke frontend
            'pagination' => [
                'total' => $totalItems,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => ceil($totalItems / $perPage),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $unitId)
    {
        $user = Auth::user()->load('units');

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

        DB::beginTransaction();
        try {

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
                'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

            // Buat income record
            Income::create([
                'rent_id' => $rentTransaction->id_rent,
                'created_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                'updated_at' =>  $validated['tanggal'] . ' ' . now()->format('H:i:s'),
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
        $user = Auth::user()->load('units');

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
                'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
            ]);

            if ($rent->income) {
                $rent->income->update([
                    'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                ]);
            }

            $selisih = $totalBayarBaru - $totalBayarLama;

            $lastHistory = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pendapatan')
                ->latest()
                ->first();

            if ($lastHistory) {
                // Jika nominal berubah, update saldo
                if ($selisih !== 0) {
                    $saldoSebelum = $lastHistory->saldo_sekarang;
                    $saldoSesudah = $saldoSebelum + $selisih;

                    $lastHistory->update([
                        'saldo_sebelum' => $saldoSebelum,
                        'saldo_sekarang' => $saldoSesudah,
                        'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                    ]);
                } else {
                    // Jika nominal tidak berubah, cukup update waktu saja (jika kamu mau simpan tanggal baru)
                    $lastHistory->update([
                        'updated_at' => $validated['tanggal'] . ' ' . now()->format('H:i:s'),
                    ]);
                }
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
        $user = Auth::user()->load('units');

        // Ambil semua unit ID yang dimiliki user
        $unitIds = $user->units->pluck('id_units')->map(fn($val) => (int) $val)->toArray();

        // Validasi akses ke unit
        if (!in_array((int) $unitId, $unitIds)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        try {
            DB::beginTransaction();
            $rent = RentTransaction::with('income', 'tarif')->where('id_rent', $id)->firstOrFail();

            if ((int) $rent->tarif->unit_id !== (int) $unitId) {
                abort(403, 'Transaksi ini tidak berasal dari unit Anda');
            }

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
