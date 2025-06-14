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
        Schema::create('rent_transactions', function (Blueprint $table) {
            $table->id('id_rent');
            $table->unsignedBigInteger('unit_id');
            $table->string('tenant_name');
            $table->unsignedBigInteger('tarif_id');
            $table->decimal('total_biaya', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('unit_id')->references('id_units')->on('units')->onDelete('cascade');
            $table->foreign('tarif_id')->references('id_tarifs')->on('tarifs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rent_transactions');
    }
};
