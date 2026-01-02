<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UsersSeeder::class,
            PermisionRoleSeeder::class,
            SchoolsSeeder::class,
            EtablishmentSeeder::class,
            LevelsSeeder::class,
            SectorsSeeder::class,
            CampusSeeder::class,
            RoomsSeeder::class,
            ProgrammersSeeder::class,
            TeachersSeeder::class,
            SpecialtiesSeeder::class,
            SubjectsSeeder::class,
            DisponibilitiesSeeder::class,
            YearSeeder::class,
            ProgrammationsSeeder::class,
            SpecialtyProgrammationsSeeder::class,
        ]);
    }
}
