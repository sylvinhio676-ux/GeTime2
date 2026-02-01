<?php

namespace App\Services;

use App\Events\ConflictDetected;
use App\Enum\JourEnum;
use App\Models\AutomationRun;
use App\Models\Programmation;
use App\Models\SubjectQuota;
use App\Models\User;
use App\Notifications\ProgrammationNotification;
use Exception;

class ProgrammationAutomationService
{
    public function __construct(private QuotaService $quotaService)
    {
    }

    /**
     * Publie automatiquement les programmations validées.
     */
    public function publishValidated(): array
    {
        $programmations = Programmation::with([
            'subject.teacher.user',
            'programmer.user',
            'room.campus',
        ])
            ->where('status', 'validated')
            ->get();

        $published = 0;
        $skipped = [];
        $retryQueue = [];

        foreach ($programmations as $programmation) {
            if ($reason = $this->detectConflict($programmation)) {
                event(new ConflictDetected($programmation, $reason));
                $skipped[] = ['id' => $programmation->id, 'reason' => $reason];
                $retryQueue[] = $programmation->id;
                continue;
            }

            if ($reason = $this->detectQuotaIssue($programmation)) {
                event(new ConflictDetected($programmation, $reason));
                $skipped[] = ['id' => $programmation->id, 'reason' => $reason];
                $retryQueue[] = $programmation->id;
                continue;
            }

            $this->publishProgrammation($programmation);
            $published++;
        }

        $this->retrySkipped($retryQueue, $skipped, $published);
        $quotaAlertsCount = $this->notifyQuotaAlerts();
        $run = $this->recordRun($published, $skipped, $quotaAlertsCount);

        return [
            'published' => $published,
            'skipped' => $skipped,
            'run' => $run,
        ];
    }

    protected function publishProgrammation(Programmation $programmation): void
    {
        $this->quotaService->updateQuotaOnCreate($programmation);
        $programmation->status = 'published';
        $programmation->save();
        $this->notifyUsers(
            $programmation,
            'Programmation publiée automatiquement',
            'programmation_published'
        );
    }

    protected function retrySkipped(array $queue, array &$skipped, int &$published): void
    {
        if (empty($queue)) {
            return;
        }

        foreach ($queue as $programmationId) {
            $programmation = Programmation::find($programmationId);
            if (!$programmation || $programmation->status !== 'validated') {
                continue;
            }

            $reasonConflict = $this->detectConflict($programmation);
            $reasonQuota = $this->detectQuotaIssue($programmation);
            $reason = $reasonConflict ?? $reasonQuota;
            if ($reason) {
                event(new ConflictDetected($programmation, $reason));
                $skipped[] = ['id' => $programmation->id, 'reason' => $reason];
                continue;
            }

            $this->publishProgrammation($programmation);
            $published++;
        }
    }

    protected function detectConflict(Programmation $programmation): ?string
    {
        $day = $programmation->day instanceof JourEnum ? $programmation->day->value : $programmation->day;
        $teacherId = $programmation->subject?->teacher?->id;

        $conflictQuery = function ($query) use ($day, $programmation) {
            $query->where('day', $day)
                ->where('hour_star', '<', $programmation->hour_end)
                ->where('hour_end', '>', $programmation->hour_star)
                ->where('status', 'published')
                ->where('id', '!=', $programmation->id);
        };

        if ($teacherId && Programmation::whereHas('subject', function ($query) use ($teacherId, $conflictQuery) {
            $query->where('teacher_id', $teacherId);
        })->where(function ($q) use ($conflictQuery) {
            $conflictQuery($q);
        })->exists()) {
            return "Conflit horaire enseignant";
        }

        if ($programmation->room_id && Programmation::where('room_id', $programmation->room_id)
                ->where(function ($q) use ($conflictQuery) {
                    $conflictQuery($q);
                })->exists()) {
            return "Conflit de salle";
        }

        return null;
    }

    protected function detectQuotaIssue(Programmation $programmation): ?string
    {
        $teacherId = $programmation->subject?->teacher?->id;
        if (!$teacherId) {
            return "Aucun enseignant rattaché";
        }

        $hours = $this->quotaService->calculateHoursUsed($programmation);
        if ($this->quotaService->isQuotaExceeded($programmation->subject_id, $teacherId, $hours)) {
            return "Quota dépassé pour la matière";
        }

        return null;
    }

    protected function notifyUsers(Programmation $programmation, string $message, string $type): void
    {
        $teacherUser = $programmation->subject?->teacher?->user;
        $programmerUser = $programmation->programmer?->user;
        $admins = User::role(['super_admin', 'admin'])->get();
        $recipients = collect([$teacherUser, $programmerUser])
            ->merge($admins)
            ->filter()
            ->unique('id');

        foreach ($recipients as $user) {
            $payload = [
                'type' => $type,
                'title' => $message,
                'message' => "Séance du {$this->formatDay($programmation)} ({$programmation->hour_star} - {$programmation->hour_end})",
                'meta' => [
                    'programmation_id' => $programmation->id,
                ],
                'action_url' => url('/dashboard/programmations'),
                'action_label' => 'Voir le planning',
            ];
            $user->notify(new ProgrammationNotification($payload));
        }
    }

    protected function notifyQuotaAlerts(): int
    {
        $critical = SubjectQuota::where('remaining_quota', '<=', 0)
            ->orWhereRaw('remaining_quota / total_quota <= 0.1')
            ->with('subject.teacher.user')
            ->get();
        if ($critical->isEmpty()) {
            return 0;
        }
        $admins = User::role(['super_admin', 'admin'])->get();
        $alerts = 0;
        foreach ($critical as $quota) {
            $subject = $quota->subject;
            $teacher = $subject?->teacher?->user;
            $message = [
                'type' => 'quota_alert',
                'title' => 'Quota critique',
                'message' => "{$subject?->subject_name} ({$teacher?->name}) a un quota restant de {$quota->remaining_quota}h",
                'meta' => ['subject_id' => $subject?->id],
                'action_url' => url('/dashboard/subjects'),
                'action_label' => 'Voir la matière',
            ];

            foreach ($admins as $admin) {
                $admin->notify(new ProgrammationNotification($message));
            }
            $alerts++;
        }

        return $alerts;
    }

    protected function recordRun(int $published, array $skipped, int $quotaAlertsCount): array
    {
        $conflictsCount = collect($skipped)
            ->filter(fn($item) => str_contains(strtolower($item['reason']), 'conflit'))
            ->count();

        $run = AutomationRun::create([
            'published_count' => $published,
            'skipped_count' => count($skipped),
            'conflicts_count' => $conflictsCount,
            'quota_alerts_count' => $quotaAlertsCount,
            'skipped_details' => $skipped,
        ]);

        return [
            'id' => $run->id,
            'published' => $published,
            'skipped' => $skipped,
            'conflicts_count' => $conflictsCount,
            'quota_alerts_count' => $quotaAlertsCount,
            'created_at' => $run->created_at,
        ];
    }

    protected function formatDay(Programmation $programmation): string
    {
        $day = $programmation->day;
        return $day instanceof JourEnum ? $day->value : (string) $day;
    }
}
