<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'color',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * FinFlow color palettes for auto-assignment.
     */
    private static array $expenseColors = [
        '#007180', '#4db6ac', '#80cbc4', '#009688',
        '#26a69a', '#00897b', '#b2dfdb', '#e0f2f1',
    ];

    private static array $incomeColors = [
        '#078834', '#10b981', '#059669', '#34d399', '#6ee7b7',
    ];

    /**
     * Bootstrap the model and register events.
     */
    protected static function booted(): void
    {
        static::creating(function (Category $category) {
            // Auto-assign color if not provided
            if (empty($category->color)) {
                $category->color = self::getNextColor($category->type, $category->user_id);
            }
        });
    }

    /**
     * Get the next available color from the palette.
     */
    private static function getNextColor(string $type, int $userId): string
    {
        $palette = $type === 'expense' ? self::$expenseColors : self::$incomeColors;

        // Count existing categories of this type for this user
        $existingCount = self::where('user_id', $userId)
            ->where('type', $type)
            ->count();

        // Cycle through the palette
        return $palette[$existingCount % count($palette)];
    }

    /**
     * Get the user that owns the category.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions for the category.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope a query to only include income categories.
     */
    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    /**
     * Scope a query to only include expense categories.
     */
    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }
}
