<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'initial_balance',
        'currency',
        'icon',
        'color',
        'is_active',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Account types enum.
     */
    public const TYPES = [
        'bank' => 'Bank',
        'ewallet' => 'E-Wallet',
        'cash' => 'Cash',
        'investment' => 'Investment',
        'credit_card' => 'Credit Card',
        'other' => 'Other',
    ];

    /**
     * Get the user that owns the account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions for the account.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the current balance of the account.
     * Balance = initial_balance + total_income - total_expense
     */
    public function getCurrentBalanceAttribute(): float
    {
        $totalIncome = $this->transactions()
            ->where('type', 'income')
            ->sum('amount');

        $totalExpense = $this->transactions()
            ->where('type', 'expense')
            ->sum('amount');

        return (float) $this->initial_balance + (float) $totalIncome - (float) $totalExpense;
    }

    /**
     * Scope a query to only include active accounts.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Get the type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }
}
