<?php

namespace Database\Seeders;

use App\Models\Etablishment;
use App\Models\Programmer;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProgrammersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userIds = User::query()->pluck('id')->all();
        $etablishmentIds = Etablishment::query()->pluck('id')->all();
        $year = date('Y');

        for ($i = 1; $i <= 5; $i++) {
            Programmer::create([
                'registration_number' => sprintf('P%s%04d', $year, $i),
                'user_id' => $userIds[($i - 1) % count($userIds)] ?? null,
                'etablishment_id' => $etablishmentIds[($i - 1) % count($etablishmentIds)] ?? null,
            ]);
        }
    }
}
