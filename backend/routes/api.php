<?php

use App\Http\Controllers\Api\ManagementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssessmentController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('auth:sanctum')->get('me', [AuthController::class, 'me']);
});
 Route::get('courses', 'courses');
Route::middleware(['auth:sanctum', 'role_or_permission:role:System Administrator|HR Manager|Trainer|Candidate|Employee,permission:view-dashboard'])->get('dashboard', function () {
    return response()->json([
        'message' => 'تم تحميل بيانات لوحة التحكم بنجاح.',
    ]);
});

Route::middleware(['auth:sanctum'])->prefix('dashboard')->controller(ManagementController::class)->group(function (): void {
    Route::middleware('role_or_permission:role:System Administrator|HR Manager|Trainer')->get('lookups', 'lookups');

    Route::middleware('role_or_permission:role:System Administrator|HR Manager')->group(function (): void {
        Route::get('academies', 'academies');
        Route::post('academies', 'storeAcademy');
        Route::put('academies/{academy}', 'updateAcademy');
        Route::delete('academies/{academy}', 'destroyAcademy');

        Route::get('departments', 'departments');
        Route::post('departments', 'storeDepartment');
        Route::put('departments/{department}', 'updateDepartment');
        Route::delete('departments/{department}', 'destroyDepartment');

        Route::post('competencies', 'storeCompetency');
        Route::put('competencies/{competency}', 'updateCompetency');
        Route::delete('competencies/{competency}', 'destroyCompetency');

        Route::get('questions', 'questions');
        Route::get('questions/{question}', 'showQuestion');
        Route::post('questions', 'storeQuestion');
        Route::put('questions/{question}', 'updateQuestion');
        Route::delete('questions/{question}', 'destroyQuestion');

        Route::get('assessments/{assessment}', 'showAssessment');
        Route::post('assessments', 'storeAssessment');
        Route::put('assessments/{assessment}', 'updateAssessment');
        Route::delete('assessments/{assessment}', 'destroyAssessment');
    });

    Route::middleware('role_or_permission:role:System Administrator|HR Manager|Trainer')->group(function (): void {
        Route::get('competencies', 'competencies');
        Route::get('training-plans', 'trainingPlans');
        Route::get('courses', 'courses');
        Route::post('courses', 'storeCourse');
        Route::put('courses/{course}', 'updateCourse');
        Route::delete('courses/{course}', 'destroyCourse');
    });

    Route::middleware('role_or_permission:role:System Administrator|HR Manager|Trainer|Employee|Candidate')->get('assessments', 'assessments');

    Route::middleware('role_or_permission:role:System Administrator|HR Manager|Trainer|Candidate|Employee')->get('certificates', 'certificates');

    Route::middleware('role_or_permission:role:System Administrator')->get('audit-logs', 'auditLogs');
});

Route::middleware('auth:sanctum')->prefix('assessments')->group(function (): void {
    Route::get('{assessment}', [AssessmentController::class, 'show']);
    Route::post('auto-save', [AssessmentController::class, 'autoSave']);
    Route::post('{attempt}/submit', [AssessmentController::class, 'submit']);
    
    Route::middleware('role_or_permission:role:System Administrator|HR Manager|Trainer')->group(function (): void {
        Route::get('{assessment}/attempts', [AssessmentController::class, 'getAttempts']);
        Route::get('attempts/{attempt}', [AssessmentController::class, 'getAttemptDetails']);
    });
});
