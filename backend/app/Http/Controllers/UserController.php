<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\UserRequest;
use App\Http\Requests\Updates\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Exception;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    private function canManageRole(User $actor, ?string $roleName): bool
    {
        if (!$roleName) {
            return false;
        }
        if ($actor->hasRole('super_admin')) {
            return true;
        }
        if (!$actor->hasRole('admin')) {
            return false;
        }
        return in_array($roleName, ['admin', 'teacher', 'programmer'], true);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $users = User::with('roles')->get();
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
            $roleName = $data['role'] ?? null;
            unset($data['role']);
            $actor = $request->user();
            if (!$actor || !$this->canManageRole($actor, $roleName) || $roleName === 'super_admin') {
                return forbiddenResponse("Accès refusé");
            }
            // Ensure password is present and will be hashed via model cast
            $user = User::create($data);
            if (!empty($roleName)) {
                Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'sanctum']);
                $rolesToSync = [$roleName];
                if ($roleName === 'super_admin') {
                    $rolesToSync[] = 'admin';
                }
                $user->syncRoles($rolesToSync);
            }
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
            $data = $request->validated();
            $roleName = $data['role'] ?? null;
            unset($data['role']);
            $actor = $request->user();
            if (!$actor) {
                return forbiddenResponse("Accès refusé");
            }
            if ($user->hasRole('super_admin') && !$actor->hasRole('super_admin')) {
                return forbiddenResponse("Accès refusé");
            }
            $user->update($data);
            if (!empty($roleName)) {
                if (!$this->canManageRole($actor, $roleName) || $roleName === 'super_admin') {
                    return forbiddenResponse("Accès refusé");
                }
                Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'sanctum']);
                $rolesToSync = [$roleName];
                if ($roleName === 'super_admin') {
                    $rolesToSync[] = 'admin';
                }
                $user->syncRoles($rolesToSync);
            }
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
            $actor = request()->user();
            if (!$actor) {
                return forbiddenResponse("Accès refusé");
            }
            if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
                if (!$actor->hasRole('super_admin')) {
                    return forbiddenResponse("Accès refusé");
                }
            } elseif (!$actor->hasRole('admin') && !$actor->hasRole('super_admin')) {
                return forbiddenResponse("Accès refusé");
            }
            $user->delete();
            return successResponse(null, "Utilisateur supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
