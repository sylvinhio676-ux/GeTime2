<?php

namespace App\Http\Requests\Stores;

use Illuminate\Foundation\Http\FormRequest;

class RoomRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:255', 'unique:rooms,code'],
            'capacity' => ['required', 'integer', 'min:1'],
            'is_available' => ['boolean'],
            'type_room' => ['required', 'in:cours,td,tp'],
            'campus_id' => ['required', 'exists:campuses,id'],
        ];
    }
}
