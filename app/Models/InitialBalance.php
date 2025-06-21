<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InitialBalance extends Model
{
    use HasFactory;
    protected $table = 'initial_balances';

    protected $primaryKey = 'id_initial_balance';

    protected $guarded = ['id_initial_balance'];

   public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id_units');
    }
}
