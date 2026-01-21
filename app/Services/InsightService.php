<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InsightService
{
    /**
     * Get spending insights for a month.
     */
    public function getInsights(int $userId, ?string $month = null): array
    {
        $month = $month ?? Carbon::now()->format('Y-m');
        $previousMonth = Carbon::createFromFormat('Y-m', $month)->subMonth()->format('Y-m');

        $insights = [];

        // Need vs Want ratio insight
        $needWantInsight = $this->getNeedWantInsight($userId, $month, $previousMonth);
        if ($needWantInsight) {
            $insights[] = $needWantInsight;
        }

        // Want change insight
        $wantChangeInsight = $this->getWantChangeInsight($userId, $month, $previousMonth);
        if ($wantChangeInsight) {
            $insights[] = $wantChangeInsight;
        }

        // Top want category insight
        $topWantInsight = $this->getTopWantCategoryInsight($userId, $month);
        if ($topWantInsight) {
            $insights[] = $topWantInsight;
        }

        // Weekly reflection
        $weeklyReflection = $this->getWeeklyReflection($userId);

        return [
            'insights' => $insights,
            'weekly_reflection' => $weeklyReflection,
        ];
    }

    /**
     * Get need vs want ratio insight.
     */
    private function getNeedWantInsight(int $userId, string $month, string $previousMonth): ?array
    {
        $ratio = $this->getNeedWantRatio($userId, $month);
        $previousRatio = $this->getNeedWantRatio($userId, $previousMonth);

        if ($ratio['total'] == 0) {
            return null;
        }

        $trend = $ratio['want_percentage'] > $previousRatio['want_percentage'] ? 'up' : 'down';

        return [
            'type' => 'need_want_ratio',
            'title' => 'Rasio Need vs Want',
            'description' => "{$ratio['want_percentage']}% pengeluaran bulan ini adalah keinginan",
            'trend' => $trend,
            'value' => $ratio['want_percentage'],
        ];
    }

    /**
     * Get want spending change insight.
     */
    private function getWantChangeInsight(int $userId, string $month, string $previousMonth): ?array
    {
        $currentWant = $this->getSpendingByType($userId, $month, 'want');
        $previousWant = $this->getSpendingByType($userId, $previousMonth, 'want');

        if ($previousWant == 0 && $currentWant == 0) {
            return null;
        }

        $change = $previousWant > 0 
            ? (int) round((($currentWant - $previousWant) / $previousWant) * 100)
            : ($currentWant > 0 ? 100 : 0);

        $trend = $change > 0 ? 'up' : 'down';
        $changeText = $change > 0 ? "naik {$change}%" : "turun " . abs($change) . "%";

        return [
            'type' => 'want_increase',
            'title' => 'Perubahan Pengeluaran Want',
            'description' => "Pengeluaran keinginan {$changeText} dari bulan lalu",
            'trend' => $trend,
            'value' => $change,
        ];
    }

    /**
     * Get top want category insight.
     */
    private function getTopWantCategoryInsight(int $userId, string $month): ?array
    {
        $topCategory = DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->where('transactions.spending_type', 'want')
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->groupBy('categories.id', 'categories.name')
            ->select('categories.name', DB::raw('SUM(transactions.amount) as total'))
            ->orderByDesc('total')
            ->first();

        if (!$topCategory) {
            return null;
        }

        return [
            'type' => 'top_want_category',
            'title' => 'Kategori Want Terbanyak',
            'description' => "Kategori paling sering masuk 'want': {$topCategory->name}",
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

        $wantTransactions = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->where('spending_type', 'want')
            ->whereBetween('transaction_date', [$startOfWeek, $endOfWeek])
            ->count();

        $message = $totalTransactions > 0
            ? "Minggu ini, {$wantTransactions} dari {$totalTransactions} pengeluaran adalah keinginan."
            : "Belum ada transaksi minggu ini.";

        return [
            'week' => $weekNumber,
            'total_transactions' => $totalTransactions,
            'want_transactions' => $wantTransactions,
            'message' => $message,
        ];
    }

    /**
     * Get need/want ratio for a month.
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

        return [
            'need_percentage' => $total > 0 ? (int) round(($needAmount / $total) * 100) : 0,
            'want_percentage' => $total > 0 ? (int) round(($wantAmount / $total) * 100) : 0,
            'total' => (float) $total,
        ];
    }

    /**
     * Get spending by type (need/want) for a month.
     */
    private function getSpendingByType(int $userId, string $month, string $spendingType): float
    {
        return (float) DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->where('spending_type', $spendingType)
            ->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$month])
            ->sum('amount');
    }
}
