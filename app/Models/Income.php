<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_income';

    protected $fillable = ['units_id', 'users_id', 'generic_event_id', 'nominal', 'description'];

    public function unit() {
        return $this->belongsTo(Unit::class, 'units_id');
    }

    public function user() {
        return $this->belongsTo(User::class, 'users_id');
    }
}
