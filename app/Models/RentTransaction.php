<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentTransaction extends Model
{
    use HasFactory;
    protected $table = "rent_transactions";
    protected $primaryKey = 'id_rent';
    protected $guarded = ['id_rent'];

    public function tarif()
    {
        return $this->belongsTo(Tarif::class, 'tarif_id', 'id_tarif');
    }

    public function income()
    {
        return $this->hasOne(Income::class, 'rent_id', 'id_rent');
    }
}
