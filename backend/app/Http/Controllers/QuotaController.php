<?php

namespace App\Http\Controllers;

use App\Services\QuotaService;
use Illuminate\Http\Request;

class QuotaController extends Controller
{
    public function __construct(private QuotaService $quotaService)
    {
    }

    public function getSubjectsByStatus(Request $request)
    {
        $status = $request->query('status'); // 'in_progress', 'completed', 'not_programmed'
        $stats = $this->quotaService->getStats();

        $filteredSubjects = collect($stats['subjects'])->filter(function ($subject) use ($status) {
            return !$status || $subject['status'] === $status;
        });

        return successResponse([
            'subjects' => $filteredSubjects,
            'summary' => [
                'total' => $stats['total_subjects'],
                'completed' => $stats['completed'],
                'in_progress' => $stats['in_progress'],
                'not_programmed' => $stats['not_programmed'],
            ],
        ]);
    }

    public function getStats()
    {
        return successResponse($this->quotaService->getStats());
    }

    public function getSubjectStats($subjectId, $teacherId)
    {
        return successResponse($this->quotaService->getQuotaStatus($subjectId, $teacherId));
    }
}
