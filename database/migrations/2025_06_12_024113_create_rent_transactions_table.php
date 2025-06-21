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
            $table->foreignId('tarif_id')->constrained('tarifs', 'id_tarif')->onDelete('cascade');
            $table->string('tenant_name')->nullable();
            $table->decimal('nominal', 15, 2);
            $table->decimal('total_bayar', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();
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
