<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarif extends Model
{
    protected $table = 'tarif';

    protected $fillable = [
        'unit_id',
        'category_id',
        'harga_per_unit',
        'satuan'
    ];

    public function unit() {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
