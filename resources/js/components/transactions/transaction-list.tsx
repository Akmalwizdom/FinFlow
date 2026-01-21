import { TransactionRow, type Transaction } from './transaction-row';

interface TransactionGroup {
    label: string;
    transactions: Transaction[];
}

interface TransactionListProps {
    groups: TransactionGroup[];
    onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionList({
    groups,
    onTransactionClick,
}: TransactionListProps) {
    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <section key={group.label}>
                    {/* Sticky Date Header */}
                    <div className="sticky top-0 z-[5] flex items-center gap-4 bg-background py-2">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            {group.label}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Transaction Items */}
                    <div className="mt-3 flex flex-col gap-2">
                        {group.transactions.map((transaction) => (
                            <TransactionRow
                                key={transaction.id}
                                transaction={transaction}
                                onClick={onTransactionClick}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
