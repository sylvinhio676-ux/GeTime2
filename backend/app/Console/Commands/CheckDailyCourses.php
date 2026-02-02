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
        $programmations = Programmation::where('day', $today)
            ->where('status', 'published')
            ->with(['subject.specialty', 'subject.teacher.user'])
            ->get();

        foreach ($programmations as $prog) {
            //Trouver le programmateur responsable de la spécialité de cette matière
            $programmerId = $prog->subject->specialty->programmer_id;

            if (!$programmerId) {
                $this->warn("Aucun programmateur assigné à la spécialité ID {$prog->subject->specialty->id} ({$prog->subject->subject_name})");
                continue;
            }

            $programmer = User::find($programmerId);
            if (!$programmer) {
                $this->warn("Programmateur introuvable (ID {$programmerId}) pour la spécialité ID {$prog->subject->specialty->id}");
                continue;
            }

            // Eviter d’envoyer à l’admin si par hasard le programmateur n’a pas été renseigné proprement
            if (!$programmer->hasRole('programmer')) {
                $this->warn("Utilisateur {$programmer->name} (ID {$programmer->id}) n’est pas un programmeur -> notification ignorée.");
                continue;
            }

            $programmer->notify(new VerifyCourseAttendance($prog));
            $this->info("Notification envoyée à {$programmer->name} pour la programmation ID {$prog->id}");
        }
    }
}
