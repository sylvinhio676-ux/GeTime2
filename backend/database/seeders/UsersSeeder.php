<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Définition des utilisateurs avec leurs rôles respectifs
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'phone' => '690000001',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
            [
                'name' => 'Alice Teacher',
                'email' => 'alice.teacher@example.com',
                'phone' => '690000003',
                'password' => Hash::make('password'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Bob Teacher',
                'email' => 'bob.teacher@example.com',
                'phone' => '690000004',
                'password' => Hash::make('password'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Carol Programmer',
                'email' => 'carol.programmer@example.com',
                'phone' => '690000005',
                'password' => Hash::make('password'),
                'role' => 'programmer',
            ],
            [
                'name' => 'Eva Admin',
                'email' => 'eva.admin@example.com',
                'phone' => '690000007',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
            ],
        ];

        // 2. Boucle de création et d'assignation
        // Crée les rôles si nécessaire (guard 'sanctum')
        $guardName = 'sanctum';
        $allRoles = array_unique(array_column($users, 'role'));
        foreach ($allRoles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => $guardName]);
        }

        foreach ($users as $userData) {
            // On extrait le nom du rôle pour Spatie
            $roleName = $userData['role'];
            
            // On retire 'role' du tableau car il n'existe pas en colonne dans la table users
            unset($userData['role']);

            // Création ou mise à jour de l'utilisateur
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // 3. Assignation du rôle via Spatie
            // On utilise syncRoles pour s'assurer que l'utilisateur n'a QUE ce rôle
            $user->syncRoles([$roleName]);
        }
    }
}
