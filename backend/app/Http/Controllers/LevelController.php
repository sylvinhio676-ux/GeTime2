<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\LevelRequest;
use App\Http\Requests\Updates\LevelUpdateRequest;
use App\Models\Level;
use Illuminate\Http\Request;
use Exception;

class LevelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $levels = Level::all();
            if (!$levels) throw new Exception("Aucun niveau trouvé");
            return successResponse($levels);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(LevelRequest $request)
    {
        try {
            $level = Level::create($request->validated());
            return successResponse($level, "Niveau créé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Level $level)
    {
        try {
            if (!$level) return notFoundResponse("Niveau non trouvé");
            return successResponse($level);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(LevelUpdateRequest $request, Level $level)
    {
        try {
            $level->update($request->validated());
            return successResponse($level, "Niveau modifié avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Level $level)
    {
        try {
            $level->delete();
            return successResponse(null, "Niveau supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
