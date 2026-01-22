import { Head } from '@inertiajs/react';
import { EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    BalanceCards,
    BalanceTrendChart,
    BudgetWidget,
    CategoryDonut,
    RecentTransactions,
    type Transaction as DashboardTransaction,
} from '@/components/dashboard';
import AppLayout from '@/layouts/app-layout';
import {
    budgetsApi,
    dashboardApi,
    reportsApi,
    transactionsApi,
    type BalanceHistoryItem,
    type BudgetSummary,
    type DashboardSummary,
    type Transaction,
} from '@/lib/api';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [trendData, setTrendData] = useState<{ month: string; value: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, transactionsRes, historyRes, budgetRes] = await Promise.all([
                    dashboardApi.getSummary(),
                    transactionsApi.list({ per_page: 5 }),
                    reportsApi.balanceHistory(6),
                    budgetsApi.list(),
                ]);

                setSummary(summaryRes.data.data);
                setRecentTransactions(transactionsRes.data.data.items);
                setBudgetSummary(budgetRes.data.data.summary);

                // Transform balance history to trend data
                const history = historyRes.data.data.map((item: BalanceHistoryItem) => ({
                    month: item.month.toUpperCase(),
                    value: item.value,
                }));
                setTrendData(history);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    // Transform data for components
    const balanceData = {
        balance: summary?.current_balance ?? 0,
        balanceChange: 0,
        income: summary?.monthly_summary.total_income ?? 0,
        incomeProgress: 100,
        expenses: summary?.monthly_summary.total_expense ?? 0,
        remainingBudget: summary?.monthly_summary.remaining ?? 0,
    };

    const categoryData = summary?.expense_by_category.map((cat) => ({
        name: cat.category,
        amount: cat.amount,
        color: cat.color || '#d1d5db',
    })) ?? [];

    const dashboardTransactions: DashboardTransaction[] = recentTransactions.map((t) => ({
        id: t.id,
        description: t.note || t.category.name,
        category: t.category.name,
        amount: t.amount,
        date: new Date(t.transaction_date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }),
        account: t.spending_type ? `${t.spending_type.toUpperCase()}` : '',
        type: t.type,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Main Dashboard Content */}
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                            Dashboard Overview
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Quietly managing your wealth since last session.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
                            <EyeOff className="size-4" />
                            <span>Privacy Mode</span>
                        </button>
                    </div>
                </div>

                {/* Balance Cards */}
                <BalanceCards {...balanceData} />

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <BalanceTrendChart data={trendData} />
                    </div>
                    <CategoryDonut
                        categories={categoryData}
                        totalSpent={balanceData.expenses}
                    />
                </div>

                {/* Budget Widget and Recent Transactions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <RecentTransactions
                            transactions={dashboardTransactions}
                            onViewAll={() => {
                                window.location.href = '/transactions';
                            }}
                        />
                    </div>
                    <BudgetWidget summary={budgetSummary} />
                </div>
            </div>
        </AppLayout>
    );
}


