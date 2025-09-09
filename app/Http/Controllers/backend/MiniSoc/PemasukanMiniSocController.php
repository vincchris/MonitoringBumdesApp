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
use Carbon\Carbon;

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
                'rent:id_rent,tenant_name,tarif_id,nominal,total_bayar,description,jam_mulai,jam_selesai,created_at,updated_at',
                'rent.tarif:id_tarif,category_name,harga_per_unit',
            ])
            ->orderBy('updated_at', 'desc')
            ->get();

        $formatted = $incomes->map(function ($item) {
            return [
                'id' => $item->rent->id_rent,
                'tanggal' => optional($item->rent->updated_at)->format('Y-m-d'),
                'jam_mulai' => $item->rent->jam_mulai ?? '',
                'jam_selesai' => $item->rent->jam_selesai ?? '',
                'penyewa' => $item->rent->tenant_name ?? '-',
                'durasi' => (float) $item->rent->nominal ?? 0,
                'tipe_penyewa' => $item->rent->tarif->category_name ?? '-',
                'tarif_per_jam' => (int) $item->rent->tarif->harga_per_unit ?? 0,
                'total_bayar' => (int) $item->rent->total_bayar ?? 0,
                'keterangan' => $item->rent->description ?? '-',
            ];
        });

        // Pagination
        $page = $request->get('page', 1);
        $perPage = 5;

        $paged = $formatted->forPage($page, $perPage)->values();
        $totalItems = $formatted->count();

        return Inertia::render('MiniSoc/PemasukanMiniSoc', [
            'unit_id' => $unitId,
            'user' => $user->only(['id_users', 'name', 'email', 'roles', 'image']),
            'pemasukan' => $paged,
            'tarifs' => $tarifs,
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
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i',
            'penyewa' => 'required|string|max:255',
            'tipe' => ['required', Rule::exists('tarifs', 'category_name')->where('unit_id', $unitId)],
            'durasi' => 'required|numeric|min:0.1',
            'keterangan' => 'nullable|string|max:500',
        ]);

        // Validasi waktu booking tidak overlap
        $this->validateBookingTime($validated['tanggal'], $validated['jam_mulai'], $validated['jam_selesai'], $unitId);

        DB::beginTransaction();
        try {
            $tarif = Tarif::where('unit_id', $unitId)
                ->where('category_name', $validated['tipe'])
                ->first();

            if (!$tarif) {
                return back()->withErrors(['tipe' => 'Tarif tidak ditemukan']);
            }

            // Hitung durasi otomatis berdasarkan jam mulai dan selesai
            $jamMulai = Carbon::parse($validated['jam_mulai']);
            $jamSelesai = Carbon::parse( $validated['jam_selesai']);

            // Handle cross-midnight bookings (misal 23:00 - 02:00)
            if ($jamSelesai->lessThanOrEqualTo($jamMulai)) {
                $jamSelesai->addDay();
            }

            $durasi = $jamMulai->diffInHours($jamSelesai, true); // true untuk float result
            $totalBayar = $durasi * $tarif->harga_per_unit;

            // Buat rent transaction
            $rentTransaction = RentTransaction::create([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['penyewa'],
                'nominal' => $durasi,
                'total_bayar' => $totalBayar,
                'description' => $validated['keterangan'] ?? '',
                'jam_mulai' => $validated['jam_mulai'],
                'jam_selesai' => $validated['jam_selesai'],
                'created_at' => Carbon::parse($validated['tanggal'] . ' ' . $validated['jam_mulai']),
                'updated_at' => Carbon::parse($validated['tanggal'] . ' ' . $validated['jam_mulai']),
            ]);

            // Buat income record
            Income::create([
                'rent_id' => $rentTransaction->id_rent,
                'created_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
                'updated_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
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
                'created_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
                'updated_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
            ]);

            DB::commit();
            return back()->with('info', [
                'message' => 'Booking berhasil dibuat untuk ' . $validated['penyewa'] . ' (' . $validated['jam_mulai'] . ' - ' . $validated['jam_selesai'] . ')',
                'method' => 'create'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal membuat booking: ' . $e->getMessage()]);
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
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i',
            'penyewa' => 'required|string|max:255',
            'tipe' => ['required', Rule::exists('tarifs', 'category_name')->where('unit_id', $unitId)],
            'durasi' => 'required|numeric|min:0.1',
            'keterangan' => 'nullable|string|max:500',
        ]);

        // Validasi waktu booking tidak overlap (kecuali dengan dirinya sendiri)
        $this->validateBookingTime($validated['tanggal'], $validated['jam_mulai'], $validated['jam_selesai'], $unitId, $id);

        DB::beginTransaction();

        try {
            $tarif = Tarif::where('unit_id', $unitId)
                ->where('category_name', $validated['tipe'])
                ->firstOrFail();

            // Hitung durasi berdasarkan jam
            $jamMulai = Carbon::createFromFormat('H:i', $validated['jam_mulai']);
            $jamSelesai = Carbon::createFromFormat('H:i', $validated['jam_selesai']);

            if ($jamSelesai->lessThanOrEqualTo($jamMulai)) {
                $jamSelesai->addDay();
            }

            $durasi = $jamMulai->diffInHours($jamSelesai, true);
            $totalBayarBaru = $durasi * $tarif->harga_per_unit;

            $rent = RentTransaction::with('income')->findOrFail($id);
            $totalBayarLama = $rent->total_bayar ?? 0;

            $rent->update([
                'tarif_id' => $tarif->id_tarif,
                'tenant_name' => $validated['penyewa'],
                'nominal' => $durasi,
                'total_bayar' => $totalBayarBaru,
                'description' => $validated['keterangan'],
                'jam_mulai' => $validated['jam_mulai'],
                'jam_selesai' => $validated['jam_selesai'],
                'updated_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
            ]);

            if ($rent->income) {
                $rent->income->update([
                    'updated_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
                ]);
            }

            $selisih = $totalBayarBaru - $totalBayarLama;

            $lastHistory = BalanceHistory::where('unit_id', $unitId)
                ->where('jenis', 'Pendapatan')
                ->latest()
                ->first();

            if ($lastHistory) {
                if ($selisih !== 0) {
                    $saldoSebelum = $lastHistory->saldo_sekarang;
                    $saldoSesudah = $saldoSebelum + $selisih;

                    $lastHistory->update([
                        'saldo_sebelum' => $saldoSebelum,
                        'saldo_sekarang' => $saldoSesudah,
                        'updated_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
                    ]);
                } else {
                    $lastHistory->update([
                        'updated_at' => $validated['tanggal'] . ' ' . $validated['jam_mulai'] . ':00',
                    ]);
                }
            }

            DB::commit();
            return back()->with('info', [
                'message' => 'Booking berhasil diperbarui untuk ' . $validated['penyewa'],
                'method' => 'update'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $unitId, string $id)
    {
        $user = Auth::user()->load('units');

        $unitIds = $user->units->pluck('id_units')->map(fn($val) => (int) $val)->toArray();

        if (!in_array((int) $unitId, $unitIds)) {
            abort(403, 'Anda tidak memiliki akses ke unit ini');
        }

        try {
            DB::beginTransaction();
            $rent = RentTransaction::with('income', 'tarif')->where('id_rent', $id)->firstOrFail();

            if ((int) $rent->tarif->unit_id !== (int) $unitId) {
                abort(403, 'Booking ini tidak berasal dari unit Anda');
            }

            $totalBayar = $rent->total_bayar ?? 0;
            $penyewa = $rent->tenant_name;
            $jamBooking = $rent->jam_mulai . ' - ' . $rent->jam_selesai;

            if ($rent->income) {
                $lastHistory = BalanceHistory::where('unit_id', $unitId)
                    ->latest()
                    ->first();

                if ($lastHistory && $lastHistory->saldo_sekarang == ($lastHistory->saldo_sebelum + $totalBayar)) {
                    $lastHistory->delete();
                }

                $rent->income->delete();
            }
            $rent->delete();

            DB::commit();
            return back()->with('info', [
                'message' => 'Booking ' . $penyewa . ' (' . $jamBooking . ') berhasil dibatalkan',
                'method' => 'delete'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus booking: ' . $e->getMessage());
            return back()->with('info', [
                'message' => 'Gagal membatalkan booking',
                'method' => 'delete'
            ]);
        }
    }

    /**
     * Validasi apakah waktu booking tidak overlap dengan booking lain
     */
    private function validateBookingTime($tanggal, $jamMulai, $jamSelesai, $unitId, $excludeId = null)
    {
        $jamMulaiCarbon = Carbon::createFromFormat('H:i', $jamMulai);
        $jamSelesaiCarbon = Carbon::createFromFormat('H:i', $jamSelesai);

        // Handle cross-midnight
        if ($jamSelesaiCarbon->lessThanOrEqualTo($jamMulaiCarbon)) {
            $jamSelesaiCarbon->addDay();
        }

        // Cek overlap dengan booking lain pada tanggal yang sama
        $existingBookings = RentTransaction::whereHas('tarif', function($query) use ($unitId) {
                $query->where('unit_id', $unitId);
            })
            ->whereDate('created_at', $tanggal)
            ->when($excludeId, function($query) use ($excludeId) {
                $query->where('id_rent', '!=', $excludeId);
            })
            ->whereNotNull('jam_mulai')
            ->whereNotNull('jam_selesai')
            ->get(['jam_mulai', 'jam_selesai', 'tenant_name']);

        foreach ($existingBookings as $booking) {
            $existingMulai = Carbon::parse($booking->jam_mulai);
            $existingSelesai = Carbon::parse( $booking->jam_selesai);

            // Handle cross-midnight untuk booking yang sudah ada
            if ($existingSelesai->lessThanOrEqualTo($existingMulai)) {
                $existingSelesai->addDay();
            }

            // Cek overlap
            if ($jamMulaiCarbon->lt($existingSelesai) && $jamSelesaiCarbon->gt($existingMulai)) {
                throw new \Exception("Waktu booking bertabrakan dengan booking {$booking->tenant_name} ({$booking->jam_mulai} - {$booking->jam_selesai})");
            }
        }
    }
}