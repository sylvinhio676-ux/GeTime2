<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\Disponibility;
use App\Models\Etablishment;
use App\Models\Level;
use App\Models\Programmation;
use App\Models\Programmer;
use App\Models\Room;
use App\Models\School;
use App\Models\Sector;
use App\Models\Specialty;
use App\Models\SpecialtyProgrammation;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Year;
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
        User::factory(5)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            UsersSeeder::class,
            SchoolsSeeder::class,
            EtablishmentSeeder::class,
            SectorsSeeder::class,
            CampusSeeder::class,
            ProgrammersSeeder::class,
            TeachersSeeder::class,
            SpecialtiesSeeder::class,
            SubjectsSeeder::class,
            DisponibilitiesSeeder::class,
            YearSeeder::class,
            ProgrammationsSeeder::class,
            RoomsSeeder::class,
            SpecialtyProgrammationsSeeder::class,
        ]);

    }
}
