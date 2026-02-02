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
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\ProgrammerController;
use App\Http\Controllers\ProgrammationController;
use App\Http\Controllers\DisponibilityController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\SpecialtyProgrammationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProgrammerSpecialtyController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DeviceTokenController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\QuotaController;
use App\Http\Controllers\TeacherRoomController;
use App\Http\Controllers\AutomationReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::get('/login', function(){
	return redirect("http://localhost:5173/login");
});
Route::post('/emails/webhook/mailtrap', [EmailController::class, 'receiveMailtrap']);

Route::middleware(['auth:sanctum', 'audit.log'])->group(function () {
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
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/archived', [NotificationController::class, 'archived']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/{id}/archive', [NotificationController::class, 'archive']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/notifications/stats', [NotificationController::class, 'stats']);
    Route::get('/notifications/templates', [NotificationController::class, 'templates']);
    Route::post('/notifications/schedule', [NotificationController::class, 'schedule']);
    Route::post('/notifications/push', [NotificationController::class, 'push']);
    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|programmer,sanctum');

    // API Resource Routes
    Route::apiResource('campuses', CampusController::class)
        ->middleware('role_or_permission:super_admin|admin|teacher|programmer,sanctum');
    Route::get('teacher/campuses', [CampusController::class, 'teacherCampuses'])
        ->middleware('role_or_permission:teacher|programmer|super_admin|admin,sanctum');
    Route::apiResource('schools', SchoolController::class)
        ->middleware('role_or_permission:super_admin|admin|programmer,sanctum');
    Route::get('etablishments', [EtablishmentController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|teacher,sanctum');
    Route::get('etablishments/{etablishment}', [EtablishmentController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::post('etablishments', [EtablishmentController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('etablishments/{etablishment}', [EtablishmentController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('etablishments/{etablishment}', [EtablishmentController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('locations', [LocationController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::post('locations', [LocationController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('locations/{location}', [LocationController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('locations/{location}', [LocationController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('programmers', [ProgrammerController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|programmer,sanctum');
    Route::get('teacher/programmers', [ProgrammerController::class, 'teacherIndex'])
        ->middleware('role_or_permission:teacher|programmer|super_admin|admin,sanctum');
    Route::get('programmers/{programmer}', [ProgrammerController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|programmer,sanctum');
    Route::patch('programmers/{user}/specialties', [ProgrammerSpecialtyController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::post('programmers', [ProgrammerController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('programmers/{programmer}', [ProgrammerController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::delete('programmers/{programmer}', [ProgrammerController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::apiResource('specialty-programmations', SpecialtyProgrammationController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::apiResource('users', UserController::class)
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('emails', [EmailController::class, 'index']);
    Route::get('emails/sync', [EmailController::class, 'syncGmail']);
    Route::post('emails', [EmailController::class, 'send']);
    Route::patch('emails/{email}/read', [EmailController::class, 'markRead']);

    // Sectors
    Route::get('sectors', [SectorController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|teacher|view-sector,sanctum');
    Route::get('teacher/sectors', [SectorController::class, 'teacherIndex'])
        ->middleware('role_or_permission:teacher|programmer|super_admin|admin,sanctum');
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
        ->middleware('role_or_permission:super_admin|admin|programmer|view-specialty,sanctum');
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
        ->middleware('role_or_permission:super_admin|admin|view-subject|teacher|programmer,sanctum');
    Route::get('subjects/quota-status', [QuotaController::class, 'getSubjectsByStatus'])
        ->middleware('role_or_permission:super_admin|admin|view-subject,sanctum');
    Route::get('subjects/{subject}/quota', [QuotaController::class, 'getSubjectStats'])
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
        ->middleware('role_or_permission:super_admin|admin|view-teacher|teacher,sanctum');
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
        ->middleware('role_or_permission:super_admin|admin|teacher|view-level,sanctum');
    Route::get('teacher/levels', [LevelController::class, 'teacherIndex'])
        ->middleware('role_or_permission:teacher|programmer|super_admin|admin,sanctum');
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
        ->middleware('role_or_permission:super_admin|admin|teacher|view-programmation,sanctum');
    Route::get('programmations/{programmation}', [ProgrammationController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-programmation,sanctum');
    Route::post('programmations', [ProgrammationController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin|create-programmation,sanctum');
    Route::post('programmations/suggest', [ProgrammationController::class, 'suggest'])
        ->middleware('role_or_permission:super_admin|admin|view-programmation,sanctum');
    Route::post('programmations/publish', [ProgrammationController::class, 'publishValidated'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::put('programmations/{programmation}', [ProgrammationController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin|edit-programmation,sanctum');
    Route::delete('programmations/{programmation}', [ProgrammationController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin|delete-programmation,sanctum');
    Route::post('programmations/{programmation}/validate', [ProgrammationController::class, 'validateProgrammation'])
        ->middleware('role_or_permission:super_admin|admin|edit-programmation,sanctum');

    // Disponibilities
    Route::get('disponibilities', [DisponibilityController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin|view-disponibility|teacher,sanctum');
    Route::get('disponibilities/{disponibility}', [DisponibilityController::class, 'show'])
        ->middleware('role_or_permission:super_admin|admin|view-disponibility,sanctum');
    Route::post('disponibilities', [DisponibilityController::class, 'store'])
        ->middleware('role_or_permission:super_admin|admin|create-disponibility,sanctum');
    Route::put('disponibilities/{disponibility}', [DisponibilityController::class, 'update'])
        ->middleware('role_or_permission:super_admin|admin|edit-disponibility,sanctum');
    Route::delete('disponibilities/{disponibility}', [DisponibilityController::class, 'destroy'])
        ->middleware('role_or_permission:super_admin|admin|delete-disponibility,sanctum');
    Route::post('disponibilities/{disponibility}/convert', [DisponibilityController::class, 'convert'])
        ->middleware('role_or_permission:super_admin|admin|create-programmation,sanctum');
    Route::post('admin/disponibilities/{disponibility}/convert', [DisponibilityController::class, 'convertAsAdmin'])
        ->middleware('role_or_permission:super_admin|admin|create-programmation,sanctum');
    Route::post('disponibilities/group', [DisponibilityController::class, 'group'])
        ->middleware('role_or_permission:super_admin|admin|edit-disponibility,sanctum');
    Route::post('disponibilities/ungroup', [DisponibilityController::class, 'ungroup'])
        ->middleware('role_or_permission:super_admin|admin|edit-disponibility,sanctum');
    Route::post('disponibilities/convert-multiple', [DisponibilityController::class, 'convertMultiple'])
        ->middleware('role_or_permission:super_admin|admin|create-programmation,sanctum');

    // ======device token
    Route::apiResource('/device-token', DeviceTokenController::class);

    // tracking
    Route::post('tracking/path', [TrackingController::class, 'store']);
    Route::get('automation/report/latest', [AutomationReportController::class, 'latest'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('automation/report/runs', [AutomationReportController::class, 'index'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('automation/report/stats', [AutomationReportController::class, 'stats'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('analytics/usage', [AnalyticsController::class, 'usageMetrics'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('analytics/routes', [AnalyticsController::class, 'topCampuses'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');
    Route::get('analytics/recent-sessions', [AnalyticsController::class, 'recentSessions'])
        ->middleware('role_or_permission:super_admin|admin,sanctum');

    // Quota
    Route::get('/quota/stats', [QuotaController::class, 'getStats'])
        ->middleware('role_or_permission:super_admin|admin|programmer,sanctum');

    Route::get('/teacher/rooms', [TeacherRoomController::class, 'index'])
        ->middleware('auth:sanctum');

    //=======Event
    Route::post('/programmations/publish-week', [ProgrammationController::class, 'publishWeek']);

});
