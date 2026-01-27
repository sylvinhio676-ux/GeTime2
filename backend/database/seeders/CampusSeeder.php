<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\Etablishment;
use App\Models\Location;
use Illuminate\Database\Seeder;

class CampusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $etablishmentIds = Etablishment::query()->take(3)->pluck('id')->all();
        $campuses = [
            ['campus_name' => 'Campus A', 'city' => 'Yaounde Centre', 'address' => 'Quartier Etoudi', 'latitude' => 3.8480, 'longitude' => 11.5021],
            ['campus_name' => 'Campus B', 'city' => 'Douala Bonapriso', 'address' => 'Rue Joss', 'latitude' => 4.0500, 'longitude' => 9.7067],
            ['campus_name' => 'Campus C', 'city' => 'Bafoussam Ville', 'address' => 'Boulevard de la Liberté', 'latitude' => 5.4800, 'longitude' => 10.4173],
            ['campus_name' => 'Campus D', 'city' => 'Bertoua Est', 'address' => 'Avenue du Président', 'latitude' => 4.5734, 'longitude' => 13.6821],
            ['campus_name' => 'Campus E', 'city' => 'Bamenda Nord', 'address' => 'Quartier Mankon', 'latitude' => 5.9580, 'longitude' => 10.1820],
        ];

        foreach ($campuses as $index => $campus) {
            $campus['etablishment_id'] = $etablishmentIds[$index % count($etablishmentIds)] ?? null;
            $locationData = [
                'city' => $campus['city'],
                'address' => $campus['address'] ?? null,
                'latitude' => $campus['latitude'] ?? null,
                'longitude' => $campus['longitude'] ?? null,
            ];
            $location = Location::create(array_filter($locationData, fn($value) => $value !== null && $value !== ''));
            $campus['location_id'] = $location->id;
            Campus::create($campus);
        }
    }
}
