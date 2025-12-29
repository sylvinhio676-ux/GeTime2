<?php

namespace App\Http\Requests\Updates;

use Illuminate\Foundation\Http\FormRequest;

class SpecialtyUpdateRequest extends FormRequest
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
            'specialty_name' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'number_student' => ['nullable', 'integer', 'min:1'],
            'sector_id' => ['nullable', 'exists:sectors,id'],
            'programmer_id' => ['nullable', 'exists:programmers,id'],
            'level_id' => ['nullable', 'exists:levels,id'],
        ];
    }
}
