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
        Schema::create('balance_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('unit_id');
            $table->decimal('saldo_sebelum', 15, 2);
            $table->enum('jenis', ['Pendapatan', 'Pengeluaran']);
            $table->decimal('saldo_sekarang', 15, 2); // nilai perubahan
            $table->timestamps();

            $table->foreign('unit_id')->references('id_units')->on('units')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('balance_histories');
    }
};
