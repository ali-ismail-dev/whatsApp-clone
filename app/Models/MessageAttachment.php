<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'name',
        'message_id',
        'path',
        'mime',
        'size'
    ];
}
