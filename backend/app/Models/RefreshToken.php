<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\PersonalAccessToken;

class RefreshToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'access_token_id',
        'token_hash',
        'user_agent',
        'ip_address',
        'expires_at',
        'last_used_at',
        'revoked_at',
        'replaced_by_token_id',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'last_used_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accessToken(): BelongsTo
    {
        return $this->belongsTo(PersonalAccessToken::class, 'access_token_id');
    }

    public function isValid(): bool
    {
        return $this->revoked_at === null && $this->expires_at?->isFuture() === true;
    }
}