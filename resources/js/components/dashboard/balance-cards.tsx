import { TrendingUp } from 'lucide-react';

interface BalanceCardsProps {
    balance: number;
    balanceChange: number;
    income: number;
    incomeProgress: number;
    expenses: number;
    remainingBudget: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function BalanceCards({
    balance,
    balanceChange,
    income,
    incomeProgress,
    expenses,
    remainingBudget,
}: BalanceCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {/* Total Balance Card */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                        Total Balance
                    </span>
                    <span className="flex items-center gap-1 rounded bg-income/10 px-2 py-0.5 text-xs font-bold text-income">
                        <TrendingUp className="size-3" />+{balanceChange}%
                    </span>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                    {formatCurrency(balance)}
                </p>
                <p className="text-xs text-muted-foreground">
                    Across 4 accounts
                </p>
            </div>

            {/* Monthly Income Card */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                        Monthly Income
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        In Target
                    </span>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                    {formatCurrency(income)}
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${incomeProgress}%` }}
                    />
                </div>
            </div>

            {/* Monthly Expenses Card */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                        Monthly Expenses
                    </span>
                    <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                        82% Used
                    </span>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                    {formatCurrency(expenses)}
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatCurrency(remainingBudget)} remaining budget
                </p>
            </div>
        </div>
    );
}
