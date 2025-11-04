<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\User;
use App\Models\Group;
use App\Models\Message;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Ali Ismail',
            'email' => 'ali@gmail.com',
            'password' => bcrypt('password123'),
            'is_admin' => true,
        ]);
        User::factory()->create([
            'name' => 'Hasan Ismail',
            'email' => 'hasan@gmail.com',
            'password' => bcrypt('password123'),
            'is_admin' => false,
        ]);
        User::factory(10)->create();

        for ($i = 0; $i < 5; $i++) {
            $group = Group::factory()->create([
                'owner_id' => 1,
            ]);

            $users = User::inRandomOrder()->take(rand(2, 5))->pluck('id')->toArray();
            $group->users()->attach(array_unique([1, ...$users]));
        }

        Message::factory(1000)->create();
        $message = Message::whereNull('group_id')->orderBy('created_at')->get();
        $conversations = $message->groupBy(function ($msg) {
            return collect([$msg->sender_id, $msg->receiver_id])->sort()->implode('_');
        })->map(function ($groupMsgs) {
            return [
                'user_id1' => $groupMsgs->first()->sender_id,
                'user_id2' => $groupMsgs->first()->receiver_id,
                    'last_message_id' => $groupMsgs->last()->id,
                'created_at' => new Carbon(),
                'updated_at' => new Carbon(),
            ];
        })->values();

        Conversation::insertOrIgnore($conversations->toArray());
    }
}
