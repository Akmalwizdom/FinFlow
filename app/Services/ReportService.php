<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get current balance (total income - total expense).
     */
    public function getCurrentBalance(int $userId): float
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
     * Get dashboard summary for the current month.
     */
    public function getDashboardSummary(int $userId): array
    {
        $currentMonth = Carbon::now()->format('Y-m');
        $currentBalance = $this->getCurrentBalance($userId);

        // Monthly summary
        $monthlySummary = $this->getMonthlyTotals($userId, $currentMonth);

        // Need vs Want ratio
        $needWantRatio = $this->getNeedWantRatio($userId, $currentMonth);

        // Expense by category
        $expenseByCategory = $this->getExpenseByCategory($userId, $currentMonth);

        return [
            'current_balance' => $currentBalance,
            'monthly_summary' => [
                'month' => $currentMonth,
                'total_income' => $monthlySummary['income'],
                'total_expense' => $monthlySummary['expense'],
                'remaining' => $monthlySummary['income'] - $monthlySummary['expense'],
            ],
            'need_want_ratio' => $needWantRatio,
            'expense_by_category' => $expenseByCategory,
        ];
    }

    /**
     * Get monthly report for a specific month.
     */
    public function getMonthlyReport(int $userId, string $month): array
    {
        $currentMonthTotals = $this->getMonthlyTotals($userId, $month);
        $previousMonth = Carbon::createFromFormat('Y-m', $month)->subMonth()->format('Y-m');
        $previousMonthTotals = $this->getMonthlyTotals($userId, $previousMonth);

        // Calculate changes
        $incomeChange = $this->calculatePercentageChange(
            $previousMonthTotals['income'],
            $currentMonthTotals['income']
        );
        $expenseChange = $this->calculatePercentageChange(
            $previousMonthTotals['expense'],
            $currentMonthTotals['expense']
        );

        // Need vs Want ratio
        $needWantRatio = $this->getNeedWantRatio($userId, $month);
        $previousNeedWant = $this->getNeedWantRatio($userId, $previousMonth);
        $wantChange = $this->calculatePercentageChange(
            $previousNeedWant['want_amount'],
            $needWantRatio['want_amount']
        );

        // Top categories
        $topCategories = $this->getExpenseByCategory($userId, $month, 5);

        // Daily breakdown
        $dailyBreakdown = $this->getDailyBreakdown($userId, $month);

        return [
            'month' => $month,
            'total_income' => $currentMonthTotals['income'],
            'total_expense' => $currentMonthTotals['expense'],
            'remaining_balance' => $currentMonthTotals['income'] - $currentMonthTotals['expense'],
            'need_want_ratio' => [
                'need_percentage' => $needWantRatio['need'],
                'want_percentage' => $needWantRatio['want'],
            ],
            'comparison_with_previous' => [
                'income_change' => $incomeChange,
                'expense_change' => $expenseChange,
                'want_change' => $wantChange,
            ],
            'top_categories' => $topCategories,
            'daily_breakdown' => $dailyBreakdown,
        ];
    }

    /**
     * Get monthly totals for income and expense.
     */
    private function getMonthlyTotals(int $userId, string $month): array
    {
        $income = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'income')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->sum('amount');

        $expense = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->sum('amount');

        return [
            'income' => (float) $income,
            'expense' => (float) $expense,
        ];
    }

    /**
     * Get need vs want ratio for a month.
     */
    private function getNeedWantRatio(int $userId, string $month): array
    {
        $needAmount = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->where('spending_type', 'need')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->sum('amount');

        $wantAmount = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->where('spending_type', 'want')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->sum('amount');

        $total = $needAmount + $wantAmount;
        $needPercentage = $total > 0 ? round(($needAmount / $total) * 100) : 0;
        $wantPercentage = $total > 0 ? round(($wantAmount / $total) * 100) : 0;

        return [
            'need' => (int) $needPercentage,
            'want' => (int) $wantPercentage,
            'need_amount' => (float) $needAmount,
            'want_amount' => (float) $wantAmount,
        ];
    }

    /**
     * Get expense breakdown by category.
     */
    private function getExpenseByCategory(int $userId, string $month, int $limit = 10): array
    {
        $categories = DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->select(
                'categories.name as category',
                'categories.color',
                DB::raw('SUM(transactions.amount) as amount')
            )
            ->orderByDesc('amount')
            ->limit($limit)
            ->get();

        $totalExpense = $categories->sum('amount');

        return $categories->map(function ($cat) use ($totalExpense) {
            return [
                'category' => $cat->category,
                'color' => $cat->color,
                'amount' => (float) $cat->amount,
                'percentage' => $totalExpense > 0 ? round(($cat->amount / $totalExpense) * 100) : 0,
            ];
        })->toArray();
    }

    /**
     * Get daily breakdown for a month.
     */
    private function getDailyBreakdown(int $userId, string $month): array
    {
        return DB::table('transactions')
            ->where('user_id', $userId)
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->groupBy('transaction_date')
            ->select(
                'transaction_date as date',
                DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
            )
            ->orderBy('transaction_date')
            ->get()
            ->map(function ($day) {
                return [
                    'date' => $day->date,
                    'income' => (float) $day->income,
                    'expense' => (float) $day->expense,
                ];
            })
            ->toArray();
    }

    /**
     * Calculate percentage change between two values.
     */
    private function calculatePercentageChange(float $previous, float $current): int
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return (int) round((($current - $previous) / $previous) * 100);
    }

    /**
     * Get monthly balance history for trend chart.
     */
    public function getBalanceHistory(int $userId, int $months = 6): array
    {
        $history = [];
        $runningBalance = 0;

        // Get all transactions ordered by date
        $transactions = DB::table('transactions')
            ->where('user_id', $userId)
            ->orderBy('transaction_date')
            ->get();

        // Calculate running balance at end of each month
        $monthlyBalances = [];
        foreach ($transactions as $tx) {
            $month = date('Y-m', strtotime($tx->transaction_date));
            if (!isset($monthlyBalances[$month])) {
                $monthlyBalances[$month] = 0;
            }
            $amount = $tx->type === 'income' ? $tx->amount : -$tx->amount;
            $monthlyBalances[$month] += $amount;
        }

        // Calculate cumulative balance per month
        $cumulative = 0;
        $cumulativeByMonth = [];
        foreach ($monthlyBalances as $month => $change) {
            $cumulative += $change;
            $cumulativeByMonth[$month] = $cumulative;
        }

        // Get last N months
        $now = Carbon::now();
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthLabel = $date->format('M');

            // Find the balance at end of this month or previous
            $balance = 0;
            foreach ($cumulativeByMonth as $m => $bal) {
                if ($m <= $monthKey) {
                    $balance = $bal;
                }
            }

            $history[] = [
                'month' => $monthLabel,
                'month_key' => $monthKey,
                'value' => round($balance, 2),
            ];
        }

        return $history;
    }
}
