<?php

use App\Http\Middleware\RoleOrPermission;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role_or_permission' => RoleOrPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $exception, Request $request): JsonResponse {
            if (! $request->expectsJson()) {
                return response()->json(['message' => $exception->getMessage() ?: 'Unauthenticated.'], 401);
            }

            return response()->json([
                'message' => $exception->getMessage() ?: 'Unauthenticated.',
                'status' => 401,
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request): JsonResponse {
            if (! $request->expectsJson()) {
                return response()->json(['message' => $exception->getMessage() ?: 'Forbidden.'], 403);
            }

            return response()->json([
                'message' => $exception->getMessage() ?: 'Forbidden.',
                'status' => 403,
            ], 403);
        });
    })->create();
