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
        $baseEtablishments = [
            ['etablishment_name' => 'Campus Central', 'description' => 'Etablissement principal', 'city' => 'Yaounde'],
            ['etablishment_name' => 'Campus Nord', 'description' => 'Pole technologique', 'city' => 'Douala'],
            ['etablishment_name' => 'Campus Sud', 'description' => 'Pole sante', 'city' => 'Bafoussam'],
            ['etablishment_name' => 'Campus Est', 'description' => 'Pole industriel', 'city' => 'Bertoua'],
            ['etablishment_name' => 'Campus Ouest', 'description' => 'Pole ingenierie', 'city' => 'Bamenda'],
            ['etablishment_name' => 'Campus Littoral', 'description' => 'Pole maritime', 'city' => 'Limbe'],
            ['etablishment_name' => 'Campus Montagne', 'description' => 'Pole sciences', 'city' => 'Ngaoundere'],
            ['etablishment_name' => 'Campus Ville', 'description' => 'Pole management', 'city' => 'Garoua'],
            ['etablishment_name' => 'Campus Innovation', 'description' => 'Pole innovation', 'city' => 'Ebolowa'],
            ['etablishment_name' => 'Campus International', 'description' => 'Pole international', 'city' => 'Kribi'],
        ];
        $count = 30;

        for ($i = 0; $i < $count; $i++) {
            $etablishment = $baseEtablishments[$i % count($baseEtablishments)];
            if ($i >= count($baseEtablishments)) {
                $etablishment['etablishment_name'] = sprintf('%s %d', $etablishment['etablishment_name'], $i + 1);
            }
            Etablishment::create($etablishment);
        }
    }
}
