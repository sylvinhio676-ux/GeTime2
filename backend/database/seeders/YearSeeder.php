<?php

namespace Database\Seeders;

use App\Models\Year;
use Illuminate\Database\Seeder;

class YearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $count = 30;
        $startYear = 2010;

        for ($i = 0; $i < $count; $i++) {
            $year = $startYear + $i;
            Year::create([
                'date_star' => sprintf('%d-09-01', $year),
                'date_end' => sprintf('%d-06-30', $year + 1),
            ]);
        }
    }
}
