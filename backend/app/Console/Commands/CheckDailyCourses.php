<?php

namespace App\Console\Commands;

use App\Models\Programmation;
use App\Models\User;
use App\Notifications\VerifyCourseAttendance;
use Illuminate\Console\Command;

class CheckDailyCourses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-daily-courses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recupère et vérifie les cours du jour';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //Récupérer les programmations d'aujourd'hui
        $today = now()->locale('fr')->dayName;
        $programmations = Programmation::whereDate('day', $today)
            ->where('status', 'published')
            ->with(['subject.specialty', 'subject.teacher.user'])
            ->get();

        foreach ($programmations as $prog) {
            //Trouver le programmateur responsable de la spécialité de cette matière
            $programmerId = $prog->subject->specialty->programmer_id;
            $programmer = User::find($programmerId);

            if ($programmer) {
                //Envoyer une notification de vérification
                $programmer->notify(new VerifyCourseAttendance($prog));
                $this->info("Notification envoyée à {$programmer->name} pour la programmation ID {$prog->id}");
            } else {
                $this->warn("Aucun programmateur trouvé pour la spécialité ID {$prog->subject->specialty->id}");
            }
        }
    }
}
