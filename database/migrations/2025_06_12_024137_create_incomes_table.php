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
        Schema::create('incomes', function (Blueprint $table) {
            $table->id('id_income');
            $table->unsignedBigInteger('units_id');
            $table->unsignedBigInteger('users_id');
            $table->unsignedBigInteger('generic_event_id')->nullable();
            $table->decimal('nominal', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('units_id')->references('id_units')->on('units')->onDelete('cascade');
            $table->foreign('users_id')->references('id_user')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
