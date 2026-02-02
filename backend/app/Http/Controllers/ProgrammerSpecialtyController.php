<?php

namespace App\Http\Controllers;

use App\Models\Specialty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProgrammerSpecialtyController extends Controller
{
    public function update(Request $request, User $user): JsonResponse
    {
        if (!$user->hasRole('programmer')) {
            return response()->json(['message' => 'L’utilisateur doit avoir le rôle de programmateur pour recevoir des spécialités.'], 403);
        }

        $data = $request->validate([
            'specialties' => ['nullable', 'array'],
            'specialties.*' => ['integer', 'exists:specialties,id'],
        ]);

        $specialtyIds = $data['specialties'] ?? [];

        if (!empty($specialtyIds)) {
            Specialty::whereIn('id', $specialtyIds)->update(['programmer_id' => $user->id]);
            Specialty::where('programmer_id', $user->id)
                ->whereNotIn('id', $specialtyIds)
                ->update(['programmer_id' => null]);
        } else {
            Specialty::where('programmer_id', $user->id)->update(['programmer_id' => null]);
        }

        return response()->json([
            'message' => 'Spécialités assignées mises à jour.',
            'data' => $specialtyIds,
        ]);
    }
}
