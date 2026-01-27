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
        $campusIds = Campus::query()->take(3)->pluck('id')->all();
        $rooms = [
            ['code' => 'A101', 'capacity' => 25, 'is_available' => true, 'type_room' => 'cours'],
            ['code' => 'B102', 'capacity' => 20, 'is_available' => false, 'type_room' => 'td'],
            ['code' => 'C103', 'capacity' => 30, 'is_available' => true, 'type_room' => 'cours'],
            ['code' => 'D104', 'capacity' => 18, 'is_available' => true, 'type_room' => 'tp'],
            ['code' => 'E105', 'capacity' => 22, 'is_available' => false, 'type_room' => 'td'],
        ];

        foreach ($rooms as $index => $room) {
            $room['campus_id'] = $campusIds[$index % count($campusIds)] ?? null;
            Room::create($room);
        }
    }
}
