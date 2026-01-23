<?php

namespace App\Console\Commands;

use App\Enum\JourEnum;
use App\Models\Programmation;
use App\Notifications\TeacherScheduleReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendTeacherScheduleReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-teacher-schedule-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envoie un rappel aux enseignants pour leurs creneaux du landemain';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tomorrow = Carbon::now()->addDay()->startOfDay();
        $programmations = Programmation::with([
            'subject.specialty',
            'room.campus.etablishment',
            'subject.teacher.user'
        ])
        ->where('day', $this->mapDayToEnum($tomorrow))
        ->get()
        ->groupBy(fn($prog) => $prog->subject->teacher_id);

        foreach($programmations as $teacherId => $slots){
            $teacherUser = $slots->first()->subject->teacher?->user;
            if(!$teacherUser) {
                continue;
            }

            $teacherUser->notify(new TeacherScheduleReminderNotification($slots));
        }

        $this->info("Rappels envoyes pour {$programmations->count()} enseignant.");
    }

    private function mapDayToEnum(Carbon $date): string
    {
        $map = [
            1 => JourEnum::LUNDI,
            2 => JourEnum::MARDI,
            3 => JourEnum::MERCREDI,
            4 => JourEnum::JEUDI,
            5 => JourEnum::VENDREDI,
            6 => JourEnum::SAMEDI,
            7 => JourEnum::DIMANCHE,
        ];

        return $map[$date->isoWeekday()]->value;
    }

}
