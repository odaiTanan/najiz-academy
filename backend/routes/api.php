<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('auth:sanctum')->get('me', [AuthController::class, 'me']);
});

Route::middleware(['auth:sanctum', 'role_or_permission:role:admin,permission:view-dashboard'])->get('dashboard', function () {
    return response()->json([
        'message' => 'Dashboard data loaded successfully.',
    ]);
});