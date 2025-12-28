<?php

namespace Database\Seeders;

use App\Models\Etablishment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EtablishmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Etablishment::factory(5)->create();  
    }
}
