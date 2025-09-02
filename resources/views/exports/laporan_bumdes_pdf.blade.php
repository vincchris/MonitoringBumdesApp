<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Laporan {{ $unitName ?? $unit['name'] ?? 'Mini Soccer' }} - {{ $bulan ?? 'Unknown Period' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
            background: white;
        }

        .container {
            width: 100%;
            margin: 0 auto;
            padding: 15px;
        }

        /* Header Styles */
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }

        .header h2 {
            font-size: 14px;
            color: #374151;
            margin-bottom: 5px;
        }

        .header .meta {
            font-size: 9px;
            color: #6b7280;
        }

        /* Summary Cards */
        .summary {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .summary-row {
            display: table-row;
        }

        .summary-card {
            display: table-cell;
            width: 25%;
            padding: 8px;
            vertical-align: top;
        }

        .card {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 10px;
            background: #f9fafb;
            margin-right: 5px;
        }

        .card.pendapatan {
            border-color: #22c55e;
            background: #f0fdf4;
        }

        .card.pengeluaran {
            border-color: #ef4444;
            background: #fef2f2;
        }

        .card.selisih {
            border-color: #3b82f6;
            background: #eff6ff;
        }

        .card.transaksi {
            border-color: #8b5cf6;
            background: #f5f3ff;
        }

        .card-title {
            font-size: 8px;
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 4px;
            text-transform: uppercase;
        }

        .card-value {
            font-size: 11px;
            font-weight: bold;
            color: #1f2937;
        }

        .card-value.positive {
            color: #16a34a;
        }

        .card-value.negative {
            color: #dc2626;
        }

        /* Table Styles */
        .table-container {
            width: 100%;
            margin-bottom: 20px;
        }

        .table-title {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            padding-left: 2px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin-bottom: 10px;
        }

        th {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 6px 4px;
            text-align: left;
            font-weight: bold;
            font-size: 8px;
            color: #374151;
        }

        td {
            border: 1px solid #e5e7eb;
            padding: 5px 4px;
            vertical-align: top;
        }

        tr:nth-child(even) {
            background: #f9fafb;
        }

        tr:hover {
            background: #f3f4f6;
        }

        /* Badge Styles */
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge.pendapatan {
            background: #dcfce7;
            color: #166534;
        }

        .badge.pengeluaran {
            background: #fee2e2;
            color: #991b1b;
        }

        /* Amount Styles */
        .amount {
            text-align: right;
            font-weight: bold;
        }

        .amount.positive {
            color: #16a34a;
        }

        .amount.negative {
            color: #dc2626;
        }

        /* Footer */
        .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 8px;
            color: #6b7280;
            text-align: center;
        }

        .footer-info {
            margin-bottom: 5px;
        }

        /* No Data Message */
        .no-data {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
        }

        .no-data .icon {
            font-size: 24px;
            margin-bottom: 10px;
            color: #d1d5db;
        }

        /* Utility Classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 8px; }
        .mb-2 { margin-bottom: 8px; }
        .mt-2 { margin-top: 8px; }

        /* Page Break */
        .page-break {
            page-break-after: always;
        }

        /* Column Widths */
        .col-no { width: 5%; }
        .col-date { width: 12%; }
        .col-desc { width: 30%; }
        .col-type { width: 12%; }
        .col-amount { width: 15%; }
        .col-balance { width: 15%; }
        .col-time { width: 11%; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>DETAIL LAPORAN TRANSAKSI</h1>
            <h2>{{ $unitName ?? $unit['name'] ?? 'Mini Soccer' }}</h2>
            <div class="meta">
                <div>Periode: {{ $bulan ?? 'Unknown Period' }}</div>
                <div>Digenerate: {{ $generated_at ?? date('d/m/Y H:i') }} WIB</div>
                <div>Oleh: {{ $generated_by ?? 'System' }}</div>
            </div>
        </div>

        <!-- Summary Cards -->
        @if(isset($summary) && is_array($summary))
        <div class="summary">
            <div class="summary-row">
                <div class="summary-card">
                    <div class="card pendapatan">
                        <div class="card-title">Total Pendapatan</div>
                        <div class="card-value positive">
                            Rp {{ number_format($summary['totalPendapatan'] ?? 0, 0, ',', '.') }}
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card pengeluaran">
                        <div class="card-title">Total Pengeluaran</div>
                        <div class="card-value negative">
                            Rp {{ number_format($summary['totalPengeluaran'] ?? 0, 0, ',', '.') }}
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card selisih">
                        <div class="card-title">Selisih (Net)</div>
                        <div class="card-value {{ ($summary['selisih'] ?? 0) >= 0 ? 'positive' : 'negative' }}">
                            Rp {{ number_format($summary['selisih'] ?? 0, 0, ',', '.') }}
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card transaksi">
                        <div class="card-title">Jumlah Transaksi</div>
                        <div class="card-value">
                            {{ $summary['jumlahTransaksi'] ?? 0 }} transaksi
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @endif

        <!-- Transaction Table -->
        <div class="table-container">
            <div class="table-title">
                Rincian Transaksi - {{ $bulan ?? 'Unknown Period' }}
            </div>

            @if(isset($detailLaporan) && $detailLaporan->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th class="col-no text-center">No</th>
                            <th class="col-date">Tanggal</th>
                            <th class="col-desc">Keterangan</th>
                            <th class="col-type text-center">Jenis</th>
                            <th class="col-amount text-right">Nominal</th>
                            <th class="col-balance text-right">Saldo Kas</th>
                            <th class="col-time text-center">Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($detailLaporan as $index => $item)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>
                                <div class="font-bold">{{ $item['tanggal'] ?? '-' }}</div>
                                @if(isset($item['tanggal_raw']))
                                <div class="text-sm" style="color: #6b7280;">
                                    {{ \Carbon\Carbon::parse($item['tanggal_raw'])->translatedFormat('l') }}
                                </div>
                                @endif
                            </td>
                            <td>{{ $item['keterangan'] ?? 'Transaksi' }}</td>
                            <td class="text-center">
                                <span class="badge {{ strtolower($item['jenis'] ?? '') }}">
                                    {{ $item['jenis'] ?? 'Unknown' }}
                                </span>
                            </td>
                            <td class="amount {{ ($item['jenis'] ?? '') === 'Pendapatan' ? 'positive' : 'negative' }}">
                                {{ ($item['jenis'] ?? '') === 'Pendapatan' ? '+' : '-' }}Rp {{ number_format(abs($item['selisih'] ?? 0), 0, ',', '.') }}
                            </td>
                            <td class="amount">
                                Rp {{ isset($item['saldo']) ? number_format((int)str_replace(',', '', $item['saldo']), 0, ',', '.') : '0' }}
                            </td>
                            <td class="text-center text-sm">
                                @if(isset($item['updated_at']))
                                    {{ \Carbon\Carbon::parse($item['updated_at'])->format('H:i') }}
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="no-data">
                    <div class="icon">📄</div>
                    <h3 style="font-size: 12px; margin-bottom: 5px;">Tidak ada transaksi</h3>
                    <p>Belum ada data transaksi untuk periode {{ $bulan ?? 'ini' }} di unit {{ $unitName ?? $unit['name'] ?? 'Mini Soccer' }}.</p>
                </div>
            @endif
        </div>

        <!-- Additional Info -->
        @if(isset($summary) && ($summary['jumlahTransaksi'] ?? 0) > 0)
        <div style="margin-top: 15px; font-size: 9px;">
            <div style="display: table; width: 100%;">
                <div style="display: table-cell; width: 50%; padding-right: 10px;">
                    <div style="background: #f9fafb; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        <div class="font-bold mb-2">Informasi Laporan</div>
                        <div>Periode: {{ $bulan ?? 'Unknown' }}</div>
                        <div>Unit: {{ $unitName ?? $unit['name'] ?? 'Mini Soccer' }}</div>
                        <div>Total Transaksi: {{ $summary['jumlahTransaksi'] ?? 0 }} transaksi</div>
                        @if(($summary['jumlahTransaksi'] ?? 0) > 0)
                        <div>Rata-rata per Transaksi:
                            Rp {{ number_format((($summary['totalPendapatan'] ?? 0) + ($summary['totalPengeluaran'] ?? 0)) / ($summary['jumlahTransaksi'] ?? 1), 0, ',', '.') }}
                        </div>
                        @endif
                    </div>
                </div>
                <div style="display: table-cell; width: 50%;">
                    <div style="background: #f9fafb; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        <div class="font-bold mb-2">Aliran Kas</div>
                        <div style="color: #16a34a;">Total Masuk: +Rp {{ number_format($summary['totalPendapatan'] ?? 0, 0, ',', '.') }}</div>
                        <div style="color: #dc2626;">Total Keluar: -Rp {{ number_format($summary['totalPengeluaran'] ?? 0, 0, ',', '.') }}</div>
                        <div class="font-bold {{ ($summary['selisih'] ?? 0) >= 0 ? 'positive' : 'negative' }}">
                            Net Cash Flow: {{ ($summary['selisih'] ?? 0) >= 0 ? '+' : '' }}Rp {{ number_format($summary['selisih'] ?? 0, 0, ',', '.') }}
                        </div>
                        <div style="font-size: 8px; margin-top: 3px; color: #6b7280;">
                            Status: {{ ($summary['selisih'] ?? 0) >= 0 ? 'Surplus' : 'Defisit' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div class="footer-info">
                Laporan ini dihasilkan secara otomatis dari Sistem Monitoring BUMDes
            </div>
            <div class="footer-info">
                Unit: {{ $unitName ?? $unit['name'] ?? 'Mini Soccer' }} •
                Periode: {{ $bulan ?? 'Unknown' }} •
                User: {{ $generated_by ?? 'System' }}
            </div>
            <div class="footer-info">
                Digenerate pada: {{ $generated_at ?? date('l, d F Y H:i') }} WIB
            </div>
        </div>
    </div>
</body>
</html>