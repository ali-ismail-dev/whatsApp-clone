<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
class MessageAttachmentResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => Storage::url($this->path),
            'message_id' => $this->message_id,
            'created_at' => $this->created_at,
            'mime' => $this->mime,
            'size' => $this->size,
            'name' => $this->name,
            'updated_at' => $this->updated_at
        ];
    }
}
