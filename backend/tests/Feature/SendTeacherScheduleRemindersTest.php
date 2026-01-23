<?php

namespace Tests\Feature;

use App\Enum\JourEnum;
use App\Models\Campus;
use App\Models\Room;
use App\Models\Specialty;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Year;
use App\Notifications\TeacherScheduleReminderNotification;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SendTeacherScheduleRemindersTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_sends_notification_for_tomorrow_slots()
    {
        Notification::fake();
        Carbon::setTestNow(Carbon::parse('2026-01-23 03:55:00'));

        $teacher = Teacher::factory()->create();
        $specialty = Specialty::factory()->create();
        $subject = Subject::factory()->create([
            'teacher_id' => $teacher->id,
            'specialty_id' => $specialty->id,
        ]);
        $room = Room::factory()->create();
        $year = Year::factory()->create();

        $tomorrow = Carbon::now()->addDay();
        $enumDay = JourEnum::from($tomorrow->locale('fr')->dayName);
        \App\Models\Programmation::create([
            'day' => $enumDay->value,
            'hour_star' => '08:00',
            'hour_end' => '10:00',
            'subject_id' => $subject->id,
            'programmer_id' => $specialty->programmer_id,
            'year_id' => $year->id,
            'room_id' => $room->id,
            'status' => 'validated',
        ]);

        Artisan::call('app:send-teacher-schedule-reminders');

        Notification::assertSentTo(
            $teacher->user,
            TeacherScheduleReminderNotification::class,
            fn ($notification) => $notification->programmations->count() === 1 &&
                                 $notification->programmations->first()->subject_id === $subject->id
        );
    }
}
