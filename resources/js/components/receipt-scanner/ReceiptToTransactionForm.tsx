import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    type Account,
    accountsApi,
    categoriesApi,
    type Category,
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface ReceiptToTransactionFormProps {
    data: {
        merchant: string | null;
        total: number;
        date: string | null;
    };
    onSave: (formData: any) => Promise<void>;
    isSaving: boolean;
}

export function ReceiptToTransactionForm({
    data,
    onSave,
    isSaving,
}: ReceiptToTransactionFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        amount: data.total,
        note: data.merchant || '',
        transaction_date: data.date || new Date().toISOString().split('T')[0],
        category_id: '',
        account_id: '',
        type: 'expense' as 'income' | 'expense',
        spending_type: 'want' as 'need' | 'want',
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [catsRes, accsRes] = await Promise.all([
                    categoriesApi.list(),
                    accountsApi.list(),
                ]);
                setCategories(catsRes.data.data);
                setAccounts(accsRes.data.data.items || []);
            } catch (error) {
                console.error('Error fetching categories/accounts:', error);
                toast.error('Failed to load categories and accounts.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category_id || !formData.account_id) {
            toast.error('Please select both category and account.');
            return;
        }
        onSave(formData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="animate-in space-y-6 delay-150 duration-500 slide-in-from-bottom-4"
        >
            <div className="space-y-4">
                <h3 className="text-lg font-bold">Transaction Details</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 font-bold text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                className="rounded-xl pl-7"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        amount: parseFloat(e.target.value),
                                    })
                                }
                                required
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            className="rounded-xl"
                            value={formData.transaction_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    transaction_date: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.category_id}
                            onValueChange={(val) =>
                                setFormData({ ...formData, category_id: val })
                            }
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {categories
                                    .filter((c) => c.type === formData.type)
                                    .map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id.toString()}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            cat.color || '#ccc',
                                                    }}
                                                />
                                                {cat.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Account */}
                    <div className="space-y-2">
                        <Label>Account</Label>
                        <Select
                            value={formData.account_id}
                            onValueChange={(val) =>
                                setFormData({ ...formData, account_id: val })
                            }
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {accounts.map((acc) => (
                                    <SelectItem
                                        key={acc.id}
                                        value={acc.id.toString()}
                                    >
                                        {acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                    <Label htmlFor="note">Note (Merchant)</Label>
                    <Input
                        id="note"
                        className="rounded-xl"
                        value={formData.note}
                        onChange={(e) =>
                            setFormData({ ...formData, note: e.target.value })
                        }
                    />
                </div>

                {/* Spending Type (Need/Want) */}
                <div className="inline-flex rounded-xl border bg-accent/20 p-1">
                    <button
                        type="button"
                        onClick={() =>
                            setFormData({ ...formData, spending_type: 'need' })
                        }
                        className={cn(
                            'rounded-lg px-4 py-2 text-sm font-bold transition-all',
                            formData.spending_type === 'need'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-background/50',
                        )}
                    >
                        Need
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setFormData({ ...formData, spending_type: 'want' })
                        }
                        className={cn(
                            'rounded-lg px-4 py-2 text-sm font-bold transition-all',
                            formData.spending_type === 'want'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-background/50',
                        )}
                    >
                        Want
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                className="glow-primary btn-hover-scale mt-6 h-12 w-full rounded-2xl text-lg font-black"
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving Transaction...
                    </>
                ) : (
                    <>
                        <Check className="mr-2 h-5 w-5" />
                        Confirm & Save Transaction
                    </>
                )}
            </Button>
        </form>
    );
}
