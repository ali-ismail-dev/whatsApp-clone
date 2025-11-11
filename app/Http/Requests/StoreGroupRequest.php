<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;

class StoreGroupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
          'name' => ['required', 'string', 'max:255'],
          'description' => ['nullable', 'string'],
          'users_ids' => ['required', 'array'],
          'users_ids.*' => ['required', 'exists:users,id'],
        ];
    }
    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);
        $data['owner_id'] = Auth::id();
        return $data;
    }
}
