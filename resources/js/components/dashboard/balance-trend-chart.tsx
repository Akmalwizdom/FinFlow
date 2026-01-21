interface BalanceTrendData {
    month: string;
    value: number;
}

interface BalanceTrendChartProps {
    data: BalanceTrendData[];
    period?: '6M' | '1Y' | 'ALL';
    onPeriodChange?: (period: '6M' | '1Y' | 'ALL') => void;
}

export function BalanceTrendChart({
    data,
    period = '6M',
    onPeriodChange,
}: BalanceTrendChartProps) {
    // Calculate path for SVG
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 478;
        const y = 150 - ((d.value - minValue) / range) * 140 - 5;
        return { x, y };
    });

    const pathD = points
        .map((p, i) => {
            if (i === 0) return `M${p.x} ${p.y}`;
            // Create smooth curves
            const prev = points[i - 1];
            const cpX = (prev.x + p.x) / 2;
            return `C${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
        })
        .join(' ');

    const areaD = `${pathD} L${points[points.length - 1].x} 150 L0 150 Z`;

    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between md:mb-8">
                <div>
                    <h3 className="text-lg font-bold text-foreground">
                        Balance Trend
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Historical growth over 6 months
                    </p>
                </div>
                <div className="flex gap-2">
                    {(['6M', '1Y', 'ALL'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange?.(p)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                period === p
                                    ? 'bg-secondary font-bold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <div className="relative h-48 md:h-64">
                <svg
                    className="h-full w-full"
                    viewBox="0 0 478 150"
                    preserveAspectRatio="none"
                    fill="none"
                >
                    <defs>
                        <linearGradient
                            id="trendGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="150"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop
                                offset="0%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity="0.15"
                            />
                            <stop
                                offset="100%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#trendGradient)" />
                    <path
                        d={pathD}
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>
            </div>
            <div className="mt-4 flex justify-between">
                {data.map((d) => (
                    <span
                        key={d.month}
                        className="text-[11px] font-bold text-muted-foreground"
                    >
                        {d.month}
                    </span>
                ))}
            </div>
        </div>
    );
}
