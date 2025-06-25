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
        Schema::table('balance_histories', function (Blueprint $table) {
            $table->unsignedBigInteger('initial_balance_id')->nullable()->after('unit_id');

            $table->foreign('initial_balance_id')
                ->references('id_initial_balance')
                ->on('initial_balances')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('balance_histories', function (Blueprint $table) {
            $table->dropForeign(['initial_balance_id']);
            $table->dropColumn('initial_balance_id');
        });
    }
};
