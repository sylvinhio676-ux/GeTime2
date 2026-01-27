<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analyticsService) {}

    public function usageMetrics()
    {
        $data = $this->analyticsService->getUsageMetrics();
        return successResponse($data);
    }

    public function topCampuses()
    {
        $campuses = $this->analyticsService->getTopCampuses();
        return successResponse(['campuses' => $campuses]);
    }

    public function recentSessions()
    {
        $sessions = $this->analyticsService->getRecentSessions();
        return successResponse(['sessions' => $sessions]);
    }
}
