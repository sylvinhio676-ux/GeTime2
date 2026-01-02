<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campusIds = Campus::query()->pluck('id')->all();
        $types = ['cours', 'td', 'tp'];
        $count = 30;

        for ($index = 0; $index < $count; $index++) {
            $letter = chr(ord('A') + intdiv($index, 6));
            $number = 101 + ($index % 6);
            $room = [
                'code' => $letter . $number,
                'capacity' => 20 + (($index % 8) * 5),
                'is_available' => $index % 4 !== 0,
                'campus_id' => $campusIds[$index % count($campusIds)] ?? null,
                'type_room' => $types[$index % count($types)],
            ];
            Room::create($room);
        }
    }
}
