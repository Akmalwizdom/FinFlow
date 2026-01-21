import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import { Numpad } from './numpad';
import { type TransactionFormData } from './add-transaction-modal';

interface QuickAddSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (data: TransactionFormData) => void;
}

const categories = [
    { value: 'Makanan', label: 'Makanan' },
    { value: 'Transportasi', label: 'Transportasi' },
    { value: 'Belanja', label: 'Belanja' },
    { value: 'Hiburan', label: 'Hiburan' },
    { value: 'Kesehatan', label: 'Kesehatan' },
    { value: 'Gaji', label: 'Gaji' },
    { value: 'Freelance', label: 'Freelance' },
];

export function QuickAddSheet({ open, onOpenChange, onSave }: QuickAddSheetProps) {
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('0');
    const [category, setCategory] = useState('Makanan');
    const [note, setNote] = useState('');

    const handleNumpadInput = (value: string) => {
        setAmount((prev) => {
            if (prev === '0' && value !== '.') {
                return value;
            }
            if (value === '.' && prev.includes('.')) {
                return prev;
            }
            // Limit decimal places to 2
            const parts = (prev + value).split('.');
            if (parts[1] && parts[1].length > 2) {
                return prev;
            }
            return prev + value;
        });
    };

    const handleNumpadDelete = () => {
        setAmount((prev) => {
            if (prev.length <= 1) return '0';
            return prev.slice(0, -1);
        });
    };

    const formatDisplayAmount = (value: string) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(num);
    };

    const handleSubmit = () => {
        const numAmount = parseFloat(amount) || 0;
        if (numAmount <= 0) return;

        onSave?.({
            type,
            amount: numAmount,
            category,
            note: note || undefined,
            date: new Date().toISOString().split('T')[0],
        });

        // Reset
        setAmount('0');
        setCategory('Makanan');
        setNote('');
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-auto max-h-[90vh] rounded-t-3xl px-0 pb-0"
            >
                {/* Handle */}
                <div className="mx-auto mb-2 mt-4 h-1.5 w-12 rounded-full bg-muted" />

                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">
                            Add Transaction
                        </h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Type Toggle */}
                    <div className="mb-6 flex rounded-xl bg-secondary p-1">
                        <label
                            className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 transition-all ${
                                type === 'expense'
                                    ? 'bg-card text-primary shadow-sm'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <input
                                type="radio"
                                name="mobile_type"
                                checked={type === 'expense'}
                                onChange={() => setType('expense')}
                                className="hidden"
                            />
                            <span className="text-sm font-semibold">Expense</span>
                        </label>
                        <label
                            className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 transition-all ${
                                type === 'income'
                                    ? 'bg-card text-primary shadow-sm'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <input
                                type="radio"
                                name="mobile_type"
                                checked={type === 'income'}
                                onChange={() => setType('income')}
                                className="hidden"
                            />
                            <span className="text-sm font-semibold">Income</span>
                        </label>
                    </div>

                    {/* Amount Display */}
                    <div className="mb-8 text-center">
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Enter Amount
                        </p>
                        <h1 className="text-5xl font-extrabold tracking-tighter text-primary">
                            {formatDisplayAmount(amount)}
                        </h1>
                    </div>

                    {/* Fields */}
                    <div className="mb-8 space-y-4">
                        <div>
                            <label className="mb-2 ml-1 block text-xs font-bold uppercase text-muted-foreground">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full appearance-none rounded-xl border-none bg-secondary px-4 py-4 font-medium text-foreground focus:ring-2 focus:ring-primary"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                    <ChevronDown className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 ml-1 block text-xs font-bold uppercase text-muted-foreground">
                                Notes
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="What was this for?"
                                className="w-full rounded-xl border-none bg-secondary px-4 py-4 font-medium placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Numpad */}
                    <div className="mb-8">
                        <Numpad onInput={handleNumpadInput} onDelete={handleNumpadDelete} />
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSubmit}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold shadow-lg shadow-primary/20"
                    >
                        <Check className="size-5" />
                        Save Transaction
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
