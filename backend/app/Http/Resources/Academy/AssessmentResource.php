<?php

namespace App\Http\Resources\Academy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'passing_score' => $this->passing_score,
            'status' => $this->status,
            'settings' => $this->settings,
            'questions' => $this->whenLoaded('items', fn () => $this->items->map(fn ($question): array => [
                'id' => $question->id,
                'code' => $question->code,
                'question_type' => $question->question_type,
                'prompt' => $question->prompt,
                'max_score' => $question->max_score,
                'time_limit_seconds' => $question->time_limit_seconds,
                'metadata' => $question->metadata,
                'options' => $question->options->map(fn ($option): array => [
                    'id' => $option->id,
                    'code' => $option->code,
                    'label' => $option->label,
                    'value' => $option->value,
                    'is_correct' => $option->is_correct,
                    'score_value' => $option->score_value,
                ])->values()->all(),
            ])->values()->all()),
        ];
    }
}