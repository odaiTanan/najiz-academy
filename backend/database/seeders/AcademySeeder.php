<?php

namespace Database\Seeders;

use App\Models\Academy;
use App\Models\Assessment;
use App\Models\Certificate;
use App\Models\Competency;
use App\Models\Course;
use App\Models\Department;
use App\Models\QuestionBank;
use App\Models\TrainingPlan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $academy = Academy::query()->updateOrCreate(
                ['code' => 'NJZ-DRV'],
                [
                    'name' => 'أكاديمية ناجز جو للسائقين',
                    'description' => 'أكاديمية تدريب وتقييم سائقي التوصيل السريع وفق معايير السلامة والجودة وخدمة العملاء.',
                    'status' => 'active',
                    'metadata' => ['region' => 'الرياض', 'locale' => 'ar'],
                ],
            );

            $ops = Department::query()->updateOrCreate(
                ['academy_id' => $academy->id, 'code' => 'OPS'],
                [
                    'name' => 'العمليات الميدانية',
                    'description' => 'إدارة المسارات، التسليم، والتعامل مع الحالات اليومية في الميدان.',
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            );

            $safety = Department::query()->updateOrCreate(
                ['academy_id' => $academy->id, 'code' => 'SAF'],
                [
                    'name' => 'السلامة المرورية',
                    'description' => 'معايير القيادة الآمنة والتعامل مع المخاطر على الطريق.',
                    'sort_order' => 2,
                    'is_active' => true,
                ],
            );

            $service = Department::query()->updateOrCreate(
                ['academy_id' => $academy->id, 'code' => 'CX'],
                [
                    'name' => 'خدمة العملاء',
                    'description' => 'التواصل مع العملاء وحل المشكلات باحترافية.',
                    'sort_order' => 3,
                    'is_active' => true,
                ],
            );

            $competencies = [
                'route' => Competency::query()->updateOrCreate(
                    ['department_id' => $ops->id, 'code' => 'OPS-ROUTE'],
                    [
                        'name' => 'إدارة المسار والتوصيل',
                        'description' => 'تخطيط المسار، ترتيب الطرود، والالتزام بمواعيد التسليم.',
                        'weight' => 1.5,
                        'success_threshold' => 70,
                        'sort_order' => 1,
                        'is_active' => true,
                    ],
                ),
                'app' => Competency::query()->updateOrCreate(
                    ['department_id' => $ops->id, 'code' => 'OPS-APP'],
                    [
                        'name' => 'استخدام تطبيق السائق',
                        'description' => 'تحديث حالة الطلبات واستخدام أدوات التطبيق بكفاءة.',
                        'weight' => 1.2,
                        'success_threshold' => 75,
                        'sort_order' => 2,
                        'is_active' => true,
                    ],
                ),
                'safe' => Competency::query()->updateOrCreate(
                    ['department_id' => $safety->id, 'code' => 'SAF-DRIVE'],
                    [
                        'name' => 'القيادة الآمنة',
                        'description' => 'الالتزام بقواعد المرور وتجنب السلوكيات الخطرة.',
                        'weight' => 2,
                        'success_threshold' => 80,
                        'sort_order' => 1,
                        'is_active' => true,
                    ],
                ),
                'hazard' => Competency::query()->updateOrCreate(
                    ['department_id' => $safety->id, 'code' => 'SAF-HAZ'],
                    [
                        'name' => 'التعامل مع المخاطر',
                        'description' => 'تقييم المواقف الطارئة واتخاذ القرار المناسب.',
                        'weight' => 1.5,
                        'success_threshold' => 75,
                        'sort_order' => 2,
                        'is_active' => true,
                    ],
                ),
                'comm' => Competency::query()->updateOrCreate(
                    ['department_id' => $service->id, 'code' => 'CX-COMM'],
                    [
                        'name' => 'التواصل مع العميل',
                        'description' => 'أسلوب الحديث، الاحترام، وإدارة التوقعات.',
                        'weight' => 1.3,
                        'success_threshold' => 70,
                        'sort_order' => 1,
                        'is_active' => true,
                    ],
                ),
                'complaint' => Competency::query()->updateOrCreate(
                    ['department_id' => $service->id, 'code' => 'CX-COMP'],
                    [
                        'name' => 'معالجة الشكاوى',
                        'description' => 'الاستماع للمشكلة وتقديم حلول واضحة ضمن السياسات.',
                        'weight' => 1.4,
                        'success_threshold' => 70,
                        'sort_order' => 2,
                        'is_active' => true,
                    ],
                ),
            ];

            $courses = [
                Course::query()->updateOrCreate(
                    ['code' => 'CRS-ROUTE-01'],
                    [
                        'academy_id' => $academy->id,
                        'name' => 'أساسيات تخطيط مسارات التوصيل',
                        'description' => 'دورة عملية لترتيب نقاط التسليم وتقليل زمن الرحلة.',
                        'duration_minutes' => 90,
                        'difficulty' => 'beginner',
                        'is_active' => true,
                    ],
                ),
                Course::query()->updateOrCreate(
                    ['code' => 'CRS-SAFE-01'],
                    [
                        'academy_id' => $academy->id,
                        'name' => 'القيادة الآمنة في المدن',
                        'description' => 'قواعد السلامة والتعامل مع الازدحام والإشارات.',
                        'duration_minutes' => 120,
                        'difficulty' => 'intermediate',
                        'is_active' => true,
                    ],
                ),
                Course::query()->updateOrCreate(
                    ['code' => 'CRS-CX-01'],
                    [
                        'academy_id' => $academy->id,
                        'name' => 'خدمة العملاء للسائقين',
                        'description' => 'مهارات التواصل وحل الشكاوى أثناء التسليم.',
                        'duration_minutes' => 75,
                        'difficulty' => 'beginner',
                        'is_active' => true,
                    ],
                ),
                Course::query()->updateOrCreate(
                    ['code' => 'CRS-APP-01'],
                    [
                        'academy_id' => $academy->id,
                        'name' => 'إتقان تطبيق السائق',
                        'description' => 'تحديث الحالات، رفع الملاحظات، واستخدام التنبيهات.',
                        'duration_minutes' => 60,
                        'difficulty' => 'beginner',
                        'is_active' => true,
                    ],
                ),
            ];

            $competencies['route']->courses()->syncWithoutDetaching([
                $courses[0]->id => ['priority' => 1],
            ]);
            $competencies['safe']->courses()->syncWithoutDetaching([
                $courses[1]->id => ['priority' => 1],
            ]);
            $competencies['comm']->courses()->syncWithoutDetaching([
                $courses[2]->id => ['priority' => 1],
            ]);
            $competencies['app']->courses()->syncWithoutDetaching([
                $courses[3]->id => ['priority' => 1],
            ]);

            $questionDefinitions = [
                [
                    'code' => 'Q-OPS-001',
                    'department_id' => $ops->id,
                    'competency' => 'route',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'ما أفضل طريقة لترتيب نقاط التسليم في بداية الوردية؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'حسب ترتيب ظهور الطلبات في التطبيق فقط', 'is_correct' => false],
                        ['label' => 'حسب القرب الجغرافي ومواعيد التسليم المتفق عليها', 'is_correct' => true],
                        ['label' => 'حسب حجم الطرد من الأكبر للأصغر', 'is_correct' => false],
                        ['label' => 'عشوائياً لتوزيع الجهد', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-OPS-002',
                    'department_id' => $ops->id,
                    'competency' => 'route',
                    'question_type' => 'scenario_based',
                    'prompt' => 'لديك 8 طرود في نفس الحي، وطلبان مستعجلان خارج المسار. ماذا تفعل؟',
                    'max_score' => 2,
                    'options' => [
                        ['label' => 'أكمل الحي أولاً ثم الطلبات المستعجلة دون إبلاغ أحد', 'is_correct' => false],
                        ['label' => 'راجع الأولويات في التطبيق وأعد ترتيب المسار وفق المواعيد والحالة', 'is_correct' => true],
                        ['label' => 'ألغِ الطلبات المستعجلة لتوفير الوقت', 'is_correct' => false],
                        ['label' => 'سلّم الأقرب لموقعك الحالي فقط', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-OPS-003',
                    'department_id' => $ops->id,
                    'competency' => 'app',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'متى يجب تحديث حالة الطلب إلى «تم التسليم»؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'عند الوصول للموقع قبل مقابلة العميل', 'is_correct' => false],
                        ['label' => 'بعد تسليم الطرد وتأكيد الاستلام من العميل', 'is_correct' => true],
                        ['label' => 'في نهاية الوردية دفعة واحدة', 'is_correct' => false],
                        ['label' => 'بعد مغادرة الحي بالكامل', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-OPS-004',
                    'department_id' => $ops->id,
                    'competency' => 'app',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'ما الإجراء الصحيح إذا تعذر فتح عنوان العميل في الخريطة؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'إغلاق الطلب فوراً كمشكلة عنوان', 'is_correct' => false],
                        ['label' => 'التواصل مع الدعم أو العميل وتوثيق الملاحظة في التطبيق', 'is_correct' => true],
                        ['label' => 'ترك الطرد عند أقرب جار بدون إبلاغ', 'is_correct' => false],
                        ['label' => 'تجاهل الطلب والانتقال للتالي', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-SAF-001',
                    'department_id' => $safety->id,
                    'competency' => 'safe',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'أثناء القيادة في الازدحام، أي سلوك صحيح؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'تجاوز الإشارة الصفراء لتوفير الوقت', 'is_correct' => false],
                        ['label' => 'المحافظة على مسافة آمنة والالتزام بالسرعة المحددة', 'is_correct' => true],
                        ['label' => 'استخدام الهاتف أثناء القيادة للتنسيق', 'is_correct' => false],
                        ['label' => 'الوقوف المفاجئ في منتصف الطريق لاستلام مكالمة', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-SAF-002',
                    'department_id' => $safety->id,
                    'competency' => 'safe',
                    'question_type' => 'scenario_based',
                    'prompt' => 'تهطل أمطار غزيرة وانخفضت الرؤية. ما القرار الأنسب؟',
                    'max_score' => 2,
                    'options' => [
                        ['label' => 'زيادة السرعة للوصول قبل تفاقم المطر', 'is_correct' => false],
                        ['label' => 'تخفيف السرعة وتشغيل الأضواء المناسبة وتجنب المناورات الخطرة', 'is_correct' => true],
                        ['label' => 'القيادة على خط الطوارئ لتفادي الازدحام', 'is_correct' => false],
                        ['label' => 'إيقاف التحديثات في التطبيق والتركيز فقط على الطريق دون إبلاغ', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-SAF-003',
                    'department_id' => $safety->id,
                    'competency' => 'hazard',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'عند ملاحظة عطل مفاجئ في المركبة أثناء المسار، ماذا تفعل أولاً؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'الاستمرار حتى إكمال كل الطلبات', 'is_correct' => false],
                        ['label' => 'التوقف في مكان آمن ثم إبلاغ الدعم وتوثيق الحالة', 'is_correct' => true],
                        ['label' => 'ترك المركبة في منتصف الطريق والاتصال بصديق', 'is_correct' => false],
                        ['label' => 'تغيير حالة كل الطلبات إلى ملغاة فوراً', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-SAF-004',
                    'department_id' => $safety->id,
                    'competency' => 'hazard',
                    'question_type' => 'scenario_based',
                    'prompt' => 'وقع حادث بسيط بدون إصابات أثناء التوصيل. ما الترتيب الصحيح؟',
                    'max_score' => 2,
                    'options' => [
                        ['label' => 'مغادرة الموقع بسرعة لتجنب التأخير', 'is_correct' => false],
                        ['label' => 'تأمين الموقع، التحقق من السلامة، ثم إبلاغ الجهة المختصة والدعم', 'is_correct' => true],
                        ['label' => 'إكمال التسليم أولاً ثم العودة لاحقاً', 'is_correct' => false],
                        ['label' => 'تصوير الموقع فقط دون إبلاغ أحد', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-CX-001',
                    'department_id' => $service->id,
                    'competency' => 'comm',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'ما أفضل أسلوب عند وصولك للعميل متأخراً قليلاً؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'تجاهل التأخير وتسليم الطرد بسرعة', 'is_correct' => false],
                        ['label' => 'الاعتذار باختصار ومهنية ثم إكمال التسليم', 'is_correct' => true],
                        ['label' => 'لوم الزحمة على العميل', 'is_correct' => false],
                        ['label' => 'طلب تقييم ممتاز قبل التسليم', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-CX-002',
                    'department_id' => $service->id,
                    'competency' => 'comm',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'طلب العميل فتح الطرد قبل الاستلام. ما التصرف الصحيح؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'رفض الطلب بشكل حاد', 'is_correct' => false],
                        ['label' => 'تطبيق سياسة الشركة بوضوح ولباقة وتوضيح الإجراء المسموح', 'is_correct' => true],
                        ['label' => 'فتح كل الطرود دون توثيق', 'is_correct' => false],
                        ['label' => 'ترك الطرد والعودة لاحقاً دون إبلاغ', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-CX-003',
                    'department_id' => $service->id,
                    'competency' => 'complaint',
                    'question_type' => 'scenario_based',
                    'prompt' => 'عميل غاضب لأن الطرد تأخر ويطالب بتعويض فوري. ماذا تفعل؟',
                    'max_score' => 2,
                    'options' => [
                        ['label' => 'الجدال معه حول سبب التأخير', 'is_correct' => false],
                        ['label' => 'الاستماع بهدوء، الاعتذار، وتوجيهه للقناة الصحيحة مع توثيق الملاحظة', 'is_correct' => true],
                        ['label' => 'وعده بتعويض نقدي منك شخصياً', 'is_correct' => false],
                        ['label' => 'إنهاء المكالمة فوراً', 'is_correct' => false],
                    ],
                ],
                [
                    'code' => 'Q-CX-004',
                    'department_id' => $service->id,
                    'competency' => 'complaint',
                    'question_type' => 'multiple_choice',
                    'prompt' => 'رفض العميل استلام الطرد بسبب تلف واضح في التغليف. ما الإجراء؟',
                    'max_score' => 1,
                    'options' => [
                        ['label' => 'إجباره على الاستلام', 'is_correct' => false],
                        ['label' => 'توثيق الحالة في التطبيق وإبلاغ الدعم وفق السياسة', 'is_correct' => true],
                        ['label' => 'استبدال الطرد من مخزونك الشخصي', 'is_correct' => false],
                        ['label' => 'ترك الطرد أمام الباب دون تحديث الحالة', 'is_correct' => false],
                    ],
                ],
            ];

            $createdQuestions = [];

            foreach ($questionDefinitions as $index => $definition) {
                $competency = $competencies[$definition['competency']];

                $question = QuestionBank::query()->updateOrCreate(
                    ['code' => $definition['code']],
                    [
                        'department_id' => $definition['department_id'],
                        'competency_id' => $competency->id,
                        'question_type' => $definition['question_type'],
                        'prompt' => $definition['prompt'],
                        'max_score' => $definition['max_score'],
                        'time_limit_seconds' => 90,
                        'sort_order' => $index + 1,
                        'is_active' => true,
                    ],
                );

                $question->options()->delete();

                foreach ($definition['options'] as $optionIndex => $option) {
                    $question->options()->create([
                        'code' => chr(65 + $optionIndex),
                        'label' => $option['label'],
                        'is_correct' => $option['is_correct'],
                        'score_value' => $option['is_correct'] ? $definition['max_score'] : 0,
                        'sort_order' => $optionIndex + 1,
                    ]);
                }

                $createdQuestions[] = $question;
            }

            $entryAssessment = Assessment::query()->updateOrCreate(
                ['code' => 'ASM-ENTRY-01'],
                [
                    'academy_id' => $academy->id,
                    'department_id' => $ops->id,
                    'title' => 'اختبار القبول الأساسي للسائقين',
                    'description' => 'تقييم شامل للعمليات والسلامة وخدمة العملاء قبل بدء العمل الميداني.',
                    'duration_minutes' => 45,
                    'passing_score' => 70,
                    'status' => 'published',
                    'published_at' => now(),
                    'settings' => ['shuffle_questions' => false, 'locale' => 'ar'],
                ],
            );

            $safetyAssessment = Assessment::query()->updateOrCreate(
                ['code' => 'ASM-SAFE-01'],
                [
                    'academy_id' => $academy->id,
                    'department_id' => $safety->id,
                    'title' => 'اختبار السلامة المرورية',
                    'description' => 'تركيز على القيادة الآمنة والتعامل مع المخاطر.',
                    'duration_minutes' => 25,
                    'passing_score' => 80,
                    'status' => 'published',
                    'published_at' => now(),
                    'settings' => ['locale' => 'ar'],
                ],
            );

            $draftAssessment = Assessment::query()->updateOrCreate(
                ['code' => 'ASM-CX-DRAFT'],
                [
                    'academy_id' => $academy->id,
                    'department_id' => $service->id,
                    'title' => 'مسودة اختبار خدمة العملاء',
                    'description' => 'اختبار قيد الإعداد لمهارات التواصل ومعالجة الشكاوى.',
                    'duration_minutes' => 20,
                    'passing_score' => 70,
                    'status' => 'draft',
                    'published_at' => null,
                    'settings' => ['locale' => 'ar'],
                ],
            );

            $entrySync = [];
            foreach ($createdQuestions as $index => $question) {
                $entrySync[$question->id] = ['sort_order' => $index + 1, 'weight' => 1];
            }
            $entryAssessment->items()->sync($entrySync);

            $safetyQuestions = collect($createdQuestions)->filter(
                fn (QuestionBank $question) => str_starts_with($question->code, 'Q-SAF-'),
            );
            $safetySync = [];
            foreach ($safetyQuestions->values() as $index => $question) {
                $safetySync[$question->id] = ['sort_order' => $index + 1, 'weight' => 1];
            }
            $safetyAssessment->items()->sync($safetySync);

            $cxQuestions = collect($createdQuestions)->filter(
                fn (QuestionBank $question) => str_starts_with($question->code, 'Q-CX-'),
            );
            $cxSync = [];
            foreach ($cxQuestions->values() as $index => $question) {
                $cxSync[$question->id] = ['sort_order' => $index + 1, 'weight' => 1];
            }
            $draftAssessment->items()->sync($cxSync);

            $employee = User::query()->where('email', 'employee@example.com')->first();
            $candidate = User::query()->where('email', 'candidate@example.com')->first();

            if ($employee) {
                $attempt = $employee->assessmentAttempts()->updateOrCreate(
                    [
                        'assessment_id' => $entryAssessment->id,
                        'status' => 'submitted',
                    ],
                    [
                        'started_at' => now()->subDays(2),
                        'submitted_at' => now()->subDays(2)->addMinutes(38),
                        'remaining_time_seconds' => 0,
                        'total_score' => 62,
                        'answers' => [],
                        'result_summary' => [
                            'passed' => false,
                            'score' => 62,
                            'passing_score' => 70,
                            'weak_competencies' => ['OPS-ROUTE', 'SAF-DRIVE'],
                        ],
                    ],
                );

                $plan = TrainingPlan::query()->updateOrCreate(
                    ['assessment_attempt_id' => $attempt->id],
                    [
                        'user_id' => $employee->id,
                        'status' => 'active',
                        'generated_at' => now()->subDays(2),
                        'started_at' => now()->subDay(),
                        'metadata' => ['source' => 'seeder', 'note' => 'خطة تطوير بعد نتيجة الاختبار'],
                    ],
                );

                $attempt->update(['training_plan_id' => $plan->id]);

                $plan->items()->delete();
                $plan->items()->createMany([
                    [
                        'competency_id' => $competencies['route']->id,
                        'course_id' => $courses[0]->id,
                        'status' => 'pending',
                        'priority' => 1,
                        'due_at' => now()->addDays(7),
                        'notes' => 'مراجعة أساسيات تخطيط المسارات',
                    ],
                    [
                        'competency_id' => $competencies['safe']->id,
                        'course_id' => $courses[1]->id,
                        'status' => 'in_progress',
                        'priority' => 2,
                        'due_at' => now()->addDays(10),
                        'notes' => 'إكمال دورة القيادة الآمنة',
                    ],
                ]);
            }

            if ($candidate) {
                $candidate->assessmentAttempts()->updateOrCreate(
                    [
                        'assessment_id' => $safetyAssessment->id,
                        'status' => 'in_progress',
                    ],
                    [
                        'started_at' => now()->subMinutes(10),
                        'remaining_time_seconds' => 1200,
                        'answers' => [],
                        'autosave_snapshot' => ['progress' => 20],
                    ],
                );
            }

            $trainer = User::query()->where('email', 'trainer@example.com')->first();

            if ($trainer) {
                Certificate::query()->updateOrCreate(
                    ['certificate_number' => 'NJZ-CERT-2026-0001'],
                    [
                        'user_id' => $trainer->id,
                        'training_plan_id' => null,
                        'assessment_attempt_id' => null,
                        'issued_at' => now()->subMonths(1),
                        'expires_at' => now()->addYear(),
                        'metadata' => [
                            'title' => 'شهادة مدرب معتمد - أكاديمية ناجز جو',
                            'issuer' => 'أكاديمية ناجز جو للسائقين',
                        ],
                    ],
                );
            }
        });
    }
}
