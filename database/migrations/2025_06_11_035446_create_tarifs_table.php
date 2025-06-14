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
        Schema::create('tarifs', function (Blueprint $table) {
            $table->id('id_tarifs');
            $table->unsignedBigInteger('unit_id');
            $table->unsignedBigInteger('category_id');
            $table->decimal('harga_per_unit', 15, 2);
            $table->string('satuan');
            $table->timestamps();

            $table->foreign('unit_id')->references('id_units')->on('units')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tarifs');
    }
};
