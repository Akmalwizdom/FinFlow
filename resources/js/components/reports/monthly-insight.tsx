import { Lightbulb } from 'lucide-react';

interface MonthlyInsightProps {
    text: string;
    highlightedText?: string;
    savings?: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function MonthlyInsight({ text, highlightedText, savings }: MonthlyInsightProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-yellow-50 p-2 dark:bg-yellow-900/20">
                    <Lightbulb className="size-5 text-yellow-600" />
                </div>
                <h3 className="font-bold text-foreground">Monthly Insight</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
                {text}
                {highlightedText && (
                    <span className="font-bold text-foreground"> {highlightedText}</span>
                )}
                {savings && (
                    <>
                        {' '}
                        This saved you approximately{' '}
                        <span className="font-bold text-primary">
                            {formatCurrency(savings)}
                        </span>{' '}
                        which was diverted to your savings goal.
                    </>
                )}
            </p>
        </div>
    );
}
