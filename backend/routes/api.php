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
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // API Resource Routes
    Route::apiResource('campuses', CampusController::class);
    Route::apiResource('schools', SchoolController::class);
    Route::apiResource('etablishments', EtablishmentController::class);
    Route::apiResource('sectors', SectorController::class);
    Route::apiResource('specialties', SpecialtyController::class);
    Route::apiResource('subjects', SubjectController::class);
    Route::apiResource('teachers', TeacherController::class);
    Route::apiResource('rooms', RoomController::class);
    Route::apiResource('levels', LevelController::class);
    Route::apiResource('years', YearController::class);
    Route::apiResource('programmers', ProgrammerController::class);
    Route::apiResource('programmations', ProgrammationController::class);
    Route::apiResource('disponibilities', DisponibilityController::class);
    Route::apiResource('specialty-programmations', SpecialtyProgrammationController::class);
    Route::apiResource('users', UserController::class);
});


