import { TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BalanceCardsProps {
    balance: number;
    balanceChange: number;
    income: number;
    incomeProgress: number;
    expenses: number;
    remainingBudget: number;
}

import { formatRupiah } from '@/lib/utils';

// Animated number component for counting effect
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
    const [displayValue, setDisplayValue] = useState(0);
    const startTime = useRef<number | null>(null);
    const animationFrame = useRef<number | null>(null);

    useEffect(() => {
        startTime.current = null;
        
        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(value * easeOut);
            
            if (progress < 1) {
                animationFrame.current = requestAnimationFrame(animate);
            }
        };
        
        animationFrame.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, [value, duration]);

    return <>{formatRupiah(displayValue)}</>;
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
            <div className="card-hover-lift animate-fade-in-up stagger-1 flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                        Total Balance
                    </span>
                    <span className="flex items-center gap-1 rounded bg-income/10 px-2 py-0.5 text-xs font-bold text-income">
                        <TrendingUp className="size-3" />+{balanceChange}%
                    </span>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                    <AnimatedNumber value={balance} duration={1200} />
                </p>
                <p className="text-xs text-muted-foreground">
                    Across 4 accounts
                </p>
            </div>

            {/* Monthly Income Card */}
            <div className="card-hover-lift animate-fade-in-up stagger-2 flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                        Monthly Income
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        In Target
                    </span>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                    <AnimatedNumber value={income} duration={1200} />
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${incomeProgress}%` }}
                    />
                </div>
            </div>

            {/* Monthly Expenses Card */}
            <div className="card-hover-lift animate-fade-in-up stagger-3 flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                        Monthly Expenses
                    </span>
                    <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                        82% Used
                    </span>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                    <AnimatedNumber value={expenses} duration={1200} />
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatRupiah(remainingBudget)} remaining budget
                </p>
            </div>
        </div>
    );
}
