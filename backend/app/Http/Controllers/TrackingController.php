<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Exception;

class TrackingController extends Controller
{
    public function store(Request $request)
    {
        try {
            $path = $request->input('path', []);
            if (!is_array($path)) {
                return errorResponse('Le trajet doit être un tableau');
            }
            Session::put('tracking.path', $path);
            Session::put('tracking.updated_at', now());
            return successResponse(['count' => count($path)]);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
