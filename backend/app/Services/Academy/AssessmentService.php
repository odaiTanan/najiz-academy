<?php

namespace App\Services\Academy;

use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\TrainingPlan;
use App\Models\TrainingPlanItem;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AssessmentService
{
    public function scoreAttempt(AssessmentAttempt $attempt): AssessmentAttempt
    {
        return DB::transaction(function () use ($attempt): AssessmentAttempt {
            $attempt->loadMissing(['assessment.items.competency', 'assessment.items.options', 'user']);

            $questions = $attempt->assessment->items;
            $answers = $attempt->answers ?? [];

            $questionResults = [];
            $competencyStats = [];
            $overallWeightedScore = 0.0;
            $totalWeight = (float) $questions->sum(fn ($question): float => (float) ($question->pivot->weight ?? 1));
            $totalWeight = $totalWeight > 0 ? $totalWeight : 1.0;

            foreach ($questions as $question) {
                $answerPayload = Arr::get($answers, (string) $question->id, []);
                $earned = $this->scoreQuestion($question, $answerPayload);
                $max = (float) ($question->max_score ?: 1);

                $competencyId = $question->competency_id;
                $competencyStats[$competencyId]['earned'] = ($competencyStats[$competencyId]['earned'] ?? 0) + $earned;
                $competencyStats[$competencyId]['max'] = ($competencyStats[$competencyId]['max'] ?? 0) + $max;
                $competencyStats[$competencyId]['weight'] = (float) ($question->pivot->weight ?? 1);
                $competencyStats[$competencyId]['competency'] = $question->competency;

                $questionResults[] = [
                    'question_id' => $question->id,
                    'competency_id' => $competencyId,
                    'earned_score' => $earned,
                    'max_score' => $max,
                    'is_correct' => $earned >= $max,
                    'answer' => $answerPayload,
                ];
            }

            $failingCompetencies = [];
            $competencySummaries = [];

            foreach ($competencyStats as $competencyId => $stats) {
                $competencyScore = $stats['max'] > 0 ? round(($stats['earned'] / $stats['max']) * 100, 2) : 0.0;
                $weightShare = $stats['weight'] / $totalWeight;
                $weightedScore = round($competencyScore * $weightShare, 2);
                $overallWeightedScore += $weightedScore;

                $competency = $stats['competency'];
                $threshold = (float) $competency->success_threshold;

                $competencySummaries[] = [
                    'competency_id' => $competencyId,
                    'competency_code' => $competency->code,
                    'competency_name' => $competency->name,
                    'earned_score' => round($stats['earned'], 2),
                    'max_score' => round($stats['max'], 2),
                    'competency_score' => $competencyScore,
                    'weighted_score' => $weightedScore,
                    'threshold' => $threshold,
                    'is_passing' => $competencyScore >= $threshold,
                ];

                if ($competencyScore < $threshold) {
                    $failingCompetencies[] = $competency;
                }
            }

            $overallScore = round($overallWeightedScore, 2);
            $hasFailedCompetencies = $failingCompetencies !== [];
            $status = $overallScore >= (float) $attempt->assessment->passing_score && ! $hasFailedCompetencies
                ? 'scored'
                : 'scored';

            $trainingPlan = $hasFailedCompetencies
                ? $this->createTrainingPlan($attempt, $failingCompetencies)
                : null;

            $attempt->forceFill([
                'status' => $status,
                'submitted_at' => now(),
                'total_score' => $overallScore,
                'result_summary' => [
                    'overall_score' => $overallScore,
                    'passing_score' => (float) $attempt->assessment->passing_score,
                    'competencies' => $competencySummaries,
                    'questions' => $questionResults,
                    'has_failed_competencies' => $hasFailedCompetencies,
                    'training_plan_id' => $trainingPlan?->id,
                ],
                'training_plan_id' => $trainingPlan?->id,
            ])->save();

            $this->logAttemptScored($attempt);

            return $attempt->refresh()->loadMissing(['assessment.items.competency', 'user', 'trainingPlan.items']);
        });
    }

    public function autoSaveAttempt(AssessmentAttempt $attempt, array $answers, int $remainingTimeSeconds, ?string $status = null): AssessmentAttempt
    {
        $attempt->forceFill([
            'answers' => $answers,
            'remaining_time_seconds' => max(0, $remainingTimeSeconds),
            'status' => $status ?: $attempt->status,
            'autosave_snapshot' => [
                'saved_at' => now()->toIso8601String(),
                'answer_count' => count($answers),
                'remaining_time_seconds' => max(0, $remainingTimeSeconds),
            ],
        ])->save();

        $this->logAutoSave($attempt);

        return $attempt->refresh();
    }

    private function scoreQuestion($question, array $answerPayload): float
    {
        $type = $question->question_type;
        $maxScore = (float) ($question->max_score ?: 1);

        if ($type === 'multiple_choice') {
            $selectedOptionIds = Arr::wrap(Arr::get($answerPayload, 'selected_option_ids', Arr::get($answerPayload, 'option_id', [])));
            $correctOptionIds = $question->options->where('is_correct', true)->pluck('id')->values()->all();

            sort($selectedOptionIds);
            sort($correctOptionIds);

            return $selectedOptionIds === $correctOptionIds ? $maxScore : 0.0;
        }

        if ($type === 'scenario_based') {
            $manualScore = (float) Arr::get($answerPayload, 'score', 0);
            return min($maxScore, max(0.0, $manualScore));
        }

        if ($type === 'simulation') {
            $rubricScore = (float) Arr::get($answerPayload, 'score', Arr::get($question->metadata, 'score', 0));
            return min($maxScore, max(0.0, $rubricScore));
        }

        return 0.0;
    }

    private function createTrainingPlan(AssessmentAttempt $attempt, array $failingCompetencies): TrainingPlan
    {
        $trainingPlan = TrainingPlan::query()->create([
            'user_id' => $attempt->user_id,
            'assessment_attempt_id' => $attempt->id,
            'status' => 'generated',
            'generated_at' => now(),
            'metadata' => [
                'assessment_id' => $attempt->assessment_id,
                'trigger' => 'assessment_scoring_engine',
            ],
        ]);

        foreach ($failingCompetencies as $competency) {
            $course = $competency->courses()->orderBy('competency_course.priority')->first();

            TrainingPlanItem::query()->create([
                'training_plan_id' => $trainingPlan->id,
                'competency_id' => $competency->id,
                'course_id' => $course?->id,
                'status' => 'pending',
                'priority' => $course ? 1 : 0,
                'notes' => $course ? null : 'No mapped course found for this competency.',
            ]);
        }

        return $trainingPlan;
    }

    private function logAttemptScored(AssessmentAttempt $attempt): void
    {
        AuditLog::query()->create([
            'user_id' => $attempt->user_id,
            'auditable_type' => AssessmentAttempt::class,
            'auditable_id' => $attempt->id,
            'action' => 'assessment.scored',
            'event' => 'scored',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'new_values' => [
                'total_score' => $attempt->total_score,
                'training_plan_id' => $attempt->training_plan_id,
            ],
        ]);
    }

    private function logAutoSave(AssessmentAttempt $attempt): void
    {
        AuditLog::query()->create([
            'user_id' => $attempt->user_id,
            'auditable_type' => AssessmentAttempt::class,
            'auditable_id' => $attempt->id,
            'action' => 'assessment.autosave',
            'event' => 'autosave',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'new_values' => [
                'remaining_time_seconds' => $attempt->remaining_time_seconds,
            ],
        ]);
    }
}