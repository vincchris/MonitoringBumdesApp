<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pemasukan extends Model
{
    use HasFactory;

    // Nama tabel jika tidak sesuai default Laravel
    protected $table = 'incomes'; // ganti dengan nama tabelmu, misal 'pemasukans' jika berbeda

    protected $primaryKey = 'id_income'; // atau 'id' jika pakai default Laravel

    protected $fillable = [
        'units_id',
        'user_id',
        'generic_event_id',
        'nominal',
        'description',
        'created_at',
        'updated_at',
    ];

    // Relasi dengan User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi dengan Unit
    public function unit()
    {
        return $this->belongsTo(Unit::class, 'units_id');
    }
}
