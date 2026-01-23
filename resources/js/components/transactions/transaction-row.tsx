import { ChevronRight, type LucideIcon, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Briefcase,
    Car,
    Coffee,
    CreditCard,
    Film,
    Receipt,
    ShoppingBag,
    Utensils,
    Zap,
} from 'lucide-react';

export interface Transaction {
    id: number;
    description: string;
    category: string;
    categoryIcon?: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    time: string;
    notes?: string;
}

interface TransactionRowProps {
    transaction: Transaction;
    onClick?: (transaction: Transaction) => void;
    onDelete?: (transaction: Transaction) => void;
}

const categoryIcons: Record<string, LucideIcon> = {
    coffee: Coffee,
    work: Briefcase,
    shopping: ShoppingBag,
    food: Utensils,
    transport: Car,
    entertainment: Film,
    utilities: Receipt,
    subscription: Zap,
    default: CreditCard,
};

import { formatRupiah } from '@/lib/utils';

export function TransactionRow({ transaction, onClick, onDelete }: TransactionRowProps) {
    const Icon =
        categoryIcons[transaction.categoryIcon || 'default'] ||
        categoryIcons.default;

    return (
        <div
            onClick={() => onClick?.(transaction)}
            className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-card p-4 transition-all hover:border-border hover:shadow-md"
        >
            <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-foreground">
                        {transaction.description}
                    </h4>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {transaction.notes && <>{transaction.notes} • </>}
                        {transaction.category}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p
                        className={`text-sm font-bold ${
                            transaction.type === 'income'
                                ? 'text-income'
                                : 'text-expense'
                        }`}
                    >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatRupiah(transaction.amount)}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                        {transaction.time}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(transaction);
                            }}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
