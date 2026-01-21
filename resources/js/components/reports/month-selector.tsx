import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
    currentMonth: string;
    onPrevious: () => void;
    onNext: () => void;
    canGoNext?: boolean;
}

export function MonthSelector({
    currentMonth,
    onPrevious,
    onNext,
    canGoNext = false,
}: MonthSelectorProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-2">
            <button
                onClick={onPrevious}
                className="rounded-lg p-1.5 transition-colors hover:bg-secondary"
            >
                <ChevronLeft className="size-5" />
            </button>
            <div className="flex min-w-40 flex-col text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Selected Period
                </span>
                <span className="text-base font-bold text-foreground">
                    {currentMonth}
                </span>
            </div>
            <button
                onClick={onNext}
                disabled={!canGoNext}
                className={`rounded-lg p-1.5 transition-colors ${
                    canGoNext
                        ? 'hover:bg-secondary'
                        : 'cursor-not-allowed opacity-50'
                }`}
            >
                <ChevronRight className="size-5" />
            </button>
        </div>
    );
}
