<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Exception;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = AuditLog::with('user')->latest();
            if ($request->filled('module')) {
                $module = trim($request->query('module'));
                $query->where('action', 'like', "%/{$module}%");
            }
            $logs = $query->paginate(20);
            return paginatedResponse($logs, "Historique chargé");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
