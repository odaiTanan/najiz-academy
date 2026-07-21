<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class AutoSaveAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_id' => ['required', 'integer', 'exists:assessments,id'],
            'attempt_id' => ['nullable', 'integer', 'exists:assessment_attempts,id'],
            'answers' => ['required', 'array'],
            'remaining_time_seconds' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'in:in_progress,paused,submitted'],
        ];
    }
}