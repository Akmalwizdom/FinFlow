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

interface SaveTransactionData {
    amount: number;
    note: string;
    transaction_date: string;
    category_id: string;
    account_id: string;
    type: 'income' | 'expense';
    spending_type?: 'need' | 'want';
}

interface ReceiptToTransactionFormProps {
    data: {
        merchant: string | null;
        total: number;
        date: string | null;
    };
    onSave: (formData: SaveTransactionData) => Promise<void>;
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
        
        // Log form data for debugging
        console.log('Form submitted with data:', formData);
        
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
                            <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-muted-foreground">
                                Rp
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                className="rounded-xl pl-12 transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
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
                            className="rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
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
                            <SelectTrigger className="rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2">
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
                            <SelectTrigger className="rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2">
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
                        placeholder="Enter merchant or notes..."
                        className="rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                        value={formData.note}
                        onChange={(e) =>
                            setFormData({ ...formData, note: e.target.value })
                        }
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="group relative mt-8 h-14 w-full overflow-hidden rounded-2xl border-0 bg-primary px-8 text-lg font-black text-primary-foreground shadow-[0_0_40px_-10px_rgba(var(--primary),0.8)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_-15px_rgba(var(--primary),0.9)] active:scale-[0.98]"
                disabled={isSaving}
            >
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                <span className="relative flex items-center justify-center">
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
                </span>
            </Button>
        </form>
    );
}
