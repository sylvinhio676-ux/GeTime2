<?php

namespace App\Http\Controllers;

use App\Models\DeviceToken;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeviceTokenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tokens = $request->user()->deviceTokens()->latest('last_seen_at')->get();
        return successResponse($tokens);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:512'],
            'platform' => ['nullable', 'string', 'in:web,android,ios']
        ]);

        $user = $request->user();

        $deviceToken = DeviceToken::updateOrCreate(
            ['token' => $data['token']],
            [
                'user_id' => $user->id,
                'platform' => $data['platform'] ?? 'web',
                'last_seen_at' => now(),
            ]
        );

        return createdResponse($deviceToken);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $deviceToken = $request->user()->deviceTokens()->find($id);
        if (!$deviceToken) {
            return notFoundResponse("Jeton non trouvé");
        }

        return successResponse($deviceToken);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $deviceToken = $request->user()->deviceTokens()->find($id);
        if (!$deviceToken) {
            return notFoundResponse("Jeton non trouvé");
        }

        $data = $request->validate([
            'token' => [
                'sometimes',
                'required',
                'string',
                'max:512',
                Rule::unique('device_tokens', 'token')->ignore($deviceToken->id),
            ],
            'platform' => ['sometimes', 'nullable', 'string', 'in:web,android,ios']
        ]);

        if (array_key_exists('platform', $data) && $data['platform'] === null) {
            unset($data['platform']);
        }

        $deviceToken->fill($data);
        $deviceToken->last_seen_at = now();
        $deviceToken->save();

        return successResponse($deviceToken, "Jeton mis à jour");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $deviceToken = $request->user()->deviceTokens()->find($id);
        if (!$deviceToken) {
            return notFoundResponse("Jeton non trouvé");
        }

        $deviceToken->delete();
        return successResponse(null, "Jeton supprimé");
    }
}
