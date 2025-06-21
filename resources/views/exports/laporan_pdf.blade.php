<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #eee; }
    </style>
</head>
<body>
    <h2>Laporan Keuangan Mini Soccer</h2>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Jenis Transaksi</th>
                <th>Nominal</th>
                <th>Saldo Kas</th>
            </tr>
        </thead>
        <tbody>
            @php $i = 1; @endphp
            @foreach($laporan as $item)
                <tr>
                    <td>{{ $i++ }}</td>
                    <td>{{ $item['tanggal'] }}</td>
                    <td>{{ $item['keterangan'] }}</td>
                    <td>{{ $item['jenis'] }}</td>
                    <td>Rp {{ number_format($item['nominal'], 0, ',', '.') }}</td>
                    <td>Rp {{ number_format($item['saldo'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
