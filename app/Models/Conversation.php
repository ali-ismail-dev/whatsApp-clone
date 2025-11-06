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
        return $user->map(function (User $user) use ($exceptUser) {
            return $user->toConversationArray();
        })->concat(
            $groups->map(function (Group $group) use ($exceptUser) {
                return $group->toConversationArray($exceptUser);
            })
        )->sortByDesc('last_message.created_at')->values()->all();
    }

    public static function updateConversationWithMessage($userId1, $userId2, $message)
    {
        $conversation = Conversation::where(function ($query) use ($userId1, $userId2) {
            $query->where('user_id1', $userId1)->where('user_id2', $userId2);
        })->orWhere(function ($query) use ($userId1, $userId2) {
            $query->where('user_id1', $userId2)->where('user_id2', $userId1);
        })->first();

        if (!$conversation) {
            Conversation::create([
                'user_id1' => $userId1,
                'user_id2' => $userId2,
                'last_message_id' => $message->id
            ]);
        } else {
            $conversation->update([
                'last_message_id' => $message->id
            ]);
        }
    }
}
