<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request) {
        $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required']
        ]);

        $user = User::where('email', '=', $request['email'])->first();
        if ($user == null || !Hash::check($request['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Invalid email or password']);
        }

        //Genete un token ApiToken pour l'utilisateur
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);

    }

    public function logout(Request $request) {
        // supprimer le jeton de l'utilisateur connecté
        /** @var \Laravel\Sanctum\PersonalAccessToken|null $token */
        $token = $request->user()->currentAccessToken();

        // Utiliser l'opérateur nullsafe et indiquer le type au static analyzer
        $token?->delete();

        return response()->noContent();
    }
}
