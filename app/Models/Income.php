<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
    use HasFactory;
    protected $table = "incomes";

    protected $primaryKey = 'id_income';

    protected $guarded = ['id_income'];

    public function rent()
    {
        return $this->belongsTo(RentTransaction::class, 'rent_id', 'id_rent');
    }
}
