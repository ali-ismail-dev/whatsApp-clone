<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'is_admin' => ['boolean'],
        ]); 
        $rawPassword ='password';
        $data['password'] = bcrypt($rawPassword);
        $data['email_verified_at'] = now();
        User::create($data);
        return redirect()->back();
    }

    public function changeRole(User $user)
    {
        $user -> update(['is_admin' => !(bool) $user->is_admin]);
        $message = $user->name . "'s role changed to " . ($user->is_admin ? "Admin" : "User");
        return response()->json(['message' => $message]);
    }

public function blockUnBlock(User $user)
{
    if ($user->blocked_at) {
        $user->blocked_at = null;
        $message = "User " . $user->name . " is unblocked";
    } else {
        $user->blocked_at = now();
        $message = "User " . $user->name . " is blocked";
    }
    $user->save();

 
    $userResource = (new \App\Http\Resources\UserResource($user))->toArray(request());

    $conversationPayload = array_merge($userResource, [
        'id' => $user->id,
        'is_user' => true,
        'is_group' => false,
        'name' => $user->name,
        'blocked_at' => $user->blocked_at ? $user->blocked_at->toDateTimeString() : null,
    ]);

    return response()->json([
        'message' => $message,
        'conversation' => $conversationPayload,
        'blocked_at' => $conversationPayload['blocked_at'],
    ]);
}

}
