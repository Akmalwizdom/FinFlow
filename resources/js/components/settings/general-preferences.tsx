import { ChevronDown, Settings2 } from 'lucide-react';

interface GeneralPreferencesProps {
    currency: string;
    onCurrencyChange: (value: string) => void;
    initialView: string;
    onInitialViewChange: (value: string) => void;
}

const currencies = [
    { value: 'usd', label: 'USD ($) - US Dollar' },
    { value: 'eur', label: 'EUR (€) - Euro' },
    { value: 'gbp', label: 'GBP (£) - British Pound' },
    { value: 'jpy', label: 'JPY (¥) - Japanese Yen' },
    { value: 'idr', label: 'IDR (Rp) - Indonesian Rupiah' },
];

const initialViews = [
    { value: 'dashboard', label: 'Dashboard Overview' },
    { value: 'transactions', label: 'Transaction List' },
    { value: 'reports', label: 'Monthly Reports' },
];

export function GeneralPreferences({
    currency,
    onCurrencyChange,
    initialView,
    onInitialViewChange,
}: GeneralPreferencesProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="text-lg font-bold">General Preferences</h3>
                <Settings2 className="size-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                {/* Currency Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-foreground">
                        Default Currency
                    </label>
                    <div className="relative">
                        <select
                            value={currency}
                            onChange={(e) => onCurrencyChange(e.target.value)}
                            className="h-12 w-full appearance-none rounded-lg border border-border bg-secondary px-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            {currencies.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-5 text-muted-foreground" />
                    </div>
                </div>

                {/* Initial View Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-foreground">
                        Initial View
                    </label>
                    <div className="relative">
                        <select
                            value={initialView}
                            onChange={(e) => onInitialViewChange(e.target.value)}
                            className="h-12 w-full appearance-none rounded-lg border border-border bg-secondary px-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            {initialViews.map((v) => (
                                <option key={v.value} value={v.value}>
                                    {v.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-5 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </section>
    );
}
