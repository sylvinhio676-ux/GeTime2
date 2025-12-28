<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\UserRequest;
use App\Http\Requests\Updates\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Exception;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $users = User::all();
            if (!$users) throw new Exception("Aucun utilisateur trouvé");
            return successResponse($users);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        try {
            $data = $request->validated();
            // Ensure password is present and will be hashed via model cast
            $user = User::create($data);
            return successResponse($user, "Utilisateur créé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        try {
            if (!$user) return notFoundResponse("Utilisateur non trouvé");
            return successResponse($user);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserUpdateRequest $request, User $user)
    {
        try {
            $user->update($request->validated());
            return successResponse($user, "Utilisateur modifié avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            $user->delete();
            return successResponse(null, "Utilisateur supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
