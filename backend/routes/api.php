<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CampusController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\EtablishmentController;
use App\Http\Controllers\SectorController;
use App\Http\Controllers\SpecialtyController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\YearController;
use App\Http\Controllers\ProgrammerController;
use App\Http\Controllers\ProgrammationController;
use App\Http\Controllers\DisponibilityController;
use App\Http\Controllers\SpecialtyProgrammationController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

 Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', function(){
	return redirect("http://localhost:5173/login");
});

Route::middleware(['auth:sanctum'])->group(function () {
	Route::get('/user', function (Request $request) {
        $user = $request->user();
        return [
            'id' => $user?->id,
            'name' => $user?->name,
            'email' => $user?->email,
            'roles' => $user?->getRoleNames() ?? [],
            'permissions' => $user?->getAllPermissions()?->pluck('name') ?? [],
        ];
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // API Resource Routes
    Route::apiResource('campuses', CampusController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::apiResource('schools', SchoolController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::apiResource('etablishments', EtablishmentController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::apiResource('programmers', ProgrammerController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::apiResource('specialty-programmations', SpecialtyProgrammationController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::apiResource('users', UserController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Sectors
    Route::get('sectors', [SectorController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-sector,sanctum');
    Route::get('sectors/{sector}', [SectorController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-sector,sanctum');
    Route::post('sectors', [SectorController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('sectors/{sector}', [SectorController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('sectors/{sector}', [SectorController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Specialties
    Route::get('specialties', [SpecialtyController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-specialty,sanctum');
    Route::get('specialties/{specialty}', [SpecialtyController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-specialty,sanctum');
    Route::post('specialties', [SpecialtyController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('specialties/{specialty}', [SpecialtyController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('specialties/{specialty}', [SpecialtyController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Subjects
    Route::get('subjects', [SubjectController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-subject,sanctum');
    Route::get('subjects/{subject}', [SubjectController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-subject,sanctum');
    Route::post('subjects', [SubjectController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('subjects/{subject}', [SubjectController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('subjects/{subject}', [SubjectController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Teachers
    Route::get('teachers', [TeacherController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-teacher,sanctum');
    Route::get('teachers/{teacher}', [TeacherController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-teacher,sanctum');
    Route::post('teachers', [TeacherController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('teachers/{teacher}', [TeacherController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Rooms
    Route::get('rooms', [RoomController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-room,sanctum');
    Route::get('rooms/{room}', [RoomController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-room,sanctum');
    Route::post('rooms', [RoomController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('rooms/{room}', [RoomController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('rooms/{room}', [RoomController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Levels
    Route::get('levels', [LevelController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-level,sanctum');
    Route::get('levels/{level}', [LevelController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-level,sanctum');
    Route::post('levels', [LevelController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('levels/{level}', [LevelController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('levels/{level}', [LevelController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Years
    Route::get('years', [YearController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-year,sanctum');
    Route::get('years/{year}', [YearController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-year,sanctum');
    Route::post('years', [YearController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('years/{year}', [YearController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('years/{year}', [YearController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Programmations
    Route::get('programmations', [ProgrammationController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-programmation,sanctum');
    Route::get('programmations/{programmation}', [ProgrammationController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-programmation,sanctum');
    Route::post('programmations', [ProgrammationController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin|create-programmation,sanctum');
    Route::put('programmations/{programmation}', [ProgrammationController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin|edit-programmation,sanctum');
    Route::delete('programmations/{programmation}', [ProgrammationController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin|delete-programmation,sanctum');

    // Disponibilities
    Route::get('disponibilities', [DisponibilityController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-disponibility,sanctum');
    Route::get('disponibilities/{disponibility}', [DisponibilityController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-disponibility,sanctum');
    Route::post('disponibilities', [DisponibilityController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin|create-disponibility,sanctum');
    Route::put('disponibilities/{disponibility}', [DisponibilityController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin|edit-disponibility,sanctum');
    Route::delete('disponibilities/{disponibility}', [DisponibilityController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin|delete-disponibility,sanctum');
});
