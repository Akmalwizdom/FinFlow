import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { History, Plus } from 'lucide-react';

import {
    AddTransactionModal,
    QuickAddSheet,
    TransactionFilters,
    TransactionList,
    TransactionStats,
    type Transaction,
} from '@/components/transactions';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

// Mock data for Phase 2 development
const mockStats = {
    totalIn: 5240.0,
    totalOut: 3120.5,
    netFlow: 2119.5,
    avgPerDay: 104.02,
};

// Helper to get date strings
function getDateString(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

const mockTransactions: Transaction[] = [
    {
        id: 1,
        description: 'Blue Bottle Coffee',
        category: 'Food & Drink',
        categoryIcon: 'coffee',
        amount: 5.5,
        type: 'expense',
        date: getDateString(0), // Today
        time: '08:42 AM',
        notes: 'Morning ritual',
    },
    {
        id: 2,
        description: 'Monthly Salary',
        category: 'Income',
        categoryIcon: 'work',
        amount: 4200.0,
        type: 'income',
        date: getDateString(0), // Today
        time: '09:00 AM',
        notes: 'Tech Corp Inc.',
    },
    {
        id: 3,
        description: 'Whole Foods Market',
        category: 'Groceries',
        categoryIcon: 'shopping',
        amount: 142.3,
        type: 'expense',
        date: getDateString(1), // Yesterday
        time: '06:15 PM',
        notes: 'Weekly groceries',
    },
    {
        id: 4,
        description: 'Netflix Subscription',
        category: 'Entertainment',
        categoryIcon: 'subscription',
        amount: 19.99,
        type: 'expense',
        date: getDateString(1), // Yesterday
        time: '12:00 AM',
        notes: 'Monthly premium',
    },
    {
        id: 5,
        description: 'Shell Gas Station',
        category: 'Transport',
        categoryIcon: 'transport',
        amount: 65.0,
        type: 'expense',
        date: getDateString(1), // Yesterday
        time: '08:20 AM',
        notes: 'Fuel refill',
    },
    {
        id: 6,
        description: 'Electricity Bill',
        category: 'Utilities',
        categoryIcon: 'utilities',
        amount: 85.0,
        type: 'expense',
        date: getDateString(2), // 2 days ago
        time: '10:00 AM',
        notes: 'Monthly bill',
    },
];

// Group transactions by date
function groupTransactionsByDate(transactions: Transaction[]) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const groups: { label: string; transactions: Transaction[] }[] = [];
    const groupMap = new Map<string, Transaction[]>();

    transactions.forEach((tx) => {
        const existing = groupMap.get(tx.date) || [];
        existing.push(tx);
        groupMap.set(tx.date, existing);
    });

    groupMap.forEach((txs, date) => {
        let label = date;
        if (date === today) {
            label = `Today, ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else if (date === yesterday) {
            label = `Yesterday, ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else {
            label = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        groups.push({ label, transactions: txs });
    });

    return groups;
}

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('this-month');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const transactionGroups = groupTransactionsByDate(mockTransactions);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />

            <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
                {/* Page Header */}
                <header className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                            Transactions
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Reviewing your financial history from last 30 days.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="hidden gap-2 rounded-xl font-bold shadow-lg shadow-primary/20 md:flex"
                    >
                        <Plus className="size-5" />
                        Quick Add
                    </Button>
                </header>

                {/* Stats & Filters */}
                <div className="sticky top-0 z-10 space-y-4 border-b border-border bg-background/80 py-4 backdrop-blur-md">
                    <TransactionStats {...mockStats} />
                    <TransactionFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        dateFilter={dateFilter}
                        onDateFilterChange={setDateFilter}
                    />
                </div>

                {/* Transaction List */}
                <div className="py-6">
                    <TransactionList groups={transactionGroups} />

                    {/* Load More Button */}
                    <div className="flex justify-center py-6">
                        <button className="flex items-center gap-2 rounded-full border border-border px-8 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary">
                            <History className="size-4" />
                            View Older Transactions
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex items-center justify-between border-t border-border py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        End of transaction history for January
                    </p>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-income">
                        <span className="size-1.5 animate-pulse rounded-full bg-income" />
                        All data encrypted
                    </span>
                </footer>
            </div>

            {/* Desktop Modal */}
            <AddTransactionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={(data) => {
                    console.log('Transaction saved:', data);
                }}
            />

            {/* Mobile Sheet */}
            <QuickAddSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onSave={(data) => {
                    console.log('Transaction saved:', data);
                }}
            />
        </AppLayout>
    );
}
