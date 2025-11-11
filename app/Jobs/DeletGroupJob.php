<?php

namespace App\Jobs;

use App\Events\GroupDeletedEvent;
use App\Models\Group;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class DeletGroupJob implements ShouldQueue
{
    use Queueable;

    /**
     * FIX: Accepts the integer ID instead of the full Group Model for serialization safety.
     */
    public function __construct(public int $groupId) // Changed to $groupId (int)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Re-fetch the model instance inside the job for reliability
            $group = Group::find($this->groupId);

            // Safety check: if the group was already deleted by another process, stop.
            if (!$group) {
                Log::warning("DeletGroupJob for ID {$this->groupId} terminated. Group not found.");
                return;
            }

            // 1. Store necessary data for the event before the model is deleted
            $id = $group->id;
            $name = $group->name;
            
            Log::info("Attempting to delete group ID: {$id} ({$name})");
            $group->last_message_id = null;
                $group->save(); 
                Log::info("Nullified last_message_id for group ID: {$id}");
            // 2. Clear relationships and messages
            $group->messages()->delete();
            $group->users()->detach();
            
          
                
            

            // 3. Delete the group record
            $group->delete();

            Log::info("Successfully deleted group ID: {$id}. Dispatching event.");

            // 4. Dispatch the event
            GroupDeletedEvent::dispatch($id, $name);

        } catch (\Exception $e) {
            // CRITICAL: Log the exception to pinpoint the exact failure point
            $id = $this->groupId ?? 'Unknown';
            Log::error("DeletGroupJob failed for Group ID: {$id}. Error: " . $e->getMessage());
            Log::error("Trace: " . $e->getTraceAsString());
        }
    }
}