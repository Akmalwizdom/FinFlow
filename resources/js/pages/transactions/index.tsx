import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { History, Loader2, Plus } from 'lucide-react';

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
import {
    categoriesApi,
    transactionsApi,
    type Category,
    type Transaction as ApiTransaction,
} from '@/lib/api';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
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

    // Sort dates descending
    const sortedDates = Array.from(groupMap.keys()).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach((date) => {
        const txs = groupMap.get(date) || [];
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

// Transform API transaction to component format
function transformTransaction(t: ApiTransaction): Transaction {
    return {
        id: t.id,
        description: t.note || t.category.name,
        category: t.category.name,
        categoryIcon: getCategoryIcon(t.category.name),
        amount: t.amount,
        type: t.type,
        date: t.transaction_date,
        time: new Date(t.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        notes: t.spending_type ? `${t.spending_type.toUpperCase()}` : undefined,
    };
}

function getCategoryIcon(categoryName: string): string {
    const iconMap: Record<string, string> = {
        'Makanan': 'coffee',
        'Transportasi': 'transport',
        'Hiburan': 'subscription',
        'Belanja': 'shopping',
        'Tagihan': 'utilities',
        'Gaji': 'work',
        'Freelance': 'work',
    };
    return iconMap[categoryName] || 'other';
}

export default function TransactionsPage() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState({ totalIn: 0, totalOut: 0, netFlow: 0, avgPerDay: 0 });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('this-month');
    const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const getDateRange = () => {
        const now = new Date();
        if (dateFilter === 'this-month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start_date: start.toISOString().split('T')[0] };
        } else if (dateFilter === 'last-month') {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                start_date: start.toISOString().split('T')[0],
                end_date: end.toISOString().split('T')[0],
            };
        }
        return {};
    };

    const fetchTransactions = async (pageNum: number, append = false) => {
        try {
            const dateRange = getDateRange();
            const response = await transactionsApi.list({
                page: pageNum,
                per_page: 20,
                type: typeFilter,
                category_id: categoryFilter,
                ...dateRange,
            });

            const newTransactions = response.data.data.items.map(transformTransaction);

            // Filter by search query on client side
            const filtered = searchQuery
                ? newTransactions.filter(
                      (t) =>
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : newTransactions;

            if (append) {
                setTransactions((prev) => [...prev, ...filtered]);
            } else {
                setTransactions(filtered);

                // Calculate stats
                const totalIn = response.data.data.items
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const totalOut = response.data.data.items
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                setStats({
                    totalIn,
                    totalOut,
                    netFlow: totalIn - totalOut,
                    avgPerDay: totalOut / 30,
                });
            }

            setHasMore(response.data.data.pagination.current_page < response.data.data.pagination.last_page);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [, categoriesRes] = await Promise.all([
                    fetchTransactions(1),
                    categoriesApi.list(),
                ]);

                setCategories(categoriesRes.data.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Refetch when filters change
    useEffect(() => {
        if (!loading) {
            setPage(1);
            fetchTransactions(1);
        }
    }, [dateFilter, typeFilter, categoryFilter, searchQuery]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTransactions(nextPage, true);
    };

    const handleSaveTransaction = async (data: {
        type: 'income' | 'expense';
        amount: number;
        category_id: number;
        note?: string;
        date: string;
    }) => {
        try {
            await transactionsApi.create({
                category_id: data.category_id,
                type: data.type,
                amount: data.amount,
                note: data.note,
                transaction_date: data.date,
            });

            // Refresh transactions
            await fetchTransactions(1);
            setIsModalOpen(false);
            setIsSheetOpen(false);
        } catch (error) {
            console.error('Failed to save transaction:', error);
            alert('Failed to save transaction. Please try again.');
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Transactions" />
                <div className="flex flex-1 items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    const transactionGroups = groupTransactionsByDate(transactions);
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

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
                    <TransactionStats {...stats} />
                    <TransactionFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        dateFilter={dateFilter}
                        onDateFilterChange={setDateFilter}
                        typeFilter={typeFilter}
                        onTypeFilterChange={setTypeFilter}
                        categories={categories}
                        categoryFilter={categoryFilter}
                        onCategoryFilterChange={setCategoryFilter}
                    />
                </div>

                {/* Transaction List */}
                <div className="py-6">
                    <TransactionList groups={transactionGroups} />

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center py-6">
                            <button
                                onClick={handleLoadMore}
                                className="flex items-center gap-2 rounded-full border border-border px-8 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary"
                            >
                                <History className="size-4" />
                                View Older Transactions
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="flex items-center justify-between border-t border-border py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        End of transaction history for {currentMonth}
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
                categories={categories}
                onSave={handleSaveTransaction}
            />

            {/* Mobile Sheet */}
            <QuickAddSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                categories={categories}
                onSave={handleSaveTransaction}
            />
        </AppLayout>
    );
}

