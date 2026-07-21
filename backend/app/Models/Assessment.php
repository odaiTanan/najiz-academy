<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assessment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['academy_id', 'department_id', 'code', 'title', 'description', 'duration_minutes', 'passing_score', 'status', 'settings', 'published_at'];

    protected function casts(): array
    {
        return [
            'passing_score' => 'decimal:2',
            'settings' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function academy(): BelongsTo
    {
        return $this->belongsTo(Academy::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function items(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'assessment_questions')
            ->withPivot(['sort_order', 'weight'])
            ->withTimestamps();
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(AssessmentAttempt::class);
    }
}