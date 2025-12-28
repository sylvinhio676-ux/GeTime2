<?php

namespace App\Http\Requests\Stores;

use Illuminate\Foundation\Http\FormRequest;

class ProgrammerRequest extends FormRequest
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
            'registration_number' => ['required', 'unique:programmers,registration_number'],
            'user_id' => ['required', 'exists:users,id', 'unique:programmers,user_id'],
            'etablishment_id' => ['required', 'exists:etablishments,id'],
        ];
    }
}
