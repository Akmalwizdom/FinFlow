import { useState, useMemo } from 'react';
import { Check, ChevronDown, Lock, Notebook, Tag, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type Category } from '@/lib/api';

interface AddTransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    onSave?: (transaction: TransactionFormData) => void;
}

export interface TransactionFormData {
    type: 'expense' | 'income';
    amount: number;
    category_id: number;
    note?: string;
    date: string;
}

export function AddTransactionModal({
    open,
    onOpenChange,
    categories,
    onSave,
}: AddTransactionModalProps) {
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
            note: note || undefined,
            date,
        });

        // Reset form
        setAmount('');
        setCategoryId('');
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[520px] gap-0 overflow-hidden rounded-xl p-0">
                <DialogHeader className="px-8 pb-4 pt-8">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            Add Transaction
                        </DialogTitle>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 pb-8">
                    <div className="space-y-6">
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
                            <p className="px-1 pb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Amount
                            </p>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-3xl font-light text-muted-foreground">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                    className="h-20 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-4xl font-semibold tracking-tight placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Category Field */}
                        <div className="flex flex-col">
                            <p className="px-1 pb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Category
                            </p>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(Number(e.target.value))}
                                    className="h-14 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card pl-12 pr-10 text-base font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                            <p className="px-1 pb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Note (Optional)
                            </p>
                            <div className="relative">
                                <Notebook className="absolute left-4 top-4 size-5 text-muted-foreground" />
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="What was this for?"
                                    className="h-24 w-full resize-none rounded-xl border border-border bg-card pl-12 pr-4 pt-3.5 text-base font-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-14 flex-1 rounded-xl font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-14 flex-[2] gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
                            >
                                <Check className="size-5" />
                                Save Transaction
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Privacy Footer */}
                <div className="border-t border-primary/10 bg-primary/5 px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <Lock className="size-4" />
                        </div>
                        <p className="text-xs font-medium text-primary/80">
                            Your transaction data is encrypted and stored locally.
                            Privacy is our priority.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
