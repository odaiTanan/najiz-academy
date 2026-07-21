<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Academy;
use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Competency;
use App\Models\Course;
use App\Models\Department;
use App\Models\QuestionBank;
use App\Models\TrainingPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ManagementController extends Controller
{
    public function academies(): JsonResponse
    {
        return response()->json(
            Academy::query()
                ->select(['id', 'code', 'name', 'description', 'status', 'updated_at'])
                ->withCount(['departments', 'courses'])
                ->orderBy('name')
                ->paginate(10)
        );
    }

    public function storeAcademy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:academies,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $academy = Academy::query()->create([
            ...$data,
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json($academy, 201);
    }

    public function updateAcademy(Request $request, Academy $academy): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:255', Rule::unique('academies', 'code')->ignore($academy->id)],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $academy->update($data);

        return response()->json($academy->fresh());
    }

    public function destroyAcademy(Academy $academy): JsonResponse
    {
        $academy->delete();

        return response()->json(['message' => 'تم الحذف بنجاح.']);
    }

    public function departments(): JsonResponse
    {
        return response()->json(
            Department::query()
                ->select(['id', 'academy_id', 'code', 'name', 'description', 'sort_order', 'is_active', 'updated_at'])
                ->with(['academy:id,name'])
                ->withCount('competencies')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->paginate(10)
        );
    }

    public function storeDepartment(Request $request): JsonResponse
    {
        $data = $request->validate([
            'academy_id' => ['required', 'exists:academies,id'],
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $department = Department::query()->create([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json($department->load('academy:id,name'), 201);
    }

    public function updateDepartment(Request $request, Department $department): JsonResponse
    {
        $data = $request->validate([
            'academy_id' => ['sometimes', 'exists:academies,id'],
            'code' => ['sometimes', 'string', 'max:255'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $department->update($data);

        return response()->json($department->fresh()->load('academy:id,name'));
    }

    public function destroyDepartment(Department $department): JsonResponse
    {
        $department->delete();

        return response()->json(['message' => 'تم الحذف بنجاح.']);
    }

    public function competencies(): JsonResponse
    {
        return response()->json(
            Competency::query()
                ->select(['id', 'department_id', 'code', 'name', 'description', 'weight', 'success_threshold', 'sort_order', 'is_active', 'updated_at'])
                ->with(['department:id,name'])
                ->withCount(['questions', 'courses'])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->paginate(10)
        );
    }

    public function storeCompetency(Request $request): JsonResponse
    {
        $data = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'success_threshold' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $competency = Competency::query()->create([
            ...$data,
            'weight' => $data['weight'] ?? 1,
            'success_threshold' => $data['success_threshold'] ?? 70,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json($competency->load('department:id,name'), 201);
    }

    public function updateCompetency(Request $request, Competency $competency): JsonResponse
    {
        $data = $request->validate([
            'department_id' => ['sometimes', 'exists:departments,id'],
            'code' => ['sometimes', 'string', 'max:255'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'success_threshold' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $competency->update($data);

        return response()->json($competency->fresh()->load('department:id,name'));
    }

    public function destroyCompetency(Competency $competency): JsonResponse
    {
        $competency->delete();

        return response()->json(['message' => 'تم الحذف بنجاح.']);
    }

    public function questions(): JsonResponse
    {
        return response()->json(
            QuestionBank::query()
                ->select(['id', 'department_id', 'competency_id', 'code', 'question_type', 'prompt', 'max_score', 'time_limit_seconds', 'sort_order', 'is_active', 'updated_at'])
                ->with(['department:id,name', 'competency:id,name', 'options'])
                ->withCount('options')
                ->orderBy('sort_order')
                ->orderBy('code')
                ->paginate(10)
        );
    }

    public function showQuestion(QuestionBank $question): JsonResponse
    {
        return response()->json(
            $question->load(['department:id,name', 'competency:id,name', 'options'])
        );
    }

    public function storeQuestion(Request $request): JsonResponse
    {
        $data = $this->validateQuestion($request);

        $question = DB::transaction(function () use ($data) {
            $options = $data['options'] ?? [];
            unset($data['options']);

            $question = QuestionBank::query()->create([
                ...$data,
                'max_score' => $data['max_score'] ?? 1,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_active' => $data['is_active'] ?? true,
            ]);

            $this->syncQuestionOptions($question, $options);

            return $question->load(['department:id,name', 'competency:id,name', 'options']);
        });

        return response()->json($question, 201);
    }

    public function updateQuestion(Request $request, QuestionBank $question): JsonResponse
    {
        $data = $this->validateQuestion($request, $question);

        $question = DB::transaction(function () use ($data, $question) {
            $options = $data['options'] ?? null;
            unset($data['options']);

            $question->update($data);

            if (is_array($options)) {
                $question->options()->delete();
                $this->syncQuestionOptions($question, $options);
            }

            return $question->fresh()->load(['department:id,name', 'competency:id,name', 'options']);
        });

        return response()->json($question);
    }

    public function destroyQuestion(QuestionBank $question): JsonResponse
    {
        $question->delete();

        return response()->json(['message' => 'تم الحذف بنجاح.']);
    }

    public function assessments(): JsonResponse
    {
        return response()->json(
            Assessment::query()
                ->select(['id', 'academy_id', 'department_id', 'code', 'title', 'description', 'duration_minutes', 'passing_score', 'status', 'published_at', 'updated_at'])
                ->with(['academy:id,name', 'department:id,name'])
                ->withCount(['items', 'attempts'])
                ->orderByDesc('id')
                ->paginate(10)
        );
    }

    public function showAssessment(Assessment $assessment): JsonResponse
    {
        return response()->json(
            $assessment->load([
                'academy:id,name',
                'department:id,name',
                'items' => fn ($query) => $query->select(['question_bank.id', 'code', 'prompt', 'question_type']),
            ])
        );
    }

    public function storeAssessment(Request $request): JsonResponse
    {
        $data = $this->validateAssessment($request);

        $assessment = DB::transaction(function () use ($data) {
            $questionIds = $data['question_ids'] ?? [];
            unset($data['question_ids']);

            $assessment = Assessment::query()->create([
                ...$data,
                'duration_minutes' => $data['duration_minutes'] ?? 0,
                'passing_score' => $data['passing_score'] ?? 70,
                'status' => $data['status'] ?? 'draft',
            ]);

            $this->syncAssessmentQuestions($assessment, $questionIds);

            return $assessment->load(['academy:id,name', 'department:id,name', 'items']);
        });

        return response()->json($assessment, 201);
    }

    public function updateAssessment(Request $request, Assessment $assessment): JsonResponse
    {
        $data = $this->validateAssessment($request, $assessment);

        $assessment = DB::transaction(function () use ($data, $assessment) {
            $questionIds = $data['question_ids'] ?? null;
            unset($data['question_ids']);

            $assessment->update($data);

            if (is_array($questionIds)) {
                $this->syncAssessmentQuestions($assessment, $questionIds);
            }

            return $assessment->fresh()->load(['academy:id,name', 'department:id,name', 'items']);
        });

        return response()->json($assessment);
    }

    public function destroyAssessment(Assessment $assessment): JsonResponse
    {
        $assessment->delete();

        return response()->json(['message' => 'تم الحذف بنجاح.']);
    }

    public function trainingPlans(): JsonResponse
    {
        return response()->json(
            TrainingPlan::query()
                ->select(['id', 'user_id', 'assessment_attempt_id', 'status', 'generated_at', 'started_at', 'completed_at', 'updated_at'])
                ->with(['user:id,name,email', 'items.competency:id,name', 'items.course:id,name'])
                ->withCount('items')
                ->orderByDesc('generated_at')
                ->paginate(10)
        );
    }

    public function courses(): JsonResponse
    {
        return response()->json(
            Course::query()
                ->select(['id', 'academy_id', 'code', 'name', 'description', 'duration_minutes', 'difficulty', 'is_active', 'updated_at'])
                ->with(['academy:id,name'])
                ->withCount('competencies')
                ->orderBy('name')
                ->paginate(10)
        );
    }

    public function storeCourse(Request $request): JsonResponse
    {
        $data = $request->validate([
            'academy_id' => ['nullable', 'exists:academies,id'],
            'code' => ['required', 'string', 'max:255', 'unique:courses,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'difficulty' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $course = Course::query()->create([
            ...$data,
            'duration_minutes' => $data['duration_minutes'] ?? 0,
            'difficulty' => $data['difficulty'] ?? 'beginner',
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json($course->load('academy:id,name'), 201);
    }

    public function updateCourse(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'academy_id' => ['nullable', 'exists:academies,id'],
            'code' => ['sometimes', 'string', 'max:255', Rule::unique('courses', 'code')->ignore($course->id)],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'difficulty' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $course->update($data);

        return response()->json($course->fresh()->load('academy:id,name'));
    }

    public function destroyCourse(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(['message' => 'تم الحذف بنجاح.']);
    }

    public function certificates(): JsonResponse
    {
        return response()->json(
            Certificate::query()
                ->select(['id', 'user_id', 'training_plan_id', 'assessment_attempt_id', 'certificate_number', 'issued_at', 'expires_at', 'updated_at'])
                ->with(['user:id,name,email'])
                ->orderByDesc('issued_at')
                ->paginate(10)
        );
    }

    public function auditLogs(): JsonResponse
    {
        return response()->json(
            AuditLog::query()
                ->select(['id', 'user_id', 'auditable_type', 'auditable_id', 'action', 'event', 'ip_address', 'created_at'])
                ->with(['user:id,name,email'])
                ->orderByDesc('id')
                ->paginate(10)
        );
    }

    public function lookups(): JsonResponse
    {
        return response()->json([
            'academies' => Academy::query()->select(['id', 'name', 'code'])->orderBy('name')->get(),
            'departments' => Department::query()->select(['id', 'academy_id', 'name', 'code'])->orderBy('name')->get(),
            'competencies' => Competency::query()->select(['id', 'department_id', 'name', 'code'])->orderBy('name')->get(),
            'questions' => QuestionBank::query()->select(['id', 'code', 'prompt', 'question_type', 'is_active'])->where('is_active', true)->orderBy('code')->get(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateQuestion(Request $request, ?QuestionBank $question = null): array
    {
        return $request->validate([
            'department_id' => ['nullable', 'exists:departments,id'],
            'competency_id' => ['nullable', 'exists:competencies,id'],
            'code' => [
                $question ? 'sometimes' : 'required',
                'string',
                'max:255',
                Rule::unique('question_bank', 'code')->ignore($question?->id),
            ],
            'question_type' => [$question ? 'sometimes' : 'required', 'string', Rule::in(['multiple_choice', 'scenario_based', 'simulation'])],
            'prompt' => [$question ? 'sometimes' : 'required', 'string'],
            'max_score' => ['nullable', 'numeric', 'min:0'],
            'time_limit_seconds' => ['nullable', 'integer', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'options' => ['nullable', 'array'],
            'options.*.label' => ['required_with:options', 'string', 'max:255'],
            'options.*.code' => ['nullable', 'string', 'max:50'],
            'options.*.is_correct' => ['nullable', 'boolean'],
            'options.*.score_value' => ['nullable', 'numeric'],
            'options.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateAssessment(Request $request, ?Assessment $assessment = null): array
    {
        return $request->validate([
            'academy_id' => ['nullable', 'exists:academies,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'code' => [
                $assessment ? 'sometimes' : 'required',
                'string',
                'max:255',
                Rule::unique('assessments', 'code')->ignore($assessment?->id),
            ],
            'title' => [$assessment ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'passing_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'status' => ['nullable', 'string', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => ['nullable', 'date'],
            'question_ids' => ['nullable', 'array'],
            'question_ids.*' => ['integer', 'exists:question_bank,id'],
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $options
     */
    private function syncQuestionOptions(QuestionBank $question, array $options): void
    {
        foreach (array_values($options) as $index => $option) {
            $question->options()->create([
                'code' => $option['code'] ?? null,
                'label' => $option['label'],
                'is_correct' => (bool) ($option['is_correct'] ?? false),
                'score_value' => $option['score_value'] ?? 0,
                'sort_order' => $option['sort_order'] ?? $index,
            ]);
        }
    }

    /**
     * @param  array<int, int>  $questionIds
     */
    private function syncAssessmentQuestions(Assessment $assessment, array $questionIds): void
    {
        $sync = [];
        foreach (array_values($questionIds) as $index => $questionId) {
            $sync[$questionId] = [
                'sort_order' => $index,
                'weight' => 1,
            ];
        }

        $assessment->items()->sync($sync);
    }
}
