<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Mail\ForgotPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $user = User::where('email', $request->input('email'))->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $plainPassword = Str::random(12);
        $user->password = Hash::make($plainPassword);
        $user->setRememberToken(Str::random(60));
        $user->save();

        Mail::to($user->email)->send(new ForgotPasswordMail($user, $plainPassword));

        return response()->json([
            'message' => 'Un nouveau mot de passe a été envoyé par e-mail',
            'data' => ['password' => $plainPassword],
        ], 200);
    }
}
