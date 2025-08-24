<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabel Profile Desa
        Schema::create('profile_desa', function (Blueprint $table) {
            $table->id();
            $table->string('nama_desa');
            $table->string('alamat');
            $table->string('kepala_desa');
            $table->string('periode_kepala_desa')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('telepon')->nullable();
            $table->decimal('luas_desa', 10, 2)->nullable();
            $table->string('logo_desa')->nullable();
            $table->string('foto_kantor_desa')->nullable();
            $table->timestamps();
        });

        // Tabel Profile BUMDes
        Schema::create('profile_bumdes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->constrained('profile_desa')->onDelete('cascade');
            $table->string('nama_bumdes');
            $table->string('kepala_bumdes');
            $table->string('alamat')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('telepon')->nullable();
            $table->string('logo_bumdes')->nullable();
            $table->string('foto_sekretariat')->nullable();
            $table->text('keunggulan')->nullable();
            $table->text('visi')->nullable();
            $table->text('misi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_bumdes');
        Schema::dropIfExists('profile_desa');
    }
};
