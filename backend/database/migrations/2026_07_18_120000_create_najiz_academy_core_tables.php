<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academies', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('active')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('departments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('academy_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['academy_id', 'code']);
            $table->index(['academy_id', 'is_active']);
        });

        Schema::create('competencies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('weight', 8, 2)->default(1);
            $table->decimal('success_threshold', 8, 2)->default(70);
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['department_id', 'code']);
            $table->index(['department_id', 'is_active']);
        });

        Schema::create('courses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('academy_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->string('difficulty')->default('beginner')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('competency_course', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('priority')->default(0)->index();
            $table->timestamps();

            $table->unique(['competency_id', 'course_id']);
        });

        Schema::create('question_bank', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('competency_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code')->unique();
            $table->string('question_type');
            $table->text('prompt');
            $table->decimal('max_score', 8, 2)->default(1);
            $table->unsignedInteger('time_limit_seconds')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['competency_id', 'question_type', 'is_active']);
            $table->index(['department_id', 'is_active']);
        });

        Schema::create('question_options', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_bank_id')->constrained('question_bank')->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->string('label');
            $table->json('value')->nullable();
            $table->boolean('is_correct')->default(false)->index();
            $table->decimal('score_value', 8, 2)->default(0);
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();

            $table->index(['question_bank_id', 'sort_order']);
        });

        Schema::create('assessments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('academy_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->decimal('passing_score', 8, 2)->default(70);
            $table->string('status')->default('draft')->index();
            $table->json('settings')->nullable();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department_id', 'status']);
        });

        Schema::create('assessment_questions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_bank_id')->constrained('question_bank')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->decimal('weight', 8, 2)->default(1);
            $table->timestamps();

            $table->unique(['assessment_id', 'question_bank_id']);
            $table->index(['assessment_id', 'sort_order']);
        });

        // training_plan_id FK is added after training_plans exists (circular dependency).
        Schema::create('assessment_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('in_progress')->index();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('submitted_at')->nullable()->index();
            $table->unsignedInteger('remaining_time_seconds')->default(0);
            $table->json('answers')->nullable();
            $table->json('autosave_snapshot')->nullable();
            $table->decimal('total_score', 8, 2)->nullable();
            $table->json('result_summary')->nullable();
            $table->foreignId('training_plan_id')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['assessment_id', 'user_id', 'status']);
        });

        Schema::create('training_plans', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assessment_attempt_id')->nullable()->constrained('assessment_attempts')->nullOnDelete();
            $table->string('status')->default('draft')->index();
            $table->timestamp('generated_at')->nullable()->index();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('assessment_attempts', function (Blueprint $table): void {
            $table->foreign('training_plan_id')
                ->references('id')
                ->on('training_plans')
                ->nullOnDelete();
        });

        Schema::create('training_plan_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('training_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending')->index();
            $table->unsignedInteger('priority')->default(0)->index();
            $table->timestamp('due_at')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['training_plan_id', 'status']);
        });

        Schema::create('certificates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assessment_attempt_id')->nullable()->constrained()->nullOnDelete();
            $table->string('certificate_number')->unique();
            $table->timestamp('issued_at')->index();
            $table->timestamp('expires_at')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->string('action');
            $table->string('event')->nullable();
            $table->string('ip_address', 45)->nullable()->index();
            $table->text('user_agent')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['user_id', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('training_plan_items');
        Schema::dropIfExists('training_plans');
        Schema::dropIfExists('assessment_attempts');
        Schema::dropIfExists('assessment_questions');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('question_bank');
        Schema::dropIfExists('competency_course');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('competencies');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('academies');
    }
};