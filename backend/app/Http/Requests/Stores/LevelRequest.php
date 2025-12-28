<?php

namespace App\Http\Requests\Stores;

use Illuminate\Foundation\Http\FormRequest;

class LevelRequest extends FormRequest
{
    // Autorisation de la requête
    public function authorize(): bool
    {
        return true; // mettre à false si tu veux gérer l'autorisation
    }

    // Règles de validation
    public function rules(): array
    {
        return [
            'name_level' => 'required|string|max:255|unique:levels,name_level',
        ];
    }

    // Messages d'erreur personnalisés (optionnel)
    public function messages(): array
    {
        return [
            'name_level.required' => 'Le nom du niveau est obligatoire.',
            'name_level.unique' => 'Ce niveau existe déjà.',
            'name_level.max' => 'Le nom du niveau ne doit pas dépasser 255 caractères.',
        ];
    }
}
