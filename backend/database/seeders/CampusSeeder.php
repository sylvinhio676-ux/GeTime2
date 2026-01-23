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
        $etablishmentIds = Etablishment::query()->pluck('id')->all();

        $baseCampuses = [
            ['campus_name' => 'Campus A', 'city' => 'Yaounde Centre', 'address' => 'Quartier Etoudi', 'latitude' => 3.8480, 'longitude' => 11.5021],
            ['campus_name' => 'Campus B', 'city' => 'Douala Bonapriso', 'address' => 'Rue Joss', 'latitude' => 4.0500, 'longitude' => 9.7067],
            ['campus_name' => 'Campus C', 'city' => 'Bafoussam Ville', 'address' => 'Boulevard de la Liberté', 'latitude' => 5.4800, 'longitude' => 10.4173],
            ['campus_name' => 'Campus D', 'city' => 'Bertoua Est', 'address' => 'Avenue du Président', 'latitude' => 4.5734, 'longitude' => 13.6821],
            ['campus_name' => 'Campus E', 'city' => 'Bamenda Nord', 'address' => 'Quartier Mankon', 'latitude' => 5.9580, 'longitude' => 10.1820],
            ['campus_name' => 'Campus F', 'city' => 'Limbe Sud', 'address' => 'Zone portuaire', 'latitude' => 4.0132, 'longitude' => 9.2100],
            ['campus_name' => 'Campus G', 'city' => 'Ngaoundere Gare', 'address' => 'Proximité gare', 'latitude' => 7.3131, 'longitude' => 13.5845],
            ['campus_name' => 'Campus H', 'city' => 'Garoua Centre', 'address' => 'Rue des Banques', 'latitude' => 9.3000, 'longitude' => 13.3945],
            ['campus_name' => 'Campus I', 'city' => 'Ebolowa Sud', 'address' => 'Centre-ville', 'latitude' => 2.8986, 'longitude' => 11.1495],
            ['campus_name' => 'Campus J', 'city' => 'Kribi Plage', 'address' => 'Front de mer', 'latitude' => 2.9373, 'longitude' => 9.9431],
        ];
        $count = 30;

        for ($index = 0; $index < $count; $index++) {
            $campus = $baseCampuses[$index % count($baseCampuses)];
            if ($index >= count($baseCampuses)) {
                $campus['campus_name'] = sprintf('%s %d', $campus['campus_name'], $index + 1);
            }
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
