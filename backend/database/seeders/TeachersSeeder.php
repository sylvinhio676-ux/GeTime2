<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeachersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userIds = User::query()->pluck('id')->all();
        $year = date('Y');

        for ($i = 1; $i <= min(5, $userCount = count($userIds)); $i++) {
            Teacher::create([
                'registration_number' => sprintf('T%s%04d', $year, $i),
                'user_id' => $userIds[($i - 1) % $userCount] ?? null,
            ]);
        }
    }
}
