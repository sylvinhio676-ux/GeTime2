<?php

use App\Models\Programmation;
use App\Services\DisponibilityConversionService;
use App\Models\Room;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('schedules:remind-teachers')
    ->dailyAt('18:00');

Schedule::command('disponibilities:auto-schedule')
    ->dailyAt('02:30');

Artisan::command('programmations:assign-rooms {--dry-run}', function () {
    if (!Schema::hasColumn('programmations', 'campus_id')) {
        $this->error('La colonne programmations.campus_id est absente. Stop.');
        return self::FAILURE;
    }

    $dryRun = (bool) $this->option('dry-run');
    $assigned = 0;
    $skipped = 0;
    $noRoom = 0;

    $this->info($dryRun ? 'Mode dry-run: aucune modification.' : 'Affectation des salles...');

    Programmation::whereNull('room_id')
        ->orderBy('id')
        ->chunkById(100, function ($programmations) use ($dryRun, &$assigned, &$skipped, &$noRoom) {
            foreach ($programmations as $prog) {
                if (!$prog->campus_id) {
                    $skipped++;
                    continue;
                }

                $subject = $prog->subject()->with('specialty')->first();
                if (!$subject) {
                    $skipped++;
                    continue;
                }

                $requiredCapacity = $subject->specialty?->number_student ?? 0;
                $roomType = $subject->type_subject?->value ?? null;

                $roomQuery = Room::where('campus_id', $prog->campus_id)
                    ->where('is_available', true)
                    ->where('capacity', '>=', $requiredCapacity);

                if ($roomType) {
                    $roomQuery->where('type_room', $roomType);
                }

                $room = $roomQuery->whereDoesntHave('programmations', function ($q) use ($prog) {
                    $q->where('day', $prog->day)
                        ->where('hour_star', '<', $prog->hour_end)
                        ->where('hour_end', '>', $prog->hour_star);
                })->orderBy('capacity')->first();

                if (!$room) {
                    $noRoom++;
                    continue;
                }

                if (!$dryRun) {
                    $prog->room_id = $room->id;
                    $prog->save();
                }
                $assigned++;
            }
        });

    $this->info("Assignées: {$assigned}");
    $this->info("Sans campus/subject: {$skipped}");
    $this->info("Sans salle dispo: {$noRoom}");

    return self::SUCCESS;
})->purpose('Assigne automatiquement les salles aux programmations existantes (basé sur campus_id)');

Artisan::command('disponibilities:auto-schedule', function () {
    /** @var DisponibilityConversionService $service */
    $service = app(DisponibilityConversionService::class);
    $programmations = $service->processPending();

    if (empty($programmations)) {
        $this->info('Aucune disponibilité active n’a pu être transformée.');
        return self::SUCCESS;
    }

    $this->info(sprintf('Programmations automatiques créées : %d', count($programmations)));
    return self::SUCCESS;
})->purpose('Convertit automatiquement les disponibilités actives en programmations validées');
