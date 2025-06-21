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

        User::create([
            'name' => 'Kairi Kumar',
            'email' => 'pengelola@gmail.com',
            'password' => Hash::make('123456789'),
            'roles' => 'pengelola'
        ]);
        
        User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password123'),
            'roles' => 'kepala_desa'
        ]);

        $this->call([
            alldataSeeder::class,
        ]);
    }
}
