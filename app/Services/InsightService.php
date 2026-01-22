<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InsightService
{
    /**
     * Get spending insights for a month.
     * Note: spending_type feature is not in use, returning simplified insights.
     */
    public function getInsights(int $userId, ?string $month = null): array
    {
        $month = $month ?? Carbon::now()->format('Y-m');
        $previousMonth = Carbon::createFromFormat('Y-m', $month)->subMonth()->format('Y-m');

        $insights = [];

        // Expense change insight
        $expenseInsight = $this->getExpenseChangeInsight($userId, $month, $previousMonth);
        if ($expenseInsight) {
            $insights[] = $expenseInsight;
        }

        // Top expense category insight
        $topCategoryInsight = $this->getTopCategoryInsight($userId, $month);
        if ($topCategoryInsight) {
            $insights[] = $topCategoryInsight;
        }

        // Weekly reflection
        $weeklyReflection = $this->getWeeklyReflection($userId);

        return [
            'insights' => $insights,
            'weekly_reflection' => $weeklyReflection,
        ];
    }

    /**
     * Get expense change insight.
     */
    private function getExpenseChangeInsight(int $userId, string $month, string $previousMonth): ?array
    {
        $currentExpense = $this->getMonthlyExpense($userId, $month);
        $previousExpense = $this->getMonthlyExpense($userId, $previousMonth);

        if ($previousExpense == 0 && $currentExpense == 0) {
            return null;
        }

        $change = $previousExpense > 0 
            ? (int) round((($currentExpense - $previousExpense) / $previousExpense) * 100)
            : ($currentExpense > 0 ? 100 : 0);

        $trend = $change > 0 ? 'up' : 'down';
        $changeText = $change > 0 ? "naik {$change}%" : "turun " . abs($change) . "%";

        return [
            'type' => 'expense_change',
            'title' => 'Perubahan Pengeluaran',
            'description' => "Pengeluaran bulan ini {$changeText} dari bulan lalu",
            'trend' => $trend,
            'value' => $change,
        ];
    }

    /**
     * Get top expense category insight.
     */
    private function getTopCategoryInsight(int $userId, string $month): ?array
    {
        $topCategory = DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->groupBy('categories.name')
            ->select('categories.name', DB::raw('SUM(transactions.amount) as total'))
            ->orderByDesc('total')
            ->first();

        if (!$topCategory) {
            return null;
        }

        return [
            'type' => 'top_category',
            'title' => 'Kategori Pengeluaran Terbesar',
            'description' => "Pengeluaran terbesar bulan ini: {$topCategory->name}",
            'category' => $topCategory->name,
            'amount' => (float) $topCategory->total,
        ];
    }

    /**
     * Get weekly reflection summary.
     */
    private function getWeeklyReflection(int $userId): array
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $weekNumber = Carbon::now()->format('Y-\\WW');

        $totalTransactions = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfWeek, $endOfWeek])
            ->count();

        $totalAmount = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfWeek, $endOfWeek])
            ->sum('amount');

        $message = $totalTransactions > 0
            ? "Minggu ini ada {$totalTransactions} pengeluaran dengan total Rp " . number_format($totalAmount, 0, ',', '.')
            : "Belum ada transaksi minggu ini.";

        return [
            'week' => $weekNumber,
            'total_transactions' => $totalTransactions,
            'want_transactions' => 0, // spending_type not in use
            'message' => $message,
        ];
    }

    /**
     * Get monthly expense total.
     */
    private function getMonthlyExpense(int $userId, string $month): float
    {
        return (float) DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->sum('amount');
    }
}

