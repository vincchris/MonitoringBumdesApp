<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;
    protected $table = 'units';

    protected $primaryKey = 'id_units';

    protected $guarded = ['id_units'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'unit_user', 'unit_id', 'user_id')
            ->withTimestamps();
    }

    public function tarif()
    {
        return $this->hasMany(Tarif::class, 'unit_id', 'id_units');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'unit_id', 'id_units');
    }

    public function initialBalance()
    {
        return $this->hasOne(InitialBalance::class, 'unit_id', 'id_units');
    }
}
