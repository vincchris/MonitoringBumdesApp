<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class alldataSeeder extends Seeder
{
    public function run(): void
    {

        // Units
        DB::table('units')->insert([
            ['id_units' => 1, 'user_id' => 1, 'unit_name' => 'Mini Soccer', 'created_at' => now(), 'updated_at' => now()],
            ['id_units' => 2, 'user_id' => 1, 'unit_name' => 'Bumi Perkemahan', 'created_at' => now(), 'updated_at' => now()],
            ['id_units' => 3, 'user_id' => 1, 'unit_name' => 'Sewa Kios', 'created_at' => now(), 'updated_at' => now()],
            ['id_units' => 4, 'user_id' => 1, 'unit_name' => 'Air Weslik', 'created_at' => now(), 'updated_at' => now()],
            ['id_units' => 5, 'user_id' => 1, 'unit_name' => 'Internet Desa', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tarifs
        DB::table('tarifs')->insert([
            // Mini Soccer
            ['id_tarif' => 1, 'unit_id' => 1, 'satuan' => 'jam', 'category_name' => 'Umum', 'harga_per_unit' => 250000, 'created_at' => now(), 'updated_at' => now()],
            ['id_tarif' => 2, 'unit_id' => 1, 'satuan' => 'jam', 'category_name' => 'Member', 'harga_per_unit' => 200000, 'created_at' => now(), 'updated_at' => now()],

            // Bumi Perkemahan
            ['id_tarif' => 3, 'unit_id' => 2, 'satuan' => 'kegiatan', 'category_name' => '>300', 'harga_per_unit' => 3000000, 'created_at' => now(), 'updated_at' => now()],
            ['id_tarif' => 4, 'unit_id' => 2, 'satuan' => 'kegiatan', 'category_name' => '<=300', 'harga_per_unit' => 2500000, 'created_at' => now(), 'updated_at' => now()],

            // Kios
            ['id_tarif' => 5, 'unit_id' => 3, 'satuan' => 'tahun', 'category_name' => 'Depan puskesmas', 'harga_per_unit' => 3000000, 'created_at' => now(), 'updated_at' => now()],
            ['id_tarif' => 6, 'unit_id' => 3, 'satuan' => 'tahun', 'category_name' => 'Depan kantor desa', 'harga_per_unit' => 1500000, 'created_at' => now(), 'updated_at' => now()],
            ['id_tarif' => 7, 'unit_id' => 3, 'satuan' => 'tahun', 'category_name' => 'Lapang kuliner atas buper', 'harga_per_unit' => 750000, 'created_at' => now(), 'updated_at' => now()],

            // Air Weslik
            ['id_tarif' => 8, 'unit_id' => 4, 'satuan' => 'm3', 'category_name' => 'fasilitas umum', 'harga_per_unit' => 600, 'created_at' => now(), 'updated_at' => now()],
            ['id_tarif' => 9, 'unit_id' => 4, 'satuan' => 'm3', 'category_name' => 'perumahan', 'harga_per_unit' => 800, 'created_at' => now(), 'updated_at' => now()],
            ['id_tarif' => 10, 'unit_id' => 4, 'satuan' => 'm3', 'category_name' => 'perusahaan', 'harga_per_unit' => 1500, 'created_at' => now(), 'updated_at' => now()],

            // Internet Desa
            ['id_tarif' => 11, 'unit_id' => 5, 'satuan' => 'bulan', 'category_name' => 'Internet Bulanan', 'harga_per_unit' => 125000, 'created_at' => now(), 'updated_at' => now()],
        ]);


        // Initial Balances
        foreach (range(1, 5) as $i) {
            DB::table('initial_balances')->insert([
                'id_initial_balance' => $i,
                'unit_id' => $i,
                'nominal' => 500000,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Rent Transactions
        DB::table('rent_transactions')->insert([
            [
                'id_rent' => 1,
                'tarif_id' => 1,
                'tenant_name' => 'Tim A',
                'nominal' => 1,
                'total_bayar' => 250000,
                'description' => 'Gratis Air Mineral Gelas 1 Dus',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_rent' => 2,
                'tarif_id' => 3,
                'tenant_name' => 'Event 350 Peserta',
                'nominal' => 1,
                'total_bayar' => 3000000,
                'description' => 'Di atas 300 peserta',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_rent' => 3,
                'tarif_id' => 5,
                'tenant_name' => 'Warung Ibu Siti',
                'nominal' => 1,
                'total_bayar' => 3000000,
                'description' => 'Depan Puskesmas Cihaurbeuti',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_rent' => 4,
                'tarif_id' => 8,
                'tenant_name' => 'Masjid Al-Fatah',
                'nominal' => 10,
                'total_bayar' => 6000,
                'description' => 'Pemakaian Air Weslik - Fasilitas Umum',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_rent' => 5,
                'tarif_id' => 11,
                'tenant_name' => 'Masjid Al-Fatah',
                'nominal' => 1,
                'total_bayar' => 125000,
                'description' => 'Internet Desa Bulanan',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);


        // Expenses
        DB::table('expenses')->insert([
            [
                'id_expense' => 1,
                'unit_id' => 1,
                'category_expense' => 'Sewa Lapangan',
                'nominal' => 500000,
                'description' => 'Bayar Sewa Lapangan',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_expense' => 2,
                'unit_id' => 2,
                'category_expense' => 'Sewa Buper',
                'nominal' => 500000,
                'description' => 'Bayar Sewa Buper',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_expense' => 3,
                'unit_id' => 3,
                'category_expense' => 'Sewa Kios',
                'nominal' => 500000,
                'description' => 'Bayar Sewa Kios',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_expense' => 4,
                'unit_id' => 4,
                'category_expense' => 'Sewa Air Weslik',
                'nominal' => 500000,
                'description' => 'Bayar Air Weslik',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_expense' => 5,
                'unit_id' => 5,
                'category_expense' => 'Tagihan Internet Desa',
                'nominal' => 500000,
                'description' => 'Bayar Tagihan Internet Desa',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);


        // Incomes (optional, hanya contoh, bisa disesuaikan lagi sesuai relasi baru kamu)
        DB::table('incomes')->insert([
            [
                'id_income' => 1,
                'rent_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_income' => 2,
                'rent_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_income' => 3,
                'rent_id' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_income' => 4,
                'rent_id' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_income' => 5,
                'rent_id' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Tabel Pivot: unit_user
        |--------------------------------------------------------------------------
        | Isi tabel dibawah ini adalah pivot antara tabel users dan units.
        | Fungsinya untuk mencatat siapa pengelola dari masing-masing unit usaha.
        |
        | Saat user login, sistem dapat mendeteksi unit apa yang dia kelola
        | berdasarkan relasi ini. Nantinya, dashboard akan diarahkan ke unit terkait.
        |
        | Note:
        | - Jika ingin menambah pengelola untuk unit tertentu,
        |   cukup tambahkan kombinasi user_id + unit_id di tabel ini.
        | - Sistem mendukung banyak pengelola untuk satu unit,
        |   atau satu user mengelola banyak unit sekaligus.
        */

        DB::table('unit_user')->insert([
            ['user_id' => 1, 'unit_id' => 1, 'created_at' => now(), 'updated_at' => now()],

            ['user_id' => 2, 'unit_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 3, 'unit_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 4, 'unit_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 5, 'unit_id' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
