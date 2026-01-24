import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface ReportStatsProps {
    income: { total: number; change: number };
    expenses: { total: number; change: number };
    balance: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function ReportStats({ income, expenses, balance }: ReportStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {/* Income Card */}
            <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-income/50">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Income
                    </p>
                    <span className="rounded-lg bg-income/10 p-1.5 text-income">
                        <TrendingUp className="size-5" />
                    </span>
                </div>
                <div className="flex flex-col">
                    <p className="text-3xl font-extrabold text-foreground">
                        {formatCurrency(income.total)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-medium text-income">
                        <TrendingUp className="size-3" />
                        {income.change >= 0 ? '+' : ''}
                        {income.change}% vs last month
                    </p>
                </div>
            </div>

            {/* Expenses Card */}
            <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-expense/50">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Expenses
                    </p>
                    <span className="rounded-lg bg-expense/10 p-1.5 text-expense">
                        <TrendingDown className="size-5" />
                    </span>
                </div>
                <div className="flex flex-col">
                    <p className="text-3xl font-extrabold text-foreground">
                        {formatCurrency(expenses.total)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-medium text-expense">
                        <TrendingDown className="size-3" />
                        {expenses.change}% vs last month
                    </p>
                </div>
            </div>

            {/* Balance Card */}
            <div className="flex flex-col gap-4 rounded-xl border border-primary bg-primary p-6 text-white shadow-lg shadow-primary/10">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                        Remaining Balance
                    </p>
                    <span className="rounded-lg bg-white/20 p-1.5">
                        <Wallet className="size-5" />
                    </span>
                </div>
                <div className="flex flex-col">
                    <p className="text-3xl font-extrabold">{formatCurrency(balance)}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">
                        Available to save or invest
                    </p>
                </div>
            </div>
        </div>
    );
}
