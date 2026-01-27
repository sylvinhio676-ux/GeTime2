<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class TrackingController extends Controller
{
    public function __construct(private AnalyticsService $analyticsService) {}

    public function store(Request $request)
    {
        try {
            $path = $request->input('path', []);
            if (!is_array($path)) {
                return errorResponse('Le trajet doit être un tableau');
            }

            $payload = [
                'path' => $path,
                'distance' => (float) ($request->input('distance') ?? 0),
                'duration_seconds' => (float) ($request->input('duration_seconds') ?? 0),
                'campus_id' => $request->input('campus_id'),
                'campus_name' => $request->input('campus_name'),
                'meta' => $request->input('meta', []),
            ];

            $this->analyticsService->recordTracking($request->user(), $payload);
            Session::put('tracking.path', $path);
            Session::put('tracking.updated_at', now());

            return successResponse(['count' => count($path)]);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
