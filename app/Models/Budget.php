<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'amount',
        'period',
        'start_date',
        'end_date',
        'alert_threshold',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'alert_threshold' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Period types enum.
     */
    public const PERIODS = [
        'weekly' => 'Weekly',
        'monthly' => 'Monthly',
        'yearly' => 'Yearly',
    ];

    /**
     * Get the user that owns the budget.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category for the budget.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the amount spent for this budget in current period.
     */
    public function getSpentAmountAttribute(): float
    {
        $query = $this->user->transactions()
            ->where('type', 'expense');

        // Filter by category if budget is category-specific
        if ($this->category_id) {
            $query->where('category_id', $this->category_id);
        }

        // Calculate period start date based on budget period
        $periodStart = $this->getCurrentPeriodStart();
        $periodEnd = $this->getCurrentPeriodEnd();

        return (float) $query
            ->whereBetween('transaction_date', [$periodStart, $periodEnd])
            ->sum('amount');
    }

    /**
     * Get remaining amount for this budget.
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(0, (float) $this->amount - $this->spent_amount);
    }

    /**
     * Get the progress percentage.
     */
    public function getProgressPercentageAttribute(): int
    {
        if ($this->amount <= 0) {
            return 0;
        }

        return min(100, (int) round(($this->spent_amount / $this->amount) * 100));
    }

    /**
     * Check if budget is over threshold.
     */
    public function getIsOverThresholdAttribute(): bool
    {
        return $this->progress_percentage >= $this->alert_threshold;
    }

    /**
     * Check if budget is exceeded.
     */
    public function getIsExceededAttribute(): bool
    {
        return $this->spent_amount >= $this->amount;
    }

    /**
     * Get the current period start date.
     */
    public function getCurrentPeriodStart(): Carbon
    {
        $now = Carbon::now();

        return match ($this->period) {
            'weekly' => $now->copy()->startOfWeek(),
            'monthly' => $now->copy()->startOfMonth(),
            'yearly' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfMonth(),
        };
    }

    /**
     * Get the current period end date.
     */
    public function getCurrentPeriodEnd(): Carbon
    {
        $now = Carbon::now();

        return match ($this->period) {
            'weekly' => $now->copy()->endOfWeek(),
            'monthly' => $now->copy()->endOfMonth(),
            'yearly' => $now->copy()->endOfYear(),
            default => $now->copy()->endOfMonth(),
        };
    }

    /**
     * Get days remaining in current period.
     */
    public function getDaysRemainingAttribute(): int
    {
        return max(0, Carbon::now()->diffInDays($this->getCurrentPeriodEnd(), false));
    }

    /**
     * Scope a query to only include active budgets.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by period.
     */
    public function scopeForPeriod(Builder $query, string $period): Builder
    {
        return $query->where('period', $period);
    }

    /**
     * Get the period label.
     */
    public function getPeriodLabelAttribute(): string
    {
        return self::PERIODS[$this->period] ?? $this->period;
    }
}
