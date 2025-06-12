<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InitialBalance extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_initial_balance';

    protected $fillable = ['unit_id', 'nominal'];

    public function unit() {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
