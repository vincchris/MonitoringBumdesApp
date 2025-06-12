<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_units';

    protected $fillable = ['unit_name', 'users_id'];

    public function user() {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function initialBalances() {
        return $this->hasMany(InitialBalance::class, 'unit_id');
    }

    public function tariffs() {
        return $this->hasMany(Tarif::class, 'unit_id');
    }

    public function expenses() {
        return $this->hasMany(Expense::class, 'units_id');
    }

    public function incomes() {
        return $this->hasMany(Income::class, 'units_id');
    }

    public function rentTransactions() {
        return $this->hasMany(RentTransaction::class, 'unit_id');
    }
}
