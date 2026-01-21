import {
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    Wallet,
} from 'lucide-react';

interface TransactionStatsProps {
    totalIn: number;
    totalOut: number;
    netFlow: number;
    avgPerDay: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(Math.abs(amount));
}

export function TransactionStats({
    totalIn,
    totalOut,
    netFlow,
    avgPerDay,
}: TransactionStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1 flex items-center gap-1.5">
                    <ArrowDownLeft className="size-3.5 text-income" />
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Total In
                    </p>
                </div>
                <p className="text-lg font-bold text-income">
                    +{formatCurrency(totalIn)}
                </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1 flex items-center gap-1.5">
                    <ArrowUpRight className="size-3.5 text-expense" />
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Total Out
                    </p>
                </div>
                <p className="text-lg font-bold text-expense">
                    -{formatCurrency(totalOut)}
                </p>
            </div>

            <div className="hidden rounded-lg border border-border bg-card p-3 md:block">
                <div className="mb-1 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-primary" />
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Net Flow
                    </p>
                </div>
                <p className="text-lg font-bold text-primary">
                    {netFlow >= 0 ? '+' : '-'}
                    {formatCurrency(netFlow)}
                </p>
            </div>

            <div className="hidden rounded-lg border border-border bg-card p-3 md:block">
                <div className="mb-1 flex items-center gap-1.5">
                    <Wallet className="size-3.5 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Avg/Day
                    </p>
                </div>
                <p className="text-lg font-bold text-foreground">
                    {formatCurrency(avgPerDay)}
                </p>
            </div>
        </div>
    );
}
