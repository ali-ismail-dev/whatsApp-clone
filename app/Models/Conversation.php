<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Conversation extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'user_id1',
        'user_id2',
        'last_message_id'
    ];

    public function lastmessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function user1()
    {
        return $this->belongsTo(User::class, 'user_id1');
    }
    public function user2()
    {
        return $this->belongsTo(User::class, 'user_id2');
    }

    public static function getConversationsForSidebar(User $exceptUser)
    {
        $user = User::getUsersExceptUser($exceptUser);
        $groups = Group::getGroupsForUser($exceptUser);
        return $user->map(function(User $user) use ($exceptUser) {
            return $user->toConversationArray();
        })->concat(
            $groups->map(function(Group $group) use ($exceptUser) {
                return $group->toConversationArray($exceptUser);
            })
        )->sortByDesc('last_message.created_at')->values()->all();
    }
}
