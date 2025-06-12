<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_expense';

    protected $fillable = ['units_id', 'category_expense', 'nominal', 'description'];

    public function unit() {
        return $this->belongsTo(Unit::class, 'units_id');
    }
}
