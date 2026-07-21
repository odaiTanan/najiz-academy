<?php

namespace App\Http\Resources\Academy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assessment_id' => $this->assessment_id,
            'status' => $this->status,
            'started_at' => optional($this->started_at)->toIso8601String(),
            'submitted_at' => optional($this->submitted_at)->toIso8601String(),
            'remaining_time_seconds' => $this->remaining_time_seconds,
            'answers' => $this->answers,
            'autosave_snapshot' => $this->autosave_snapshot,
            'total_score' => $this->total_score,
            'result_summary' => $this->result_summary,
            'training_plan_id' => $this->training_plan_id,
            'user' => [
                'id' => $this->user->id ?? null,
                'name' => $this->user->name ?? null,
                'email' => $this->user->email ?? null,
            ],
            'assessment' => [
                'id' => $this->assessment->id ?? null,
                'title' => $this->assessment->title ?? null,
                'code' => $this->assessment->code ?? null,
            ],
        ];
    }
}