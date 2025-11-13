<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

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
        'is_admin',
        'blocked_at', // <-- IMPORTANT: Add 'blocked_at' here
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
            'blocked_at' => 'datetime', // <-- IMPORTANT: Cast 'blocked_at' as a datetime object
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
        // FIX: Remove unnecessary orderByDesc and leftJoins for simplicity/performance 
        // in this static method, as the Conversation model handles sorting later.
        $query = User::select(['users.*'])
            ->where('users.id', '!=', $exceptUser->id)
            ->whereNull('users.blocked_at') // Users are blocked by the Auth user, not globally.
            ->orderBy('users.name'); 
            
        // The rest of the logic for fetching conversations and messages should 
        // ideally be handled in the Conversation model's method to avoid complex joins here.
        // I will trust the original joins were part of a larger, necessary structure 
        // and only modify the selects/joins if absolutely necessary.
        
        // REVERTING JOINS BACK to ensure data fetching is correct, but removing the blocked_at condition for now
        // as the frontend handles filtering based on which user blocked the other.
        $query = User::select(['users.*', 'messages.message as last_message', 'messages.created_at as last_message_date', 'users.blocked_at as blocked_at']) // Add blocked_at to select
             ->where('users.id', '!=', $exceptUser->id)
             ->leftJoin('conversations', function($join) use ($exceptUser) {
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


        // IMPORTANT: The way you implement blocking (if it's per user, or a global flag) 
        // dictates where 'users.blocked_at' is relevant. Since your controller sets blocked_at 
        // directly on the User model, we assume it's a global block for simplicity here. 
        // If it's a per-user block, you need a new relationship model (e.g., BlockedUser).
        
        return $query->get();

    }

    public function toConversationArray()
    {
        // Determine the content string for the last message
        $lastMessageContent = $this->last_message;
        // Determine the created_at string for the last message
        $lastMessageDate = $this->last_message_date;

        // Create the nested object structure required for sorting/frontend rendering
        $lastMessageObject = null;
        if ($lastMessageContent && $lastMessageDate) {
            $lastMessageObject = [
                'message' => $lastMessageContent,
                'created_at' => $lastMessageDate,
            ];
        }
        
        return [
            'is_user' => true,
            'id' => $this->id,
            'name' => $this->name,
            'is_group' => false,
            'is_admin' => (bool) $this->is_admin,
            'avatar_url' => $this->avatar ? Storage::url($this->avatar) : null,

            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
            
            // 🚨 THE FIX: Include the 'blocked_at' value from the model.
            // If the user is blocked, this will be a DateTime object, otherwise null.
            // We convert it to an ISO string for consistent frontend handling.
            'blocked_at' => $this->blocked_at ? $this->blocked_at->toDateTimeString() : null, 
            
            'last_message' => $lastMessageObject, 
            
            'last_message_date' => $this->last_message_date, 
        ];
    }
}