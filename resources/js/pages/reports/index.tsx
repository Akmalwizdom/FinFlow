import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Loader2, Lock } from 'lucide-react';

import {
    CategoryBreakdown,
    MonthlyInsight,
    MonthSelector,
    QuickActions,
    ReportStats,
} from '@/components/reports';
import AppLayout from '@/layouts/app-layout';
import { reportsApi, insightsApi, type MonthlyReport, type InsightsData } from '@/lib/api';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
];

// Generate month options
function getMonthOptions() {
    const months: { value: string; label: string }[] = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        months.push({ value, label });
    }

    return months;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<MonthlyReport | null>(null);
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [monthIndex, setMonthIndex] = useState(0);

    const months = getMonthOptions();
    const currentMonth = months[monthIndex];

    const fetchReport = async (month: string) => {
        try {
            setLoading(true);
            const [reportRes, insightsRes] = await Promise.all([
                reportsApi.monthly(month),
                insightsApi.get(month),
            ]);

            setReport(reportRes.data.data);
            setInsights(insightsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(currentMonth.value);
    }, [currentMonth.value]);

    const handlePrevious = () => {
        if (monthIndex < months.length - 1) {
            setMonthIndex(monthIndex + 1);
        }
    };

    const handleNext = () => {
        if (monthIndex > 0) {
            setMonthIndex(monthIndex - 1);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Reports" />
                <div className="flex flex-1 items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    // Transform data for components
    const reportData = {
        income: {
            total: report?.total_income ?? 0,
            change: report?.comparison_with_previous.income_change ?? 0,
        },
        expenses: {
            total: report?.total_expense ?? 0,
            change: report?.comparison_with_previous.expense_change ?? 0,
        },
        balance: report?.remaining_balance ?? 0,
        categories: report?.top_categories.map((cat) => ({
            name: cat.category,
            amount: cat.amount,
            percentage: 0, // Calculate percentage
        })) ?? [],
    };

    // Calculate percentages for categories
    const totalExpense = reportData.categories.reduce((sum, c) => sum + c.amount, 0);
    reportData.categories = reportData.categories.map((c) => ({
        ...c,
        percentage: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0,
    }));

    // Get first insight for display
    const firstInsight = insights?.insights[0];
    const insightText = firstInsight?.description ?? 'No insights available for this month.';
    const savings = Math.abs(report?.comparison_with_previous.expense_change ?? 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
                {/* Page Header */}
                <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                            Monthly Report
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Your financial footprint at a glance
                        </p>
                    </div>
                    <MonthSelector
                        currentMonth={currentMonth.label}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        canGoNext={monthIndex > 0}
                    />
                </div>

                {/* Stats Summary Cards */}
                <div className="mb-8">
                    <ReportStats
                        income={reportData.income}
                        expenses={reportData.expenses}
                        balance={reportData.balance}
                    />
                </div>

                {/* Insights Section */}
                <div className="mb-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
                    {/* Category Chart Area */}
                    <div className="lg:col-span-3">
                        <CategoryBreakdown categories={reportData.categories} />
                    </div>

                    {/* Sidebar: Insight + Quick Actions */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <MonthlyInsight
                            text="Insight:"
                            highlightedText={insightText}
                            savings={savings}
                        />
                        <QuickActions />
                    </div>
                </div>

                {/* Privacy Footer */}
                <div className="flex items-center justify-center gap-2 border-t border-border py-6 text-xs text-muted-foreground">
                    <Lock className="size-4" />
                    Your financial data is encrypted and private. We never share your
                    personal information.
                </div>
            </div>
        </AppLayout>
    );
}

