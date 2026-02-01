<?php

namespace App\Http\Requests\Stores;

use App\Enum\RuleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
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
        $id = $this->route('user');
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email' . ($id ? ',' . $id : '')],
            'phone' => ['required', 'string', 'unique:users,phone' . ($id ? ',' . $id : '')],
            'password' => [$this->isMethod('post') ? 'required' : 'nullable', 'string', 'min:8'],
            'role' => [
                'required',
                new Enum(RuleEnum::class),
                Rule::exists('roles', 'name')->where('guard_name', 'sanctum'),
            ],
        ];
    }
}
