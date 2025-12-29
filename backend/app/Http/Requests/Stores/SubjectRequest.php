<?php

namespace App\Http\Requests\Stores;

use App\Enum\TypeSubject;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SubjectRequest extends FormRequest
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
            'subject_name' => ['required', 'string', 'max:255'],
            'hour_by_week' => ['required', 'integer', 'min:1'],
            'total_hour' => ['required', 'integer', 'min:1'],
            'type_subject' => ['required', 'string', new Enum(TypeSubject::class)],
            'color' => ['nullable', 'string', 'max:20'],
            'teacher_id' => ['required', 'exists:teachers,id'],
            'specialty_id' => ['required', 'exists:specialties,id'],
        ];
    }
}
