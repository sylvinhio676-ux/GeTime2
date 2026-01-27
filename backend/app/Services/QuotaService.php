<?php

namespace App\Services;

use App\Models\SubjectQuota;
use App\Models\Programmation;
use Carbon\Carbon;

class QuotaService
{
    /**
     * Calculate hours used for a programmation.
     */
    public function calculateHoursUsed(Programmation $programmation): float
    {
        $start = Carbon::parse($programmation->hour_star);
        $end = Carbon::parse($programmation->hour_end);
        return $end->diffInMinutes($start) / 60.0;
    }

    /**
     * Calculate hours between two time strings.
     */
    public function calculateHoursFromTimes(string $start, string $end): float
    {
        try {
            $parsedStart = Carbon::parse($start);
            $parsedEnd = Carbon::parse($end);
            if ($parsedEnd->lessThanOrEqualTo($parsedStart)) {
                return 0;
            }
            return $parsedEnd->diffInMinutes($parsedStart) / 60.0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get or create quota for subject-teacher.
     */
    public function getOrCreateQuota(int $subjectId, int $teacherId): SubjectQuota
    {
        return SubjectQuota::firstOrCreate(
            ['subject_id' => $subjectId, 'teacher_id' => $teacherId],
            [
                'total_quota' => 0, // Default, can be set later
                'used_quota' => 0,
                'remaining_quota' => 0,
            ]
        );
    }

    /**
     * Check if quota is exceeded for a subject-teacher.
     */
    public function isQuotaExceeded(int $subjectId, int $teacherId, float $hoursToUse): bool
    {
        $quota = $this->getOrCreateQuota($subjectId, $teacherId);
        return ($quota->used_quota + $hoursToUse) > $quota->total_quota;
    }

    /**
     * Update quota after programmation creation.
     */
    public function updateQuotaOnCreate(Programmation $programmation): void
    {
        $hoursUsed = $this->calculateHoursUsed($programmation);
        $quota = $this->getOrCreateQuota($programmation->subject_id, $programmation->subject->teacher_id ?? 0);
        
        $quota->used_quota += $hoursUsed;
        $quota->remaining_quota = $quota->total_quota - $quota->used_quota;
        $quota->save();

        $programmation->hours_used = $hoursUsed;
        $programmation->save();
    }

    /**
     * Update quota after programmation update.
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
        $programmation->save();
    }

    /**
     * Update quota after programmation deletion.
     */
    public function updateQuotaOnDelete(Programmation $programmation): void
    {
        $quota = $this->getOrCreateQuota($programmation->subject_id, $programmation->subject->teacher_id ?? 0);
        
        $quota->used_quota -= $programmation->hours_used ?? 0;
        $quota->remaining_quota = $quota->total_quota - $quota->used_quota;
        $quota->save();
    }

    /**
     * Get quota status for a subject.
     */
    public function getQuotaStatus(int $subjectId, int $teacherId): array
    {
        $quota = $this->getOrCreateQuota($subjectId, $teacherId);
        $programmationsCount = Programmation::where('subject_id', $subjectId)->count();

        $status = 'not_programmed';
        if ($programmationsCount > 0) {
            $status = $quota->remaining_quota <= 0 ? 'completed' : 'in_progress';
        }

        return [
            'total_quota' => $quota->total_quota,
            'used_quota' => $quota->used_quota,
            'remaining_quota' => $quota->remaining_quota,
            'status' => $status,
            'percentage_used' => $quota->total_quota > 0 ? ($quota->used_quota / $quota->total_quota) * 100 : 0,
        ];
    }

    /**
     * Get stats for all subjects.
     */
    public function getStats(): array
    {
        $quotas = SubjectQuota::with('subject', 'teacher')->get();

        $stats = [
            'total_subjects' => $quotas->count(),
            'completed' => 0,
            'in_progress' => 0,
            'not_programmed' => 0,
            'subjects' => [],
        ];

        foreach ($quotas as $quota) {
            $status = $this->getQuotaStatus($quota->subject_id, $quota->teacher_id)['status'];
            $stats[$status]++;
            $stats['subjects'][] = [
                'subject' => $quota->subject->subject_name,
                'teacher' => $quota->teacher->name,
                'status' => $status,
                'percentage_used' => $quota->total_quota > 0 ? ($quota->used_quota / $quota->total_quota) * 100 : 0,
            ];
        }

        return $stats;
    }
}
