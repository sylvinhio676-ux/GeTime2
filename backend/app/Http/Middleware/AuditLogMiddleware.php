<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $response;
        }

        $user = $request->user();
        $action = sprintf('%s %s', $request->method(), '/' . ltrim($request->path(), '/'));

        AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
        ]);

        return $response;
    }
}
