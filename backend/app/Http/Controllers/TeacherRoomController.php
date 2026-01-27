<?php

namespace App\Http\Controllers;

use App\Models\Programmation;
use Illuminate\Http\Request;

class TeacherRoomController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user()?->teacher;
        if (!$teacher) {
            return errorResponse('Profil enseignant introuvable.');
        }

        $rooms = Programmation::query()
            ->whereHas('subject', fn ($query) => $query->where('teacher_id', $teacher->id))
            ->whereNotNull('room_id')
            ->where('status', '!=', 'draft')
            ->with(['room.campus'])
            ->get()
            ->pluck('room')
            ->filter()
            ->unique('id')
            ->values();

        return successResponse(['rooms' => $rooms]);
    }
}
