<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\Etablishment;
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
            ['campus_name' => 'Campus A', 'localisation' => 'Yaounde Centre'],
            ['campus_name' => 'Campus B', 'localisation' => 'Douala Bonapriso'],
            ['campus_name' => 'Campus C', 'localisation' => 'Bafoussam Ville'],
            ['campus_name' => 'Campus D', 'localisation' => 'Bertoua Est'],
            ['campus_name' => 'Campus E', 'localisation' => 'Bamenda Nord'],
            ['campus_name' => 'Campus F', 'localisation' => 'Limbe Sud'],
            ['campus_name' => 'Campus G', 'localisation' => 'Ngaoundere Gare'],
            ['campus_name' => 'Campus H', 'localisation' => 'Garoua Centre'],
            ['campus_name' => 'Campus I', 'localisation' => 'Ebolowa Sud'],
            ['campus_name' => 'Campus J', 'localisation' => 'Kribi Plage'],
        ];
        $count = 30;

        for ($index = 0; $index < $count; $index++) {
            $campus = $baseCampuses[$index % count($baseCampuses)];
            if ($index >= count($baseCampuses)) {
                $campus['campus_name'] = sprintf('%s %d', $campus['campus_name'], $index + 1);
            }
            $campus['etablishment_id'] = $etablishmentIds[$index % count($etablishmentIds)] ?? null;
            Campus::create($campus);
        }
    }
}
