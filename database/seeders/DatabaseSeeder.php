<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $users = [
            [
                'name' => 'Kairi Kumar',
                'email' => 'pengelolaminisoc@gmail.com',
                'password' => Hash::make('123456789'),
                'roles' => 'pengelola',
            ],
            [
                'name' => 'Beatrice Audrey',
                'email' => 'pengelolabuper@gmail.com',
                'password' => Hash::make('123456789'),
                'roles' => 'pengelola',
            ],
            [
                'name' => 'Angelia Christy',
                'email' => 'pengelolasewakios@gmail.com',
                'password' => Hash::make('123456789'),
                'roles' => 'pengelola',
            ],
            [
                'name' => 'Jasmine Allyc',
                'email' => 'pengelolaairweslik@gmail.com',
                'password' => Hash::make('123456789'),
                'roles' => 'pengelola',
            ],
            [
                'name' => 'Hanami Wang',
                'email' => 'pengelolainternetdesa@gmail.com',
                'password' => Hash::make('123456789'),
                'roles' => 'pengelola',
            ],
            [
                'name' => 'H. haris iwan gunawan',
                'email' => 'KepalaDesa@gmail.com',
                'password' => Hash::make('123456789'),
                'roles' => 'kepala_desa',
            ],
            [
                'name' => 'Asep Rohendi',
                'email' => 'kepalaBumdes@gmail.com',
                'password' => Hash::make('123456789'),
                'roles' => 'kepala_bumdes',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        $this->call([
            alldataSeeder::class,
        ]);
    }
}
