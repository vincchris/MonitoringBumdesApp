<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;
    protected $table = 'expenses';
    protected $primaryKey = 'id_expense';

    protected $guarded = ['id_expense'];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id_units');
    }
}
