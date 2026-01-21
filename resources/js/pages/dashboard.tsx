import { Head } from '@inertiajs/react';
import { EyeOff } from 'lucide-react';

import {
    BalanceCards,
    BalanceTrendChart,
    CategoryDonut,
    RecentTransactions,
    type Transaction,
} from '@/components/dashboard';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Mock data for Phase 1 development
const mockBalanceData = {
    balance: 48250.0,
    balanceChange: 2.4,
    income: 7400.0,
    incomeProgress: 85,
    expenses: 3120.0,
    remainingBudget: 4280.0,
};

const mockTrendData = [
    { month: 'JAN', value: 35000 },
    { month: 'FEB', value: 38000 },
    { month: 'MAR', value: 42000 },
    { month: 'APR', value: 40000 },
    { month: 'MAY', value: 45000 },
    { month: 'JUN', value: 48250 },
];

const mockCategoryData = [
    { name: 'Housing', amount: 1800, color: '#007180' },
    { name: 'Food & Drink', amount: 640, color: '#4db6ac' },
    { name: 'Other', amount: 680, color: '#d1d5db' },
];

const mockTransactions: Transaction[] = [
    {
        id: 1,
        description: 'Apple Store - New MacBook',
        category: 'Shopping',
        amount: 1299.0,
        date: '2 hours ago',
        account: 'Credit Card • **** 4920',
        type: 'expense',
    },
    {
        id: 2,
        description: 'Salary Deposit',
        category: 'Income',
        amount: 5200.0,
        date: 'Yesterday',
        account: 'Savings Account • **** 1102',
        type: 'income',
    },
    {
        id: 3,
        description: 'Blue Bottle Coffee',
        category: 'Food & Drink',
        amount: 12.5,
        date: 'Oct 12, 2023',
        account: 'Debit Card • **** 2291',
        type: 'expense',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Main Dashboard Content */}
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                            Dashboard Overview
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Quietly managing your wealth since last session.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
                            <EyeOff className="size-4" />
                            <span>Privacy Mode</span>
                        </button>
                    </div>
                </div>

                {/* Balance Cards */}
                <BalanceCards {...mockBalanceData} />

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <BalanceTrendChart data={mockTrendData} />
                    </div>
                    <CategoryDonut
                        categories={mockCategoryData}
                        totalSpent={mockBalanceData.expenses}
                    />
                </div>

                {/* Recent Transactions */}
                <RecentTransactions
                    transactions={mockTransactions}
                    onViewAll={() => {
                        // Navigate to transactions page
                        window.location.href = '/transactions';
                    }}
                />
            </div>
        </AppLayout>
    );
}
