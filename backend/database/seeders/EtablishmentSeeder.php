<?php

namespace Database\Seeders;

use App\Models\Etablishment;
use Illuminate\Database\Seeder;

class EtablishmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $etablishments = [
            ['etablishment_name' => 'Campus Central', 'description' => 'Etablissement principal', 'city' => 'Yaounde'],
            ['etablishment_name' => 'Campus Nord', 'description' => 'Pôle technologique', 'city' => 'Douala'],
            ['etablishment_name' => 'Campus Sud', 'description' => 'Pôle santé', 'city' => 'Bafoussam'],
            ['etablishment_name' => 'Campus Ouest', 'description' => 'Pôle ingénierie', 'city' => 'Bamenda'],
            ['etablishment_name' => 'Campus Littoral', 'description' => 'Pôle maritime', 'city' => 'Limbe'],
        ];

        foreach ($etablishments as $etablishment) {
            Etablishment::create($etablishment);
        }
    }
}
