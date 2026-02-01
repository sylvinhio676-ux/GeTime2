<?php

namespace App\Http\Controllers;

use App\Models\AutomationRun;
use Illuminate\Http\Request;

class AutomationReportController extends Controller
{
    public function latest()
    {
        $run = AutomationRun::latest()->first();
        return successResponse($run, 'Dernière exécution');
    }

    public function index()
    {
        $runs = AutomationRun::orderByDesc('created_at')->limit(10)->get();
        return successResponse($runs, 'Historique des exécutions');
    }

    public function stats()
    {
        $avgPublished = AutomationRun::avg('published_count') ?? 0;
        $avgConflicts = AutomationRun::avg('conflicts_count') ?? 0;
        return successResponse([
            'avg_published' => round($avgPublished, 2),
            'avg_conflicts' => round($avgConflicts, 2),
        ]);
    }
}
