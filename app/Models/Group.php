<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'owner_id',
        'last_message_id'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'group_users');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public static function getGroupsForUser(User $user)
    {
        return Group::select(['groups.*', 'messages.message as last_message', 'messages.created_at as last_message_date'])
            ->join('group_users', 'groups.id', '=', 'group_users.group_id')
            ->leftJoin('messages', 'groups.last_message_id', '=', 'messages.id')
            ->where('group_users.user_id', $user->id)
            ->orderByDesc('messages.created_at')
            ->orderBy('groups.name')->get();
    }

    public function toConversationArray(User $exceptUser)
    {
        return [
            'id' => $this->id,
            'is_group' => true,
            'name' => $this->name,
            'description' => $this->description,
            'avatar' => null,
            'is_user' => false,
            'owner_id' => $this->owner_id,
            'users' => $this->users()->where('id', '!=', $exceptUser->id)->get(),
            'user_ids' => $this->users()->pluck('id')->toArray(),
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date,
            'is_online' => null,
        ];
    }

    public static function updateGroupWithMessage($groupId, $message)
    {
        return self::updateOrCreate(
            ['id' => $groupId], //search by id
            ['last_message_id' => $message->id]// value to update
        );
    }
}
