<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; } /* sesuai FE bg-gray-100 */
    </style>
</head>
<body>
    <h2>Laporan Keuangan {{ $unitName }}</h2>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Jenis Transaksi</th>
                <th>Nominal</th> {{-- ini adalah selisih --}}
                <th>Saldo Kas</th>
            </tr>
        </thead>
        <tbody>
            @foreach($laporan as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $item['tanggal'] }}</td>
                    <td>{{ $item['keterangan'] }}</td>
                    <td>{{ $item['jenis'] }}</td>
                    <td>
                        {{ $item['selisih'] >= 0 ? '+' : '-' }}
                        Rp {{ number_format(abs($item['selisih']), 0, ',', '.') }}
                    </td>
                    <td>Rp {{ number_format($item['saldo'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
