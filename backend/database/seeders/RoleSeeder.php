<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guard = 'sanctum';
        Role::updateOrCreate(['name' => 'super_admin', 'guard_name' => $guard]);
        Role::updateOrCreate(['name' => 'admin', 'guard_name' => $guard]);
        Role::updateOrCreate(['name' => 'teacher', 'guard_name' => $guard]);
        Role::updateOrCreate(['name' => 'programmer', 'guard_name' => $guard]);
    }
}
