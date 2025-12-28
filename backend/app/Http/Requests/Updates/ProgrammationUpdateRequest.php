<?php

namespace App\Http\Requests\Updates;

use Illuminate\Foundation\Http\FormRequest;

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
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'teacher_id' => ['nullable', 'exists:teachers,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'jour_enum' => ['nullable', 'in:LUNDI,MARDI,MERCREDI,JEUDI,VENDREDI,SAMEDI,DIMANCHE'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
        ];
    }
}
