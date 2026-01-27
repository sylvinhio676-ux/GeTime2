<?php

namespace App\Services;

use App\Models\AnalyticsEntry;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function recordTracking(?User $user, array $payload): AnalyticsEntry
    {
        return AnalyticsEntry::create([
            'user_id' => $user?->id,
            'campus_id' => $payload['campus_id'] ?? null,
            'campus_name' => $payload['campus_name'] ?? null,
            'distance_m' => $payload['distance'] ?? 0,
            'duration_seconds' => $payload['duration_seconds'] ?? 0,
            'path' => $payload['path'] ?? [],
            'meta' => $payload['meta'] ?? [],
        ]);
    }

    public function getUsageMetrics(): array
    {
        $total = AnalyticsEntry::count();
        $avgDuration = AnalyticsEntry::avg('duration_seconds') ?? 0;
        $avgDistance = AnalyticsEntry::avg('distance_m') ?? 0;
        $lastWeek = Carbon::now()->subDays(7);
        $sessionsLast7Days = AnalyticsEntry::where('created_at', '>=', $lastWeek)->count();

        return [
            'total_sessions' => $total,
            'avg_duration_seconds' => round($avgDuration, 2),
            'avg_distance_m' => round($avgDistance, 2),
            'sessions_last_7_days' => $sessionsLast7Days,
            'sessions_per_day' => $this->getSessionsPerDay(),
        ];
    }

    public function getSessionsPerDay(int $days = 7): array
    {
        $start = Carbon::now()->subDays($days - 1)->startOfDay();

        $sessions = AnalyticsEntry::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as sessions')
            ->where('created_at', '>=', $start)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn($row) => [
                'day' => $row->day,
                'sessions' => (int) $row->sessions,
            ])
            ->toArray();

        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i)->format('Y-m-d');
            $chart[$day] = 0;
        }

        foreach ($sessions as $session) {
            $chart[$session['day']] = $session['sessions'];
        }

        return collect($chart)->map(fn($value, $day) => ['day' => $day, 'sessions' => $value])->values()->toArray();
    }

    public function getTopCampuses(int $limit = 5): array
    {
        return AnalyticsEntry::query()
            ->select('campus_name', DB::raw('COUNT(*) as sessions'), DB::raw('AVG(distance_m) as avg_distance'))
            ->whereNotNull('campus_name')
            ->groupBy('campus_name')
            ->orderByDesc('sessions')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'campus_name' => $row->campus_name,
                'sessions' => (int) $row->sessions,
                'avg_distance_m' => round($row->avg_distance, 2),
            ])
            ->toArray();
    }

    /**
     * Retourne les dernières sessions enregistrées
     */
    public function getRecentSessions(int $limit = 10): array
    {
        return AnalyticsEntry::query()
            ->with('user')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn($entry) => [
                'id' => $entry->id,
                'user' => $entry->user?->name,
                'campus' => $entry->campus_name,
                'duration_seconds' => $entry->duration_seconds,
                'distance_m' => $entry->distance_m,
                'created_at' => $entry->created_at,
            ])
            ->toArray();
    }
}
