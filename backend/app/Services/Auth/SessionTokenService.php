<?php

namespace App\Services\Auth;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class SessionTokenService
{
    public const TOKEN_ABILITY = '*';

    public function issue(User $user, Request $request, ?string $sessionId = null): array
    {
        $sessionId ??= (string) Str::uuid();

        $accessTokenResult = $user->createToken(
            config('auth_tokens.access_token_name'),
            [self::TOKEN_ABILITY],
            now()->addMinutes(config('auth_tokens.access_token_ttl_minutes')),
        );

        $refreshPlainText = $this->generateRefreshToken();
        $expiresAt = now()->addDays(config('auth_tokens.refresh_token_ttl_days'));

        $refreshToken = RefreshToken::query()->create([
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'access_token_id' => $accessTokenResult->accessToken->id,
            'token_hash' => hash('sha256', $refreshPlainText),
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'expires_at' => $expiresAt,
            'last_used_at' => now(),
        ]);

        return [
            'user' => $user,
            'access_token' => $accessTokenResult->plainTextToken,
            'access_token_expires_at' => $accessTokenResult->accessToken->expires_at,
            'refresh_token_model' => $refreshToken,
            'refresh_token_plain_text' => $refreshPlainText,
        ];
    }

    public function rotateFromPlainText(string $refreshTokenValue, Request $request): array
    {
        $storedToken = $this->findByPlainText($refreshTokenValue);

        if (! $storedToken || ! $storedToken->isValid()) {
            if ($storedToken?->session_id) {
                $this->revokeSession($storedToken->session_id);
            }

            abort(401, 'Refresh token is invalid or expired.');
        }

        $user = $storedToken->user()->withAuthorizationData()->firstOrFail();

        $this->revokeAccessTokenById($storedToken->access_token_id);

        $this->markRefreshTokenAsRotated($storedToken);

        return $this->issue($user, $request, $storedToken->session_id);
    }

    public function revokeByPlainText(?string $refreshTokenValue): void
    {
        if (! $refreshTokenValue) {
            return;
        }

        $storedToken = $this->findByPlainText($refreshTokenValue);

        if (! $storedToken) {
            return;
        }

        $this->revokeSession($storedToken->session_id);
    }

    public function revokeCurrentAccessToken(Request $request): void
    {
        $request->user()?->currentAccessToken()?->delete();
    }

    private function generateRefreshToken(): string
    {
        return Str::random(64).'.'.Str::random(64);
    }

    private function findByPlainText(string $refreshTokenValue): ?RefreshToken
    {
        return RefreshToken::query()
            ->where('token_hash', hash('sha256', $refreshTokenValue))
            ->first();
    }

    private function markRefreshTokenAsRotated(RefreshToken $refreshToken): void
    {
        $refreshToken->forceFill([
            'revoked_at' => now(),
            'last_used_at' => now(),
        ])->save();
    }

    private function revokeAccessTokenById(?int $accessTokenId): void
    {
        if (! $accessTokenId) {
            return;
        }

        PersonalAccessToken::query()->whereKey($accessTokenId)->delete();
    }

    public function revokeSession(string $sessionId): void
    {
        $tokens = RefreshToken::query()->where('session_id', $sessionId)->get();

        foreach ($tokens as $token) {
            $this->revokeAccessTokenById($token->access_token_id);
        }

        RefreshToken::query()->where('session_id', $sessionId)->delete();
    }

    public function refreshCookie(string $plainTextRefreshToken): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie(
            config('auth_tokens.refresh_cookie_name'),
            $plainTextRefreshToken,
            config('auth_tokens.refresh_token_ttl_days') * 24 * 60,
            config('auth_tokens.refresh_cookie_path'),
            config('session.domain'),
            (bool) config('session.secure'),
            true,
            false,
            'strict',
        );
    }

    public function forgetRefreshCookie(): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie(
            config('auth_tokens.refresh_cookie_name'),
            '',
            -1,
            config('auth_tokens.refresh_cookie_path'),
            config('session.domain'),
            (bool) config('session.secure'),
            true,
            false,
            'strict',
        );
    }
}