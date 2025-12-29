<?php

namespace App\Http\Requests\Updates;

use App\Enum\TypeSubject;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SubjectUpdateRequest extends FormRequest
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
            'subject_name' => ['nullable', 'string', 'max:255'],
            'hour_by_week' => ['nullable', 'integer', 'min:1'],
            'total_hour' => ['nullable', 'integer', 'min:1'],
            'type_subject' => ['nullable', 'string', new Enum(TypeSubject::class)],
            'color' => ['nullable', 'string', 'max:20'],
            'teacher_id' => ['nullable', 'exists:teachers,id'],
            'specialty_id' => ['nullable', 'exists:specialties,id'],
        ];
    }
}
