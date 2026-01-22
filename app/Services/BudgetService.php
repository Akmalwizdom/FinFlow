<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\User;
use Carbon\Carbon;

class BudgetService
{
    /**
     * Get budget summary for a user.
     */
    public function getSummary(User $user): array
    {
        $budgets = $user->budgets()->with('category')->active()->get();

        $totalBudgetAmount = $budgets->sum('amount');
        $totalSpentAmount = $budgets->sum(fn($b) => $b->spent_amount);
        $totalRemaining = max(0, $totalBudgetAmount - $totalSpentAmount);

        $overBudgetCount = $budgets->filter(fn($b) => $b->is_exceeded)->count();
        $nearLimitCount = $budgets->filter(fn($b) => $b->is_over_threshold && !$b->is_exceeded)->count();

        return [
            'total_budget_amount' => round($totalBudgetAmount, 2),
            'total_spent_amount' => round($totalSpentAmount, 2),
            'total_remaining' => round($totalRemaining, 2),
            'overall_progress' => $totalBudgetAmount > 0
                ? min(100, round(($totalSpentAmount / $totalBudgetAmount) * 100))
                : 0,
            'budget_count' => $budgets->count(),
            'over_budget_count' => $overBudgetCount,
            'near_limit_count' => $nearLimitCount,
            'on_track_count' => $budgets->count() - $overBudgetCount - $nearLimitCount,
        ];
    }

    /**
     * Get progress for a specific budget.
     */
    public function getProgress(Budget $budget): array
    {
        return [
            'budget_id' => $budget->id,
            'name' => $budget->name,
            'amount' => (float) $budget->amount,
            'spent_amount' => $budget->spent_amount,
            'remaining_amount' => $budget->remaining_amount,
            'progress_percentage' => $budget->progress_percentage,
            'is_over_threshold' => $budget->is_over_threshold,
            'is_exceeded' => $budget->is_exceeded,
            'days_remaining' => $budget->days_remaining,
            'daily_safe_spend' => $budget->days_remaining > 0
                ? round($budget->remaining_amount / $budget->days_remaining, 2)
                : 0,
        ];
    }

    /**
     * Check for budget alerts for a user.
     */
    public function checkAlerts(User $user): array
    {
        $alerts = [];

        $budgets = $user->budgets()->with('category')->active()->get();

        foreach ($budgets as $budget) {
            if ($budget->is_exceeded) {
                $alerts[] = [
                    'type' => 'exceeded',
                    'severity' => 'high',
                    'budget_id' => $budget->id,
                    'budget_name' => $budget->name,
                    'category_name' => $budget->category?->name ?? 'Total',
                    'message' => "Budget '{$budget->name}' has been exceeded! Spent Rp " . number_format($budget->spent_amount) . " of Rp " . number_format($budget->amount),
                    'overage' => round($budget->spent_amount - $budget->amount, 2),
                ];
            } elseif ($budget->is_over_threshold) {
                $alerts[] = [
                    'type' => 'warning',
                    'severity' => 'medium',
                    'budget_id' => $budget->id,
                    'budget_name' => $budget->name,
                    'category_name' => $budget->category?->name ?? 'Total',
                    'message' => "Budget '{$budget->name}' is at {$budget->progress_percentage}%! Rp " . number_format($budget->remaining_amount) . " remaining.",
                    'remaining' => $budget->remaining_amount,
                ];
            }
        }

        return $alerts;
    }

    /**
     * Get budget performance for a period.
     */
    public function getPerformance(User $user, string $period = 'monthly'): array
    {
        $budgets = $user->budgets()
            ->with('category')
            ->active()
            ->where('period', $period)
            ->get();

        $performance = [];

        foreach ($budgets as $budget) {
            $status = 'on_track';
            if ($budget->is_exceeded) {
                $status = 'exceeded';
            } elseif ($budget->is_over_threshold) {
                $status = 'warning';
            }

            $performance[] = [
                'budget_id' => $budget->id,
                'name' => $budget->name,
                'category' => $budget->category?->name ?? 'Total',
                'category_color' => $budget->category?->color,
                'amount' => (float) $budget->amount,
                'spent' => $budget->spent_amount,
                'progress' => $budget->progress_percentage,
                'status' => $status,
            ];
        }

        return $performance;
    }
}
