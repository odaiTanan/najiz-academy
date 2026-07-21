<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssessmentAttempt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['assessment_id', 'user_id', 'status', 'started_at', 'submitted_at', 'remaining_time_seconds', 'answers', 'autosave_snapshot', 'total_score', 'result_summary', 'training_plan_id'];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'answers' => 'array',
            'autosave_snapshot' => 'array',
            'total_score' => 'decimal:2',
            'result_summary' => 'array',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trainingPlan(): BelongsTo
    {
        return $this->belongsTo(TrainingPlan::class);
    }
}