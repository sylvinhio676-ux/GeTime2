<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stores\TeacherRequest;
use App\Http\Requests\Updates\TeacherUpdateRequest;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Exception;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $teachers = Teacher::with('user')->get();
            if (!$teachers) throw new Exception("Aucun enseignant trouvé");
            return successResponse($teachers);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TeacherRequest $request)
    {
        try {
            $teacher = Teacher::create($request->validated());
            return successResponse($teacher, "Enseignant créé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher)
    {
        try {
            if (!$teacher) return notFoundResponse("Enseignant non trouvé");
            return successResponse($teacher);
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TeacherUpdateRequest $request, Teacher $teacher)
    {
        try {
            $teacher->update($request->validated());
            return successResponse($teacher, "Enseignant modifié avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        try {
            $teacher->delete();
            return successResponse(null, "Enseignant supprimé avec succès");
        } catch (Exception $e) {
            return errorResponse($e->getMessage());
        }
    }
}
