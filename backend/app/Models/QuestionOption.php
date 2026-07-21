<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionOption extends Model
{
    use HasFactory;

    protected $fillable = ['question_bank_id', 'code', 'label', 'value', 'is_correct', 'score_value', 'sort_order'];

    protected function casts(): array
    {
        return [
            'value' => 'array',
            'is_correct' => 'boolean',
            'score_value' => 'decimal:2',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'question_bank_id');
    }
}