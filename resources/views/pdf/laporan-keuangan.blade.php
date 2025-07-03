<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan BUMDes</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 13px;
            color: #333;
            margin: 30px;
        }

        h1,
        h2 {
            text-align: center;
            margin-bottom: 5px;
        }

        h1 {
            font-size: 20px;
            margin-bottom: 0;
        }

        h2 {
            font-size: 16px;
            margin-top: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
        }

        th,
        td {
            padding: 10px;
            border: 1px solid #aaa;
        }

        .ringkasan td {
            font-weight: bold;
        }

        .ringkasan td:first-child {
            width: 70%;
        }

        .rincian th {
            background-color: #f3f3f3;
        }

        .text-right {
            text-align: right;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-style: italic;
            color: #555;
        }

        tfoot tr {
            background-color: #e6f2e6;
            font-weight: bold;
        }

        .sub-table {
            margin-top: 5px;
            margin-bottom: 40px;
        }

        .unit-title {
            margin-top: 40px;
            font-size: 15px;
            font-weight: bold;
        }

        .sub-table th {
            background-color: #f9f9f9;
        }
    </style>
</head>

<body>

    <h1>Laporan Keuangan BUMDes Bagja Waluya</h1>
    <h2>Tahun {{ date('Y') }}</h2>

    <h3 style="margin-top: 40px;">Ringkasan Keuangan</h3>
    <table class="ringkasan">
        <tr>
            <td>Total Pemasukan</td>
            <td class="text-right">{{ $ringkasan['total_pemasukan'] }}</td>
        </tr>
        <tr>
            <td>Total Pengeluaran</td>
            <td class="text-right">{{ $ringkasan['total_pengeluaran'] }}</td>
        </tr>
        <tr>
            <td>Surplus</td>
            <td class="text-right">{{ $ringkasan['surplus'] }}</td>
        </tr>
        <tr>
            <td>Saldo Akhir</td>
            <td class="text-right">{{ $ringkasan['saldo_akhir'] }}</td>
        </tr>
    </table>

    <h3>Rincian Keuangan per Unit Usaha</h3>
    <table class="rincian">
        <thead>
            <tr>
                <th>Unit Usaha</th>
                <th>Pemasukan</th>
                <th>Pengeluaran</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rincian as $item)
                <tr>
                    <td>{{ $item['unit_usaha'] }}</td>
                    <td class="text-right">{{ $item['pemasukan'] }}</td>
                    <td class="text-right">{{ $item['pengeluaran'] }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td>Total Keseluruhan</td>
                <td class="text-right">Rp{{ number_format($total_keseluruhan['pemasukan'], 0, ',', '.') }}</td>
                <td class="text-right">Rp{{ number_format($total_keseluruhan['pengeluaran'], 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <h3>Detail Transaksi per Unit Usaha</h3>
    @foreach ($rincian as $unit)
        <div class="unit-title">{{ $unit['unit_usaha'] }}</div>
        <table class="sub-table">
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Saldo Sebelum</th>
                    <th>Saldo Sekarang</th>
                    <th>Selisih</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($unit['transaksi'] as $trx)
                    <tr>
                        <td>{{ $trx['tanggal'] }}</td>
                        <td>{{ $trx['jenis'] }}</td>
                        <td class="text-right">{{ $trx['saldo_sebelum'] }}</td>
                        <td class="text-right">{{ $trx['saldo_sekarang'] }}</td>
                        <td class="text-right">{{ $trx['selisih'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach

    <div class="footer">
        Dicetak pada {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}
    </div>

</body>

</html>
