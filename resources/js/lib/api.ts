import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

// Types
export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color: string | null;
    is_default: boolean;
    transaction_count?: number;
}

export interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    note: string | null;
    transaction_date: string;
    spending_type: 'need' | 'want' | null;
    category: Category;
    account_id?: number;
    created_at: string;
}

export interface Account {
    id: number;
    name: string;
    type: 'bank' | 'ewallet' | 'cash' | 'investment' | 'credit_card' | 'other';
    type_label: string;
    initial_balance: number;
    current_balance: number;
    currency: string;
    icon: string | null;
    color: string | null;
    is_active: boolean;
    transaction_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Budget {
    id: number;
    name: string;
    amount: number;
    spent_amount: number;
    remaining_amount: number;
    progress_percentage: number;
    period: 'weekly' | 'monthly' | 'yearly';
    period_label: string;
    start_date: string;
    end_date: string | null;
    alert_threshold: number;
    is_over_threshold: boolean;
    is_exceeded: boolean;
    days_remaining: number;
    is_active: boolean;
    category?: {
        id: number;
        name: string;
        color: string | null;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface BudgetSummary {
    total_budget_amount: number;
    total_spent_amount: number;
    total_remaining: number;
    overall_progress: number;
    budget_count: number;
    over_budget_count: number;
    near_limit_count: number;
    on_track_count: number;
}

export interface DashboardSummary {
    current_balance: number;
    monthly_summary: {
        month: string;
        total_income: number;
        total_expense: number;
        remaining: number;
    };
    need_want_ratio: {
        need: number;
        want: number;
        need_amount: number;
        want_amount: number;
    };
    expense_by_category: {
        category: string;
        color: string;
        amount: number;
        percentage: number;
    }[];
}

export interface MonthlyReport {
    month: string;
    total_income: number;
    total_expense: number;
    remaining_balance: number;
    need_want_ratio: {
        need_percentage: number;
        want_percentage: number;
    };
    comparison_with_previous: {
        income_change: number;
        expense_change: number;
        want_change: number;
    };
    top_categories: {
        category: string;
        amount: number;
    }[];
    daily_breakdown: {
        date: string;
        income: number;
        expense: number;
    }[];
}

export interface Insight {
    type: string;
    title: string;
    description: string;
    trend?: 'up' | 'down';
    value?: number;
    category?: string;
    amount?: number;
}

export interface InsightsData {
    insights: Insight[];
    weekly_reflection: {
        week: string;
        total_transactions: number;
        want_transactions: number;
        message: string;
    };
}

export interface Forecast {
    current_balance: number;
    average_daily_expense: number;
    estimated_end_of_month_balance: number;
    safe_days_remaining: number;
    projection: {
        date: string;
        projected_balance: number;
    }[];
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Dashboard API
export const dashboardApi = {
    getSummary: () => api.get<ApiResponse<DashboardSummary>>('/dashboard'),
};

// Transactions API
export const transactionsApi = {
    list: (params?: {
        page?: number;
        per_page?: number;
        type?: 'income' | 'expense';
        category_id?: number;
        account_id?: number;
        spending_type?: 'need' | 'want';
        start_date?: string;
        end_date?: string;
        month?: string;
    }) => api.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', { params }),

    get: (id: number) => api.get<ApiResponse<Transaction>>(`/transactions/${id}`),

    create: (data: {
        category_id: number;
        account_id?: number;
        type: 'income' | 'expense';
        amount: number;
        note?: string;
        transaction_date: string;
        spending_type?: 'need' | 'want';
    }) => api.post<ApiResponse<Transaction>>('/transactions', data),

    update: (id: number, data: Partial<{
        category_id: number;
        account_id: number;
        type: 'income' | 'expense';
        amount: number;
        note: string;
        transaction_date: string;
        spending_type: 'need' | 'want';
    }>) => api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data),

    delete: (id: number) => api.delete<ApiResponse<null>>(`/transactions/${id}`),
};

// Categories API
export const categoriesApi = {
    list: (params?: { type?: 'income' | 'expense' }) =>
        api.get<ApiResponse<Category[]>>('/categories', { params }),

    get: (id: number) => api.get<ApiResponse<Category>>(`/categories/${id}`),

    create: (data: { name: string; type: 'income' | 'expense'; color?: string }) =>
        api.post<ApiResponse<Category>>('/categories', data),

    update: (id: number, data: Partial<{ name: string; color: string }>) =>
        api.put<ApiResponse<Category>>(`/categories/${id}`, data),

    delete: (id: number) => api.delete<ApiResponse<null>>(`/categories/${id}`),
};

// Accounts API
export const accountsApi = {
    list: () => api.get<ApiResponse<{ items: Account[]; total_balance: number }>>('/accounts'),

    get: (id: number) => api.get<ApiResponse<Account>>(`/accounts/${id}`),

    create: (data: {
        name: string;
        type: Account['type'];
        initial_balance?: number;
        currency?: string;
        icon?: string;
        color?: string;
        is_active?: boolean;
    }) => api.post<ApiResponse<Account>>('/accounts', data),

    update: (id: number, data: Partial<{
        name: string;
        type: Account['type'];
        initial_balance: number;
        currency: string;
        icon: string;
        color: string;
        is_active: boolean;
    }>) => api.put<ApiResponse<Account>>(`/accounts/${id}`, data),

    delete: (id: number) => api.delete<ApiResponse<null>>(`/accounts/${id}`),

    transfer: (data: {
        from_account_id: number;
        to_account_id: number;
        amount: number;
        note?: string;
        transaction_date?: string;
    }) => api.post<ApiResponse<{
        expense_transaction: Transaction;
        income_transaction: Transaction;
        from_account_new_balance: number;
        to_account_new_balance: number;
    }>>('/accounts/transfer', data),
};

// Budgets API
export const budgetsApi = {
    list: () => api.get<ApiResponse<{ items: Budget[]; summary: BudgetSummary }>>('/budgets'),

    get: (id: number) => api.get<ApiResponse<Budget>>(`/budgets/${id}`),

    create: (data: {
        name: string;
        amount: number;
        period: Budget['period'];
        start_date: string;
        category_id?: number;
        end_date?: string;
        alert_threshold?: number;
        is_active?: boolean;
    }) => api.post<ApiResponse<Budget>>('/budgets', data),

    update: (id: number, data: Partial<{
        name: string;
        amount: number;
        category_id: number;
        period: Budget['period'];
        start_date: string;
        end_date: string;
        alert_threshold: number;
        is_active: boolean;
    }>) => api.put<ApiResponse<Budget>>(`/budgets/${id}`, data),

    delete: (id: number) => api.delete<ApiResponse<null>>(`/budgets/${id}`),

    summary: () => api.get<ApiResponse<BudgetSummary>>('/budgets/summary'),
};

// Reports API
export interface BalanceHistoryItem {
    month: string;
    month_key: string;
    value: number;
}

export const reportsApi = {
    monthly: (month: string) =>
        api.get<ApiResponse<MonthlyReport>>('/reports/monthly', { params: { month } }),

    balanceHistory: (months = 6) =>
        api.get<ApiResponse<BalanceHistoryItem[]>>('/reports/balance-history', { params: { months } }),
};

// Insights API
export const insightsApi = {
    get: (month?: string) =>
        api.get<ApiResponse<InsightsData>>('/insights', { params: { month } }),
};

// Forecast API
export const forecastApi = {
    get: () => api.get<ApiResponse<Forecast>>('/forecast'),
};

// Export API
export const exportApi = {
    all: () => window.open('/api/v1/export/all', '_blank'),
    monthly: (month: string) => window.open(`/api/v1/export/monthly?month=${month}`, '_blank'),
    category: (categoryId: number) => window.open(`/api/v1/export/category/${categoryId}`, '_blank'),
};

// Settings API
export const settingsApi = {
    get: () => api.get<ApiResponse<{ id: number; name: string; email: string; currency: string }>>('/settings'),

    update: (data: { name?: string; currency?: string }) =>
        api.put<ApiResponse<{ id: number; name: string; email: string; currency: string }>>('/settings', data),

    changePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
        api.put<ApiResponse<null>>('/settings/password', data),

    deleteAccount: (data: { password: string; confirm: boolean }) =>
        api.delete<ApiResponse<null>>('/settings/account', { data }),
};

export default api;

