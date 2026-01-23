import {
    Coffee,
    CreditCard,
    DollarSign,
    ShoppingBag,
    Utensils,
} from 'lucide-react';

import { formatRupiah } from '@/lib/utils';

export interface Transaction {
    id: number;
    description: string;
    category: string;
    categoryIcon?: string;
    amount: number;
    date: string;
    account?: string;
    type: 'income' | 'expense';
}

interface RecentTransactionsProps {
    transactions: Transaction[];
    onViewAll?: () => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Shopping: ShoppingBag,
    Income: DollarSign,
    'Food & Drink': Utensils,
    Coffee: Coffee,
    default: CreditCard,
};

function getCategoryIcon(category: string) {
    return categoryIcons[category] || categoryIcons.default;
}

export function RecentTransactions({
    transactions,
    onViewAll,
}: RecentTransactionsProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-6 py-5 md:px-8 md:py-6">
                <h3 className="text-lg font-bold text-foreground">
                    Recent Transactions
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-sm font-bold text-primary hover:underline"
                >
                    View All
                </button>
            </div>
            <div className="divide-y divide-border">
                {transactions.map((tx) => {
                    const Icon = getCategoryIcon(tx.category);
                    return (
                        <div
                            key={tx.id}
                            className="flex items-center px-6 py-4 transition-colors hover:bg-muted/50 md:px-8"
                        >
                            <div className="mr-4 flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                                <Icon className="size-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-foreground">
                                    {tx.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {tx.category} • {tx.date}
                                </p>
                            </div>
                            <div className="text-right">
                                <p
                                    className={`text-sm font-bold ${
                                        tx.type === 'income'
                                            ? 'text-income'
                                            : 'text-expense'
                                    }`}
                                >
                                    {tx.type === 'income' ? '+' : '-'}{' '}
                                    {formatRupiah(Math.abs(tx.amount))}
                                </p>
                                {tx.account && (
                                    <p className="text-[10px] font-medium text-muted-foreground">
                                        {tx.account}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
