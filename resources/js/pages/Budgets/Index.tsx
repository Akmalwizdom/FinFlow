import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Pencil,
    PieChart,
    Plus,
    Target,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { budgetsApi, categoriesApi, type Budget, type BudgetSummary, type Category } from '@/lib/api';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Budgets',
        href: '/budgets',
    },
];

const PERIODS = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

interface BudgetFormData {
    name: string;
    amount: string;
    category_id: string;
    period: Budget['period'];
    alert_threshold: string;
}

export default function BudgetsPage() {
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [formData, setFormData] = useState<BudgetFormData>({
        name: '',
        amount: '',
        category_id: '',
        period: 'monthly',
        alert_threshold: '80',
    });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [budgetsRes, categoriesRes] = await Promise.all([
                budgetsApi.list(),
                categoriesApi.list({ type: 'expense' }),
            ]);
            setBudgets(budgetsRes.data.data.items);
            setSummary(budgetsRes.data.data.summary);
            setCategories(categoriesRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (budget?: Budget) => {
        if (budget) {
            setEditingBudget(budget);
            setFormData({
                name: budget.name,
                amount: String(budget.amount),
                category_id: budget.category?.id ? String(budget.category.id) : '',
                period: budget.period,
                alert_threshold: String(budget.alert_threshold),
            });
        } else {
            setEditingBudget(null);
            setFormData({
                name: '',
                amount: '',
                category_id: '',
                period: 'monthly',
                alert_threshold: '80',
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const now = new Date();
            const data = {
                name: formData.name,
                amount: parseFloat(formData.amount) || 0,
                category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
                period: formData.period,
                alert_threshold: parseInt(formData.alert_threshold) || 80,
                start_date: now.toISOString().split('T')[0],
            };

            if (editingBudget) {
                await budgetsApi.update(editingBudget.id, data);
            } else {
                await budgetsApi.create(data);
            }

            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save budget:', error);
            alert('Failed to save budget. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (budget: Budget) => {
        if (!confirm(`Are you sure you want to delete "${budget.name}"?`)) {
            return;
        }

        try {
            await budgetsApi.delete(budget.id);
            await fetchData();
        } catch (error) {
            alert('Failed to delete budget.');
        }
    };

    const getStatusColor = (budget: Budget) => {
        if (budget.is_exceeded) return 'text-expense';
        if (budget.is_over_threshold) return 'text-amber-500';
        return 'text-income';
    };

    const getProgressColor = (budget: Budget) => {
        if (budget.is_exceeded) return 'bg-expense';
        if (budget.is_over_threshold) return 'bg-amber-500';
        return 'bg-income';
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Budgets" />
                <div className="flex flex-1 items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Budgets" />

            <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
                {/* Page Header */}
                <header className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                            Budgets
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set spending limits and track your progress.
                        </p>
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                        <Plus className="size-5" />
                        Create Budget
                    </Button>
                </header>

                {/* Summary Cards */}
                {summary && (
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Budget</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(summary.total_budget_amount)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Spent</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-expense">
                                    {formatCurrency(summary.total_spent_amount)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Remaining</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-income">
                                    {formatCurrency(summary.total_remaining)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Overall Progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {summary.overall_progress}%
                                </p>
                                <Progress value={summary.overall_progress} className="mt-2 h-2" />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Status Summary */}
                {summary && summary.budget_count > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 rounded-full bg-income/10 px-3 py-1.5 text-sm font-medium text-income">
                            <CheckCircle2 className="size-4" />
                            {summary.on_track_count} on track
                        </div>
                        {summary.near_limit_count > 0 && (
                            <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-500">
                                <AlertTriangle className="size-4" />
                                {summary.near_limit_count} near limit
                            </div>
                        )}
                        {summary.over_budget_count > 0 && (
                            <div className="flex items-center gap-2 rounded-full bg-expense/10 px-3 py-1.5 text-sm font-medium text-expense">
                                <AlertTriangle className="size-4" />
                                {summary.over_budget_count} over budget
                            </div>
                        )}
                    </div>
                )}

                {/* Budgets List */}
                <div className="mt-6 space-y-4">
                    {budgets.map((budget) => (
                        <Card key={budget.id} className="group relative overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 w-1"
                                style={{ backgroundColor: budget.category?.color || '#6B7280' }}
                            />
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex size-10 items-center justify-center rounded-xl"
                                            style={{ backgroundColor: `${budget.category?.color || '#6B7280'}20` }}
                                        >
                                            <Target
                                                className="size-5"
                                                style={{ color: budget.category?.color || '#6B7280' }}
                                            />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold">
                                                {budget.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {budget.category?.name || 'All Categories'} • {budget.period_label}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {budget.is_exceeded && (
                                            <span className="rounded-full bg-expense/10 px-2 py-0.5 text-xs font-bold text-expense">
                                                Over Budget!
                                            </span>
                                        )}
                                        {budget.is_over_threshold && !budget.is_exceeded && (
                                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-500">
                                                Near Limit
                                            </span>
                                        )}
                                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => handleOpenModal(budget)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(budget)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className={`text-xl font-bold ${getStatusColor(budget)}`}>
                                            {formatCurrency(budget.spent_amount)}
                                        </span>
                                        <span className="text-muted-foreground"> / {formatCurrency(budget.amount)}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${getStatusColor(budget)}`}>
                                        {budget.progress_percentage}%
                                    </span>
                                </div>
                                <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full transition-all ${getProgressColor(budget)}`}
                                        style={{ width: `${Math.min(100, budget.progress_percentage)}%` }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                    <span>{formatCurrency(budget.remaining_amount)} remaining</span>
                                    <span>{budget.days_remaining} days left</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {budgets.length === 0 && (
                    <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center">
                        <PieChart className="size-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-bold text-foreground">
                            No budgets yet
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create your first budget to start tracking spending limits.
                        </p>
                        <Button onClick={() => handleOpenModal()} className="mt-4 gap-2">
                            <Plus className="size-4" />
                            Create Budget
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBudget
                                ? 'Update your budget settings.'
                                : 'Set a spending limit for a category.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Budget Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Monthly Food Budget"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Budget Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="1000000"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category (Optional)</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All expense categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="period">Period</Label>
                            <Select
                                value={formData.period}
                                onValueChange={(value: Budget['period']) => setFormData({ ...formData, period: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PERIODS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="alert_threshold">Alert at (%)</Label>
                            <Input
                                id="alert_threshold"
                                type="number"
                                min="1"
                                max="100"
                                value={formData.alert_threshold}
                                onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                                placeholder="80"
                            />
                            <p className="text-xs text-muted-foreground">
                                You'll see a warning when spending reaches this percentage.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name || !formData.amount}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : editingBudget ? (
                                'Update Budget'
                            ) : (
                                'Create Budget'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
