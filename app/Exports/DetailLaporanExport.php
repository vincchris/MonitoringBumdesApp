<?php

namespace App\Exports;

use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DetailLaporanExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles
{
    protected $unitId;
    protected $year;
    protected $month;
    protected $unit;
    protected $histories;

    public function __construct($unitId, $year, $month)
    {
        $this->unitId = $unitId;
        $this->year = $year;
        $this->month = $month;
        $this->unit = Unit::findOrFail($unitId);
        $this->histories = $this->getDetailLaporan();
    }

    public function collection()
    {
        return $this->histories->sortByDesc('updated_at')->values();
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'Hari',
            'Keterangan',
            'Jenis',
            'Nominal',
            'Saldo Kas',
            'Waktu',
        ];
    }

    public function map($item): array
    {
        static $no = 1;

        return [
            $no++,
            $item['tanggal'],
            Carbon::parse($item['tanggal_raw'])->translatedFormat('l'),
            $item['keterangan'],
            $item['jenis'],
            ($item['jenis'] === 'Pendapatan' ? '+' : '-') . number_format($item['selisih'], 0, ',', '.'),
            'Rp ' . number_format((int) str_replace(',', '', $item['saldo']), 0, ',', '.'),
            Carbon::parse($item['updated_at'])->format('H:i'),
        ];
    }

    public function title(): string
    {
        return 'Detail Transaksi ' . Carbon::createFromDate($this->year, $this->month, 1)->translatedFormat('F Y');
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function getDetailLaporan()
    {
        // Copy method getDetailLaporan dari controller
        $histories = \App\Models\BalanceHistory::where('unit_id', $this->unitId)
            ->whereYear('updated_at', $this->year)
            ->whereMonth('updated_at', $this->month)
            ->orderByDesc('updated_at')
            ->get();

        return $histories->map(function ($item) {
            return [
                'id' => $item->id,
                'tanggal' => $item->updated_at->translatedFormat('d F Y'),
                'tanggal_raw' => $item->updated_at->format('Y-m-d'),
                'keterangan' => $this->getTransactionDescription($item),
                'jenis' => $item->jenis,
                'selisih' => $this->calculateSelisih($item),
                'saldo' => number_format($item->saldo_sekarang, 0, '', ','),
                'updated_at' => $item->updated_at,
            ];
        });
    }

    private function getTransactionDescription($item): string
    {
        // Copy logic dari controller method getTransactionDescription
        if ($item->jenis === 'Pendapatan') {
            return 'Pemasukan dari sewa';
        }
        if ($item->jenis === 'Pengeluaran') {
            return 'Pengeluaran operasional';
        }
        return '-';
    }

    private function calculateSelisih($item): int
    {
        return $item->jenis === 'Pendapatan'
            ? $item->saldo_sekarang - $item->saldo_sebelum
            : $item->saldo_sebelum - $item->saldo_sekarang;
    }
}