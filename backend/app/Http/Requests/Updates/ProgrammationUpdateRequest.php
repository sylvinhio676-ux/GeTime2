<?php

namespace App\Http\Requests\Updates;

use App\Enum\JourEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class ProgrammationUpdateRequest extends FormRequest
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
            'day' => ['nullable', 'string', new Enum(JourEnum::class)],
            'hour_star' => ['nullable', 'date_format:H:i'],
            'hour_end' => ['nullable', 'date_format:H:i', 'after:hour_star'],
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'programmer_id' => ['nullable', 'exists:programmers,id'],
            'year_id' => ['nullable', 'exists:years,id'],
            'campus_id' => ['nullable', 'exists:campuses,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'specialty_ids' => ['nullable', 'array'],
            'specialty_ids.*' => ['integer', 'exists:specialties,id'],
        ];
    }
}
