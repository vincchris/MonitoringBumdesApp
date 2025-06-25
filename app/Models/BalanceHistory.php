<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BalanceHistory extends Model
{
    protected $table = 'balance_histories';
    protected $guarded = ['id'];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id_units');
    }

    public function initialBalance()
    {
        return $this->belongsTo(InitialBalance::class, 'initial_balance_id', 'id_initial_balance');
    }
}
