<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'requested_id',
        'name',
        'status',
        'accepted_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
    ];

    // requester (the user who sent the request)
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    // requested (the user who receives the request)
    public function requested()
    {
        return $this->belongsTo(User::class, 'requested_id');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('requester_id', $userId)
              ->orWhere('requested_id', $userId);
        });
    }

    public static function makeAcceptedNow()
    {
        return Carbon::now();
    }
}
