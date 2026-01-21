import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Lock } from 'lucide-react';

import {
    CategoryBreakdown,
    MonthlyInsight,
    MonthSelector,
    QuickActions,
    ReportStats,
} from '@/components/reports';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
];

// Mock data for Phase 3 development
const mockReportData = {
    income: { total: 5200, change: 5 },
    expenses: { total: 3450, change: -2 },
    balance: 1750,
    categories: [
        { name: 'Housing & Rent', amount: 1200, percentage: 35 },
        { name: 'Food & Groceries', amount: 850, percentage: 25 },
        { name: 'Entertainment', amount: 450, percentage: 13 },
        { name: 'Transport', amount: 400, percentage: 11 },
        { name: 'Other Utilities', amount: 550, percentage: 16 },
    ],
};

const months = [
    'January 2026',
    'December 2025',
    'November 2025',
    'October 2025',
];

export default function ReportsPage() {
    const [monthIndex, setMonthIndex] = useState(0);

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
                        currentMonth={months[monthIndex]}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        canGoNext={monthIndex > 0}
                    />
                </div>

                {/* Stats Summary Cards */}
                <div className="mb-8">
                    <ReportStats
                        income={mockReportData.income}
                        expenses={mockReportData.expenses}
                        balance={mockReportData.balance}
                    />
                </div>

                {/* Insights Section */}
                <div className="mb-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
                    {/* Category Chart Area */}
                    <div className="lg:col-span-3">
                        <CategoryBreakdown categories={mockReportData.categories} />
                    </div>

                    {/* Sidebar: Insight + Quick Actions */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <MonthlyInsight
                            text="You spent"
                            highlightedText="12% less on dining out this month compared to your 6-month average."
                            savings={120}
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
