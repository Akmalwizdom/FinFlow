import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Building2,
    CreditCard,
    Loader2,
    Pencil,
    Plus,
    Smartphone,
    Trash2,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { accountsApi, type Account } from '@/lib/api';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: '/accounts',
    },
];

const ACCOUNT_TYPES = {
    bank: { label: 'Bank', icon: Building2, color: '#3B82F6' },
    ewallet: { label: 'E-Wallet', icon: Smartphone, color: '#10B981' },
    cash: { label: 'Cash', icon: Wallet, color: '#F59E0B' },
    investment: { label: 'Investment', icon: TrendingUp, color: '#8B5CF6' },
    credit_card: { label: 'Credit Card', icon: CreditCard, color: '#EF4444' },
    other: { label: 'Other', icon: Wallet, color: '#6B7280' },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

interface AccountFormData {
    name: string;
    type: Account['type'];
    initial_balance: string;
    color: string;
}

export default function AccountsPage() {
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
    const [formData, setFormData] = useState<AccountFormData>({
        name: '',
        type: 'bank',
        initial_balance: '0',
        color: '#3B82F6',
    });
    const [saving, setSaving] = useState(false);

    const fetchAccounts = async () => {
        try {
            const response = await accountsApi.list();
            setAccounts(response.data.data.items);
            setTotalBalance(response.data.data.total_balance);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleOpenModal = (account?: Account) => {
        if (account) {
            setEditingAccount(account);
            setFormData({
                name: account.name,
                type: account.type,
                initial_balance: String(account.initial_balance),
                color: account.color || ACCOUNT_TYPES[account.type].color,
            });
        } else {
            setEditingAccount(null);
            setFormData({
                name: '',
                type: 'bank',
                initial_balance: '0',
                color: '#3B82F6',
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = {
                name: formData.name,
                type: formData.type,
                initial_balance: parseFloat(formData.initial_balance) || 0,
                color: formData.color,
            };

            if (editingAccount) {
                await accountsApi.update(editingAccount.id, data);
            } else {
                await accountsApi.create(data);
            }

            await fetchAccounts();
            setIsModalOpen(false);
            toast.success(editingAccount ? 'Account updated successfully' : 'Account created successfully');
        } catch (error) {
            console.error('Failed to save account:', error);
            toast.error('Failed to save account. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (account: Account) => {
        setAccountToDelete(account);
    };

    const confirmDelete = async () => {
        if (!accountToDelete) return;

        try {
            await accountsApi.delete(accountToDelete.id);
            await fetchAccounts();
            toast.success('Account deleted successfully');
            setAccountToDelete(null);
        } catch (error: any) {
            const message = error.response?.data?.error?.message || 'Failed to delete account.';
            console.error('Failed to delete account:', error);
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Accounts" />
                <div className="flex flex-1 items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />

            <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
                {/* Page Header */}
                <header className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                            Accounts
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your bank accounts, e-wallets, and cash.
                        </p>
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                        <Plus className="size-5" />
                        Add Account
                    </Button>
                </header>

                {/* Total Balance Card */}
                <div className="mt-6">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-primary/70 font-medium">
                                Total Balance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-black text-primary">
                                {formatCurrency(totalBalance)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Accounts Grid */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {accounts.map((account) => {
                        const typeConfig = ACCOUNT_TYPES[account.type] || ACCOUNT_TYPES.other;
                        const Icon = typeConfig.icon;

                        return (
                            <Card key={account.id} className="group relative overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 w-1"
                                    style={{ backgroundColor: account.color || typeConfig.color }}
                                />
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex size-10 items-center justify-center rounded-xl"
                                                style={{ backgroundColor: `${account.color || typeConfig.color}20` }}
                                            >
                                                <Icon
                                                    className="size-5"
                                                    style={{ color: account.color || typeConfig.color }}
                                                />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold">
                                                    {account.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {account.type_label}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => handleOpenModal(account)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(account)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className={`text-xl font-bold ${account.current_balance >= 0 ? 'text-foreground' : 'text-expense'}`}>
                                        {formatCurrency(account.current_balance)}
                                    </p>
                                    {account.transaction_count !== undefined && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {account.transaction_count} transaction{account.transaction_count !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {accounts.length === 0 && (
                    <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center">
                        <Wallet className="size-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-bold text-foreground">
                            No accounts yet
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add your first account to start tracking your balances.
                        </p>
                        <Button onClick={() => handleOpenModal()} className="mt-4 gap-2">
                            <Plus className="size-4" />
                            Add Account
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAccount ? 'Edit Account' : 'Add New Account'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAccount
                                ? 'Update your account details.'
                                : 'Add a new account to track your balance.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Account Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. BCA Checking"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Account Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: Account['type']) => {
                                    setFormData({
                                        ...formData,
                                        type: value,
                                        color: ACCOUNT_TYPES[value].color,
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ACCOUNT_TYPES).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                                <config.icon className="size-4" />
                                                {config.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="initial_balance">
                                {editingAccount ? 'Initial Balance' : 'Current Balance'}
                            </Label>
                            <Input
                                id="initial_balance"
                                type="number"
                                value={formData.initial_balance}
                                onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="color">Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="h-10 w-14 cursor-pointer p-1"
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : editingAccount ? (
                                'Update Account'
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the account "{accountToDelete?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
