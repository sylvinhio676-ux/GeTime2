<?php

namespace App\Services;

use App\Models\Programmation;
use App\Models\Subject;

class ContinuityService
{
    private const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    private const SLOTS = [
        ['start' => '08:00', 'end' => '10:00'],
        ['start' => '10:00', 'end' => '12:00'],
        ['start' => '13:00', 'end' => '15:00'],
        ['start' => '15:00', 'end' => '17:00'],
    ];

    public function enforceSameRoom(array &$data, Subject $subject): void
    {
        if (!isset($data['day']) || !$subject) {
            return;
        }
        $existing = Programmation::where('subject_id', $subject->id)
            ->where('day', $data['day'])
            ->whereNotNull('room_id')
            ->whereIn('status', ['draft', 'validated', 'published'])
            ->orderByDesc('hour_star')
            ->get();

        foreach ($existing as $programmation) {
            $existingRoom = $programmation->room_id;
            if (!$existingRoom) {
                continue;
            }

            if (!empty($data['room_id']) && intval($data['room_id']) !== intval($existingRoom)) {
                $data['room_id'] = $existingRoom;
                return;
            }

            $data['room_id'] = $existingRoom;
            return;
        }
    }

    private function overlapsTime(string $startA, string $endA, string $startB, string $endB): bool
    {
        $startMinutesA = $this->timeToMinutes($startA);
        $endMinutesA = $this->timeToMinutes($endA);
        $startMinutesB = $this->timeToMinutes($startB);
        $endMinutesB = $this->timeToMinutes($endB);

        return $startMinutesA < $endMinutesB && $endMinutesA > $startMinutesB;
    }

    private function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = array_map('intval', explode(':', $time));
        return $hours * 60 + $minutes;
    }

    public function resolveConflicts(Programmation $programmation): void
    {
        $conflicts = Programmation::where('room_id', $programmation->room_id)
            ->where('day', $programmation->day)
            ->where('id', '!=', $programmation->id)
            ->where('hour_star', '<', $programmation->hour_end)
            ->where('hour_end', '>', $programmation->hour_star)
            ->get();

        foreach ($conflicts as $conflict) {
            $slot = $this->findNextAvailableSlot($conflict);
            if (!$slot) {
                continue;
            }
            $conflict->update($slot);
        }
    }

    private function findNextAvailableSlot(Programmation $programmation): ?array
    {
        $teacherId = $programmation->subject?->teacher_id;
        $dayIndex = array_search($programmation->day, self::DAYS);
        $startIndex = $this->slotIndex($programmation->hour_star);

        for ($offset = 0; $offset < count(self::DAYS) * count(self::SLOTS); $offset++) {
            $dayIdx = ($dayIndex + intdiv($startIndex + $offset, count(self::SLOTS))) % count(self::DAYS);
            $slotIdx = ($startIndex + $offset) % count(self::SLOTS);
            $day = self::DAYS[$dayIdx];
            $slot = self::SLOTS[$slotIdx];
            if ($day === $programmation->day && $slot['start'] === $programmation->hour_star) {
                continue;
            }
            if ($this->isSlotFree($programmation, $day, $slot['start'], $slot['end'], $teacherId)) {
                return [
                    'day' => $day,
                    'hour_star' => $slot['start'],
                    'hour_end' => $slot['end'],
                ];
            }
        }

        return null;
    }

    private function isSlotFree(Programmation $programmation, string $day, string $start, string $end, ?int $teacherId): bool
    {
        $roomConflict = Programmation::where('room_id', $programmation->room_id)
            ->where('day', $day)
            ->where('hour_star', '<', $end)
            ->where('hour_end', '>', $start)
            ->where('id', '!=', $programmation->id)
            ->exists();

        if ($roomConflict) {
            return false;
        }

        if ($teacherId) {
            $teacherConflict = Programmation::whereHas('subject', function ($query) use ($teacherId) {
                    $query->where('teacher_id', $teacherId);
                })
                ->where('day', $day)
                ->where('hour_star', '<', $end)
                ->where('hour_end', '>', $start)
                ->where('id', '!=', $programmation->id)
                ->exists();

            if ($teacherConflict) {
                return false;
            }
        }

        return true;
    }

    private function slotIndex(string $time): int
    {
        foreach (self::SLOTS as $index => $slot) {
            if ($slot['start'] === $time) {
                return $index;
            }
        }
        return 0;
    }
}
