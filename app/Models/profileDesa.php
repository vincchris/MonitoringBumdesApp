<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class profileDesa extends Model
{
    protected $table = 'profile_desa';
    protected $guarded = ['id'];

    public function bumdes()
    {
        return $this->hasOne(ProfileBumdes::class, 'desa_id');
    }
}
