import { ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Category {
    name: string;
    amount: number;
    percentage: number;
}

interface CategoryBreakdownProps {
    categories: Category[];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
    return (
        <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between md:mb-8">
                <h3 className="text-lg font-bold text-foreground">
                    Spending by Category
                </h3>
                <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-sm font-bold text-primary"
                >
                    View Transactions
                    <ArrowRight className="size-4" />
                </Link>
            </div>

            <div className="flex flex-col gap-5 md:gap-6">
                {categories.map((category, index) => (
                    <div key={category.name} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span>{category.name}</span>
                            <span>
                                {formatCurrency(category.amount)} ({category.percentage}%)
                            </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${category.percentage}%`,
                                    opacity: 1 - index * 0.15,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
