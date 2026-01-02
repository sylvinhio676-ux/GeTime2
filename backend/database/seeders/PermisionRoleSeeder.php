<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermisionRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['permission_name' => 'create-role', 'role_name' => 'admin'],
            ['permission_name' => 'edit-role', 'role_name' => 'admin'],
            ['permission_name' => 'delete-role', 'role_name' => 'admin'],
            ['permission_name' => 'view-role', 'role_name' => 'admin'],
            ['permission_name' => 'create-user', 'role_name' => 'admin'],
            ['permission_name' => 'edit-user', 'role_name' => 'admin'],
            ['permission_name' => 'delete-user', 'role_name' => 'admin'],
            ['permission_name' => 'view-user', 'role_name' => 'admin'],

            ['permission_name' => 'view-subject', 'role_name' => 'teacher'],
            ['permission_name' => 'view-programmation', 'role_name' => 'teacher'],
            ['permission_name' => 'view-disponibility', 'role_name' => 'teacher'],
            ['permission_name' => 'create-disponibility', 'role_name' => 'teacher'],
            ['permission_name' => 'edit-disponibility', 'role_name' => 'teacher'],
            ['permission_name' => 'delete-disponibility', 'role_name' => 'teacher'],
            ['permission_name' => 'view-room', 'role_name' => 'teacher'],
            ['permission_name' => 'view-year', 'role_name' => 'teacher'],
            ['permission_name' => 'view-specialty', 'role_name' => 'teacher'],

            ['permission_name' => 'view-programmation', 'role_name' => 'programmer'],
            ['permission_name' => 'create-programmation', 'role_name' => 'programmer'],
            ['permission_name' => 'edit-programmation', 'role_name' => 'programmer'],
            ['permission_name' => 'delete-programmation', 'role_name' => 'programmer'],
            ['permission_name' => 'view-subject', 'role_name' => 'programmer'],
            ['permission_name' => 'view-teacher', 'role_name' => 'programmer'],
            ['permission_name' => 'view-room', 'role_name' => 'programmer'],
            ['permission_name' => 'view-year', 'role_name' => 'programmer'],
            ['permission_name' => 'view-level', 'role_name' => 'programmer'],
            ['permission_name' => 'view-specialty', 'role_name' => 'programmer'],
            ['permission_name' => 'view-sector', 'role_name' => 'programmer'],
        ];

        $guard = config('auth.defaults.guard', 'sanctum');

        $permissions = collect($data)->pluck('permission_name')->unique();
        Permission::query()
            ->whereIn('name', $permissions)
            ->where('guard_name', '!=', $guard)
            ->delete();
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(
                ['name' => $permissionName, 'guard_name' => $guard]
            );
        }

        $roles = collect($data)->pluck('role_name')->unique();
        $roles = $roles->merge(['super_admin'])->unique();
        Role::query()
            ->whereIn('name', $roles)
            ->where('guard_name', '!=', $guard)
            ->delete();
        foreach ($roles as $roleName) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => $guard]
            );
            $rolePermissions = $roleName === 'super_admin'
                ? $permissions->all()
                : collect($data)
                    ->where('role_name', $roleName)
                    ->pluck('permission_name')
                    ->unique()
                    ->all();
            $role->syncPermissions($rolePermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
