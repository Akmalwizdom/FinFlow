import { useState, useMemo, useEffect } from 'react';
import { Building2, Check, ChevronDown, CreditCard, Lock, Notebook, Smartphone, Tag, TrendingUp, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type Category, type Account, accountsApi } from '@/lib/api';

interface AddTransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    accounts?: Account[];
    onSave?: (transaction: TransactionFormData) => void;
}

export interface TransactionFormData {
    type: 'expense' | 'income';
    amount: number;
    category_id: number;
    account_id?: number;
    note?: string;
    date: string;
}

const ACCOUNT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    bank: Building2,
    ewallet: Smartphone,
    cash: Wallet,
    investment: TrendingUp,
    credit_card: CreditCard,
    other: Wallet,
};

export function AddTransactionModal({
    open,
    onOpenChange,
    categories,
    accounts: propAccounts,
    onSave,
}: AddTransactionModalProps) {
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [accountId, setAccountId] = useState<number | ''>('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [accounts, setAccounts] = useState<Account[]>(propAccounts || []);

    // Fetch accounts if not provided via props
    useEffect(() => {
        if (open && accounts.length === 0 && !propAccounts) {
            accountsApi.list().then((res) => {
                setAccounts(res.data.data.items);
            }).catch(console.error);
        }
    }, [open, accounts.length, propAccounts]);

    // Update accounts when props change
    useEffect(() => {
        if (propAccounts) {
            setAccounts(propAccounts);
        }
    }, [propAccounts]);

    // Filter categories by selected type
    const filteredCategories = useMemo(() => {
        return categories.filter((cat) => cat.type === type);
    }, [categories, type]);

    // Reset category when type changes
    const handleTypeChange = (newType: 'expense' | 'income') => {
        setType(newType);
        setCategoryId('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId) return;

        onSave?.({
            type,
            amount: parseFloat(amount),
            category_id: categoryId as number,
            account_id: accountId ? (accountId as number) : undefined,
            note: note || undefined,
            date,
        });

        // Reset form
        setAmount('');
        setCategoryId('');
        setAccountId('');
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-2xl p-0">
                <DialogHeader className="px-8 pb-2 pt-6">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        Add Transaction
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 pb-6">
                    <div className="space-y-4">
                        {/* Type Toggle */}
                        <div className="flex h-11 items-center rounded-lg bg-secondary p-1">
                            <label
                                className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-semibold transition-all ${
                                    type === 'expense'
                                        ? 'bg-card text-primary shadow-sm'
                                        : 'text-muted-foreground'
                                }`}
                                onClick={() => handleTypeChange('expense')}
                            >
                                <span>Expense</span>
                                <input
                                    type="radio"
                                    name="type"
                                    value="expense"
                                    checked={type === 'expense'}
                                    onChange={() => handleTypeChange('expense')}
                                    className="invisible w-0"
                                />
                            </label>
                            <label
                                className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-semibold transition-all ${
                                    type === 'income'
                                        ? 'bg-card text-income shadow-sm'
                                        : 'text-muted-foreground'
                                }`}
                                onClick={() => handleTypeChange('income')}
                            >
                                <span>Income</span>
                                <input
                                    type="radio"
                                    name="type"
                                    value="income"
                                    checked={type === 'income'}
                                    onChange={() => handleTypeChange('income')}
                                    className="invisible w-0"
                                />
                            </label>
                        </div>

                        {/* Amount Field */}
                        <div className="flex flex-col">
                            <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                Amount
                            </p>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-2xl font-light text-muted-foreground/60">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                    className="h-16 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-3xl font-bold tracking-tight placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        {/* Account Field */}
                        {accounts.length > 0 && (
                            <div className="flex flex-col">
                                <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                    Account (Optional)
                                </p>
                                <div className="relative">
                                    <Wallet className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                                    <select
                                        value={accountId}
                                        onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : '')}
                                        className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card pl-11 pr-10 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                                    >
                                        <option value="">No account selected</option>
                                        {accounts.filter(a => a.is_active).map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name} ({account.type_label})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>
                        )}

                        {/* Category Field */}
                        <div className="flex flex-col">
                            <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                Category
                            </p>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(Number(e.target.value))}
                                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card pl-11 pr-10 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                                >
                                    <option value="" disabled>
                                        Select category
                                    </option>
                                    {filteredCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Notes Field */}
                        <div className="flex flex-col">
                            <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                Note (Optional)
                            </p>
                            <div className="relative">
                                <Notebook className="absolute left-4 top-3.5 size-4 text-muted-foreground/60" />
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="What was this for?"
                                    className="h-20 w-full resize-none rounded-xl border border-border bg-card pl-11 pr-4 pt-2.5 text-sm font-normal placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-12 flex-1 rounded-xl font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-12 flex-[2] gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
                            >
                                <Check className="size-4" />
                                Save Transaction
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Privacy Footer */}
                <div className="border-t border-primary/10 bg-primary/5 px-8 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <Lock className="size-3.5" />
                        </div>
                        <p className="text-[10px] font-medium leading-tight text-primary/80">
                            Your transaction data is encrypted and stored locally.
                            Privacy is our priority.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

