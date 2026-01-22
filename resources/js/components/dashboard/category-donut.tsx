interface CategoryData {
    name: string;
    amount: number;
    color: string;
}

interface CategoryDonutProps {
    categories: CategoryData[];
    totalSpent: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function CategoryDonut({ categories, totalSpent }: CategoryDonutProps) {
    const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke dash offsets for each segment
    let currentOffset = 0;
    const segments = categories.map((cat) => {
        const percentage = cat.amount / total;
        const dashArray = circumference * percentage;
        const segment = {
            ...cat,
            dashArray,
            dashOffset: circumference - currentOffset,
            percentage: Math.round(percentage * 100),
        };
        currentOffset += dashArray;
        return segment;
    });

    return (
        <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h3 className="mb-6 text-lg font-bold text-foreground">
                Expense Categories
            </h3>

            <div className="relative mx-auto mb-8 flex size-40 items-center justify-center md:size-48">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="hsl(var(--muted))"
                        strokeWidth="12"
                    />
                    {/* Category segments */}
                    {segments.map((seg, index) => (
                        <circle
                            key={`${index}-${seg.name}`}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
                            strokeDashoffset={seg.dashOffset}
                            style={{
                                transition: 'stroke-dashoffset 0.5s ease',
                            }}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-foreground">
                        {formatCurrency(totalSpent)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Spent
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-end space-y-3">
                {categories.map((cat, index) => (
                    <div
                        key={`${index}-${cat.name}`}
                        className="flex items-center justify-between text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="size-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-medium text-foreground">
                                {cat.name}
                            </span>
                        </div>
                        <span className="font-bold">
                            {formatCurrency(cat.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
