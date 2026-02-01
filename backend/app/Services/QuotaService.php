<?php

namespace App\Services;

use App\Models\SubjectQuota;
use App\Models\Programmation;
use Carbon\Carbon;

class QuotaService
{
    public function calculateHoursUsed(Programmation $programmation): float
    {
        $start = Carbon::parse($programmation->hour_star);
        $end = Carbon::parse($programmation->hour_end);
        return abs($end->diffInMinutes($start)) / 60.0;
    }

    public function calculateHoursFromTimes(string $start, string $end): float
    {
        try {
            $parsedStart = Carbon::parse($start);
            $parsedEnd = Carbon::parse($end);
            if ($parsedEnd->lessThanOrEqualTo($parsedStart)) return 0;
            return $parsedEnd->diffInMinutes($parsedStart) / 60.0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    public function getOrCreateQuota(int $subjectId, int $teacherId): SubjectQuota
    {
        $subject = \App\Models\Subject::find($subjectId);
        $currentTotal = $subject ? (float)$subject->total_hour : 0.0;

        // 1. On récupère ou on crée l'entrée
        $quota = SubjectQuota::firstOrCreate(
            ['subject_id' => $subjectId, 'teacher_id' => $teacherId],
            [
                'total_quota' => $currentTotal,
                'used_quota' => 0, 
                'remaining_quota' => $currentTotal
            ]
        );

        // 2. CORRECTION CRITIQUE : Si le quota existe mais que total_quota est différent 
        // de la matière (ex: 0 alors qu'elle fait 45h), on synchronise.
        if (abs((float)$quota->total_quota - $currentTotal) > 0.01) {
            $quota->total_quota = $currentTotal;
            $quota->remaining_quota = $currentTotal - $quota->used_quota;
            $quota->save();
        }

        return $quota;
    }

    public function isQuotaExceeded(int $subjectId, int $teacherId, float $hoursToUse): bool
    {
        $quota = $this->getOrCreateQuota($subjectId, $teacherId);
        // On autorise si le dépassement est inférieur à 1 minute (0.01h)
        return ($quota->used_quota + $hoursToUse) > ($quota->total_quota + 0.01);
    }

    /**
     * MISE À JOUR : Utilisation de saveQuietly() pour briser la boucle infinie
     */
    public function updateQuotaOnCreate(Programmation $programmation): void
    {
        $hoursUsed = $this->calculateHoursUsed($programmation);
        $quota = $this->getOrCreateQuota($programmation->subject_id, $programmation->subject->teacher_id ?? 0);
        
        $quota->used_quota += $hoursUsed;
        $quota->remaining_quota = $quota->total_quota - $quota->used_quota;
        $quota->save();

        // On met à jour la programmation sans déclencher les événements de modèle
        $programmation->hours_used = $hoursUsed;
        $programmation->saveQuietly(); 
    }

    /**
     * MISE À JOUR : Utilisation de saveQuietly()
     */
    public function updateQuotaOnUpdate(Programmation $programmation, float $oldHoursUsed): void
    {
        $newHoursUsed = $this->calculateHoursUsed($programmation);
        $difference = $newHoursUsed - $oldHoursUsed;

        $quota = $this->getOrCreateQuota($programmation->subject_id, $programmation->subject->teacher_id ?? 0);
        
        $quota->used_quota += $difference;
        $quota->remaining_quota = $quota->total_quota - $quota->used_quota;
        $quota->save();

        $programmation->hours_used = $newHoursUsed;
        $programmation->saveQuietly(); 
    }

    public function updateQuotaOnDelete(Programmation $programmation): void
    {
        $quota = $this->getOrCreateQuota($programmation->subject_id, $programmation->subject->teacher_id ?? 0);
        $quota->used_quota -= (float) ($programmation->hours_used ?? 0);
        $quota->remaining_quota = $quota->total_quota - $quota->used_quota;
        $quota->save();
    }

    public function getQuotaStatus(int $subjectId, int $teacherId): array
    {
        // 1. Récupérer le quota de base (qui contient la colonne total_quota)
        $quota = $this->getOrCreateQuota($subjectId, $teacherId);
        
        // 2. Calculer le réalisé RÉEL depuis la table programmations (Source de vérité)
        // On ne compte que les séances "published"
        $realUsedMinutes = \App\Models\Programmation::where('subject_id', $subjectId)
            ->where('status', 'published')
            ->get()
            ->sum(function($prog) {
                // On utilise hours_used s'il existe, sinon on parse les heures
                return (float) ($prog->hours_used ?? 0);
            });

        $totalQuota = (float) $quota->total_quota;
        $usedQuota = (float) $realUsedMinutes;
        $remainingQuota = max(0, $totalQuota - $usedQuota);

        // 3. Logique de statut robuste
        $status = 'not_programmed';
        if ($usedQuota > 0) {
            $status = ($usedQuota >= $totalQuota && $totalQuota > 0) 
                    ? 'completed' 
                    : 'in_progress';
        }

        return [
            'subject_id'      => $subjectId,
            'teacher_id'      => $teacherId,
            'total_quota'     => $totalQuota,
            'used_quota'      => $usedQuota,
            'remaining_quota' => $remainingQuota,
            'status'          => $status,
            'percentage_used' => $totalQuota > 0 ? ($usedQuota / $totalQuota) * 100 : 0,
        ];
    }

    public function getStats(): array
    {
        $quotas = SubjectQuota::with(['subject', 'teacher.user'])->get();

        $stats = [
            'total_subjects' => $quotas->count(),
            'completed' => 0,
            'in_progress' => 0,
            'not_programmed' => 0,
            'subjects' => [],
        ];

        foreach ($quotas as $quota) {
            $statusData = $this->getQuotaStatus($quota->subject_id, $quota->teacher_id);
            $status = $statusData['status'];
            
            $stats[$status]++;
            $stats['subjects'][] = array_merge($statusData, [
                'subject_name' => $quota->subject->subject_name ?? 'Inconnu',
                'teacher_name' => $quota->teacher->user->name ?? 'N/A',
            ]);
        }

        return $stats;
    }
}