<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleOrPermission
{
    /**
     * Allow access when at least one required role or permission matches.
     *
     * Usage examples:
     * - role_or_permission:role:admin
     * - role_or_permission:permission:view-dashboard
     * - role_or_permission:role:admin,permission:manage-users
     */
    public function handle(Request $request, Closure $next, string ...$requirements): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
                'status' => 401,
            ], 401);
        }

        $requirements = array_values(array_filter(array_map('trim', $requirements)));

        if ($requirements === []) {
            return $next($request);
        }

        foreach ($requirements as $requirement) {
            [$type, $names] = str_contains($requirement, ':')
                ? explode(':', $requirement, 2)
                : ['permission', $requirement];

            $candidates = array_values(array_filter(array_map('trim', explode('|', $names))));

            if ($candidates === []) {
                continue;
            }

            if ($type === 'role' && $user->hasAnyRole($candidates)) {
                return $next($request);
            }

            if ($type === 'permission' && $user->hasAnyPermission($candidates)) {
                return $next($request);
            }

            if ($type === 'role-or-permission' && (
                $user->hasAnyRole($candidates) || $user->hasAnyPermission($candidates)
            )) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Forbidden.',
            'status' => 403,
        ], 403);
    }
}