import { AlertTriangle, CheckCircle2, PiggyBank } from 'lucide-react';
import { Link } from '@inertiajs/react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type BudgetSummary } from '@/lib/api';

interface BudgetWidgetProps {
    summary: BudgetSummary | null;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function BudgetWidget({ summary }: BudgetWidgetProps) {
    if (!summary || summary.budget_count === 0) {
        return (
            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <PiggyBank className="size-5 text-primary" />
                        <CardTitle className="text-base">Budget Overview</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No budgets set up yet.
                    </p>
                    <Link
                        href="/budgets"
                        className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                        Create your first budget →
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const progressColor = summary.overall_progress > 100
        ? 'bg-expense'
        : summary.overall_progress > 80
            ? 'bg-warning'
            : 'bg-income';

    return (
        <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PiggyBank className="size-5 text-primary" />
                        <CardTitle className="text-base">Budget Overview</CardTitle>
                    </div>
                    <Link
                        href="/budgets"
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        View All
                    </Link>
                </div>
                <CardDescription>Monthly spending progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div>
                    <div className="mb-2 flex items-end justify-between">
                        <span className="text-2xl font-bold">
                            {formatCurrency(summary.total_spent_amount)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            of {formatCurrency(summary.total_budget_amount)}
                        </span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                        <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all ${progressColor}`}
                            style={{ width: `${Math.min(100, summary.overall_progress)}%` }}
                        />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {summary.overall_progress}% of total budget used
                    </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-income/10 px-2.5 py-1 text-xs font-medium text-income">
                        <CheckCircle2 className="size-3" />
                        {summary.on_track_count} on track
                    </div>
                    {summary.near_limit_count > 0 && (
                        <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                            <AlertTriangle className="size-3" />
                            {summary.near_limit_count} near limit
                        </div>
                    )}
                    {summary.over_budget_count > 0 && (
                        <div className="flex items-center gap-1.5 rounded-full bg-expense/10 px-2.5 py-1 text-xs font-medium text-expense">
                            <AlertTriangle className="size-3" />
                            {summary.over_budget_count} over budget
                        </div>
                    )}
                </div>

                {/* Remaining */}
                <div className="rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Remaining this month</span>
                        <span className={`font-bold ${summary.total_remaining >= 0 ? 'text-income' : 'text-expense'}`}>
                            {formatCurrency(summary.total_remaining)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
