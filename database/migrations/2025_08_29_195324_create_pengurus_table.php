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
        Schema::create('pengurus_bumdes', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pengurus');
            $table->string('jabatan');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('pekerjaan')->nullable();
            $table->string('kategori');
            $table->string('foto_pengurus')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengurus_bumdes');
    }
};
