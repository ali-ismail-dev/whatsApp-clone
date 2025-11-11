<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Jobs\DeletGroupJob;
use App\Models\Group;

class GroupController extends Controller
{
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGroupRequest $request)
    {
        $data = $request->validated();
        $group = Group::create($data);
        $users_ids = $data['users_ids'] ?? [];
        $group->users()->attach(array_unique([$request->user()->id, ...$users_ids]));

        return redirect()->back();
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGroupRequest $request, Group $group)
    {
        $data = $request->validated();
        $users_ids = $data['users_ids'] ?? [];
        $group->update($data);
        $group->users()->detach();
        $group->users()->sync(array_unique([$request->user()->id, ...$users_ids]));

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group)
    {
        if ($group->owner_id !== Auth::id()) {
            return response()->json([
                'message' => 'You cannot delete this group',
            ], 403);
        }

        // FIX APPLIED: We dispatch the ID, not the full model.
        DeletGroupJob::dispatch($group->id)->delay(now()->addSeconds(7));
        
        return response()->json([
            'message' => 'Group will be deleted in seconds',
        ]);
          
    }
}