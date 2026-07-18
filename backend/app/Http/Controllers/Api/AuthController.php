<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\UserSessionResource;
use App\Models\User;
use App\Services\Auth\SessionTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly SessionTokenService $sessionTokenService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()
            ->withAuthorizationData()
            ->where('email', $request->string('email')->toString())
            ->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $session = $this->sessionTokenService->issue($user, $request);

        return response()->json([
            'message' => 'Authenticated successfully.',
            'token_type' => 'Bearer',
            'access_token' => $session['access_token'],
            'access_token_expires_at' => optional($session['access_token_expires_at'])->toIso8601String(),
            'user' => UserSessionResource::make($user),
        ])->withCookie($this->sessionTokenService->refreshCookie($session['refresh_token_plain_text']));
    }

    public function refresh(Request $request): JsonResponse
    {
        $refreshTokenValue = $request->cookie(config('auth_tokens.refresh_cookie_name'))
            ?? $request->string('refresh_token')->toString();

        if (! $refreshTokenValue) {
            return response()->json([
                'message' => 'Refresh token is required.',
                'status' => 401,
            ], 401)->withCookie($this->sessionTokenService->forgetRefreshCookie());
        }

        try {
            $session = $this->sessionTokenService->rotateFromPlainText($refreshTokenValue, $request);
        } catch (\Throwable) {
            return response()->json([
                'message' => 'Refresh token is invalid or expired.',
                'status' => 401,
            ], 401)->withCookie($this->sessionTokenService->forgetRefreshCookie());
        }

        $user = $session['user']->loadMissing(['roles.permissions', 'permissions']);

        return response()->json([
            'message' => 'Token rotated successfully.',
            'token_type' => 'Bearer',
            'access_token' => $session['access_token'],
            'access_token_expires_at' => optional($session['access_token_expires_at'])->toIso8601String(),
            'user' => UserSessionResource::make($user),
        ])->withCookie($this->sessionTokenService->refreshCookie($session['refresh_token_plain_text']));
    }

    public function logout(Request $request): JsonResponse
    {
        $refreshTokenValue = $request->cookie(config('auth_tokens.refresh_cookie_name'))
            ?? $request->string('refresh_token')->toString();

        $this->sessionTokenService->revokeCurrentAccessToken($request);
        $this->sessionTokenService->revokeByPlainText($refreshTokenValue ?: null);

        return response()->json([
            'message' => 'Logged out successfully.',
        ])->withCookie($this->sessionTokenService->forgetRefreshCookie());
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()?->loadMissing(['roles.permissions', 'permissions']);

        return response()->json([
            'user' => UserSessionResource::make($user),
        ]);
    }
}