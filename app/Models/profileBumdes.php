<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class profileBumdes extends Model
{
    protected $table = 'profile_bumdes';
    protected $guarded = ['id'];

    public function desa()
    {
        return $this->belongsTo(ProfileDesa::class, 'desa_id');
    }
}
