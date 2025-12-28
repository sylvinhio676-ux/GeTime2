<?php

namespace App\Http\Requests\Stores;

use App\Enum\JourEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class ProgrammationRequest extends FormRequest
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
            'day' => ['required', 'string', new Enum(JourEnum::class)],
            'hour_star' => ['required', 'date_format:H:i'],
            'hour_end' => ['required', 'date_format:H:i', 'after:hour_star'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'programmer_id' => ['required', 'exists:programmers,id'],
            'year_id' => ['required', 'exists:years,id'],
        ];
    }
}
