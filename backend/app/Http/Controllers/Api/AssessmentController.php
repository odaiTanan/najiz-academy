<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\AutoSaveAssessmentRequest;
use App\Http\Resources\Academy\AssessmentAttemptResource;
use App\Http\Resources\Academy\AssessmentResource;
use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Services\Academy\AssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function __construct(private readonly AssessmentService $assessmentService)
    {
    }

    public function show(Assessment $assessment): AssessmentResource
    {
        $assessment->loadMissing(['items.options', 'items.competency']);

        return AssessmentResource::make($assessment);
    }

    public function autoSave(AutoSaveAssessmentRequest $request): JsonResponse
    {
        $attempt = AssessmentAttempt::query()->firstOrCreate(
            [
                'assessment_id' => $request->integer('assessment_id'),
                'user_id' => $request->user()->id,
                'status' => 'in_progress',
            ],
            [
                'started_at' => now(),
                'remaining_time_seconds' => $request->integer('remaining_time_seconds'),
                'answers' => $request->array('answers'),
                'autosave_snapshot' => [
                    'saved_at' => now()->toIso8601String(),
                ],
            ]
        );

        $attempt = $this->assessmentService->autoSaveAttempt(
            $attempt,
            $request->array('answers'),
            $request->integer('remaining_time_seconds'),
            $request->string('status')->toString() ?: null,
        );

        return response()->json([
            'message' => 'Assessment state saved successfully.',
            'attempt' => AssessmentAttemptResource::make($attempt),
        ]);
    }

    public function submit(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        abort_unless($attempt->user_id === $request->user()->id, 403, 'Forbidden.');

        $attempt = $this->assessmentService->scoreAttempt($attempt);

        return response()->json([
            'message' => 'Assessment submitted successfully.',
            'attempt' => AssessmentAttemptResource::make($attempt),
        ]);
    }

    public function getAttempts(Request $request, Assessment $assessment): JsonResponse
    {
        $user = $request->user();
        
        // Check if user has permission to view attempts
        $canView = $user->roles->pluck('name')->intersect(['System Administrator', 'HR Manager', 'Trainer'])->isNotEmpty() ||
                   $assessment->academy_id && $user->academy_id === $assessment->academy_id ||
                   $assessment->department_id && $user->department_id === $assessment->department_id;

        abort_unless($canView, 403, 'Forbidden.');

        $attempts = AssessmentAttempt::query()
            ->where('assessment_id', $assessment->id)
            ->where('status', 'scored')
            ->with(['user', 'assessment.items.competency'])
            ->orderBy('submitted_at', 'desc')
            ->get();

        return response()->json([
            'data' => AssessmentAttemptResource::collection($attempts),
        ]);
    }

    public function getAttemptDetails(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $user = $request->user();
        $assessment = $attempt->assessment;

        // Check if user has permission to view attempt details
        $canView = $attempt->user_id === $user->id ||
                   $user->roles->pluck('name')->intersect(['System Administrator', 'HR Manager', 'Trainer'])->isNotEmpty() ||
                   $assessment->academy_id && $user->academy_id === $assessment->academy_id ||
                   $assessment->department_id && $user->department_id === $assessment->department_id;

        abort_unless($canView, 403, 'Forbidden.');

        $attempt->loadMissing(['assessment.items.competency', 'assessment.items.options', 'user']);

        return response()->json([
            'data' => AssessmentAttemptResource::make($attempt),
        ]);
    }
}