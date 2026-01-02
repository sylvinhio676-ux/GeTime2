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
                'name' => 'Milford Test',
                'email' => 'milford46@example.net',
                'phone' => '690000002',
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
                'name' => 'David Programmer',
                'email' => 'david.programmer@example.com',
                'phone' => '690000006',
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
            [
                'name' => 'Frank User',
                'email' => 'frank.user@example.com',
                'phone' => '690000008',
                'password' => Hash::make('password'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Grace User',
                'email' => 'grace.user@example.com',
                'phone' => '690000009',
                'password' => Hash::make('password'),
                'role' => 'programmer',
            ],
            [
                'name' => 'Hugo User',
                'email' => 'hugo.user@example.com',
                'phone' => '690000010',
                'password' => Hash::make('password'),
                'role' => 'teacher',
            ],
        ];
        $extraRoles = ['teacher', 'programmer', 'admin'];
        for ($i = 11; $i <= 30; $i++) {
            $users[] = [
                'name' => sprintf('User %02d', $i),
                'email' => sprintf('user%02d@example.com', $i),
                'phone' => sprintf('690%06d', $i),
                'password' => Hash::make('password'),
                'role' => $extraRoles[$i % count($extraRoles)],
            ];
        }

        // 2. Boucle de création et d'assignation
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
