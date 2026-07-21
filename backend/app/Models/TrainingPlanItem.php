<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingPlanItem extends Model
{
    use HasFactory;

    protected $fillable = ['training_plan_id', 'competency_id', 'course_id', 'status', 'priority', 'due_at', 'notes'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime'];
    }

    public function trainingPlan(): BelongsTo
    {
        return $this->belongsTo(TrainingPlan::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}