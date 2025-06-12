<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentTransaction extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_rent';

    protected $fillable = ['unit_id', 'tenant_name', 'tarif_id', 'total_bayar', 'description'];

    public function unit() {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function tariff() {
        return $this->belongsTo(Tarif::class, 'tarif_id');
    }
}
