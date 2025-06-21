<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarif extends Model
{
    protected $table = 'tarifs';
    protected $primaryKey = "id_tarif";

    protected $guarded = ["id_tarif"];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id_units');
    }

    public function rentTransactions()
    {
        return $this->hasMany(RentTransaction::class, 'tarif_id', 'id_tarif');
    }
}
