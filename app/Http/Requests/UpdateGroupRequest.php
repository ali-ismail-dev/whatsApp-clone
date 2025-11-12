<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Controller already checks ownership; allow the request here.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // name may be optional on update (you disabled name editing when updating in UI),
            // but validate if provided:
            'name' => ['sometimes', 'string', 'max:191'],

            // allow null/empty descriptions but validate type/length
            'description' => ['nullable', 'string', 'max:2000'],

            // users_ids should be an array of existing user IDs (except owner — we'll filter on backend)
            'users_ids' => ['sometimes', 'array'],
            'users_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
