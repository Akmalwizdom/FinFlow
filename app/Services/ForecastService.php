<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ForecastService
{
    /**
     * Get cashflow forecast.
     */
    public function getForecast(int $userId): array
    {
        $currentBalance = $this->getCurrentBalance($userId);
        $averageDailyExpense = $this->getAverageDailyExpense($userId);
        $daysLeftInMonth = Carbon::now()->daysUntilEndOfMonth();

        $estimatedEndOfMonthBalance = $currentBalance - ($averageDailyExpense * $daysLeftInMonth);
        $safeDaysRemaining = $averageDailyExpense > 0 
            ? (int) floor($currentBalance / $averageDailyExpense) 
            : 999;

        // Generate projection for next 7 days
        $projection = $this->generateProjection($currentBalance, $averageDailyExpense, 7);

        return [
            'current_balance' => $currentBalance,
            'average_daily_expense' => $averageDailyExpense,
            'estimated_end_of_month_balance' => max(0, $estimatedEndOfMonthBalance),
            'safe_days_remaining' => $safeDaysRemaining,
            'projection' => $projection,
        ];
    }

    /**
     * Get current balance.
     */
    private function getCurrentBalance(int $userId): float
    {
        $income = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'income')
            ->sum('amount');

        $expense = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->sum('amount');

        return (float) ($income - $expense);
    }

    /**
     * Get average daily expense (last 30 days).
     */
    private function getAverageDailyExpense(int $userId): float
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30)->format('Y-m-d');

        $totalExpense = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $thirtyDaysAgo)
            ->sum('amount');

        return round((float) $totalExpense / 30, 2);
    }

    /**
     * Generate balance projection for next N days.
     */
    private function generateProjection(float $currentBalance, float $dailyExpense, int $days): array
    {
        $projection = [];
        $balance = $currentBalance;

        for ($i = 1; $i <= $days; $i++) {
            $date = Carbon::now()->addDays($i)->format('Y-m-d');
            $balance = max(0, $balance - $dailyExpense);

            $projection[] = [
                'date' => $date,
                'projected_balance' => round($balance, 2),
            ];
        }

        return $projection;
    }
}
