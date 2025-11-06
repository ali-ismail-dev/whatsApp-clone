<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'avatar',
        'email',
        'email_verified_at',
        'password',
        'is_admin'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function groups(){
        return $this->belongsToMany(Group::class, 'group_users');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function messages()
    {
        return $this->sentMessages()->orWhere('receiver_id', $this->id);
    }

    public static function getUsersExceptUser(User $exceptUser)
    {
        $query = User::select(['users.*', 'messages.message as last_message', 'messages.created_at as last_message_date'])
            ->where('users.id', '!=', $exceptUser->id)
            ->when(!$exceptUser->is_admin, function($query) {
                $query->whereNull('users.blocked_at');
            })->leftJoin('conversations', function($join) use ($exceptUser) {
                $join->on(function($subJoin) use ($exceptUser) {
                    $subJoin->on('conversations.user_id1', '=', 'users.id')
                            ->where('conversations.user_id2', '=', $exceptUser->id);
                })->orOn(function($subJoin) use ($exceptUser) {
                    $subJoin->on('conversations.user_id2', '=', 'users.id')
                            ->where('conversations.user_id1', '=', $exceptUser->id);
                });
            })->leftJoin('messages', 'messages.id', '=', 'conversations.last_message_id')
            ->orderByDesc('messages.created_at')
            ->orderBy('users.name');
        return $query->get();

    }

    public function toConversationArray()
    {
        return [
            'is_user' => true,
            'id' => $this->id,
            'name' => $this->name,
            'is_group' => false,
            'is_admin' => (bool) $this->is_admin,
            'avatar' => $this->avatar,
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date,
        ];
    }
}
