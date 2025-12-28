<?php

namespace Database\Seeders;

use App\Models\Disponibility;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DisponibilitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Disponibility::factory(5)->create();
    }
}
