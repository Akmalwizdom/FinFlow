import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

import {
    DataOwnership,
    ExportData,
    GeneralPreferences,
    SpendingCategories,
} from '@/components/settings';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/app',
    },
];

// Mock data for Phase 4 development
const mockCategories = [
    { name: 'Groceries', icon: 'shopping-cart' },
    { name: 'Transport', icon: 'car' },
    { name: 'Rent & Housing', icon: 'home' },
    { name: 'Dining Out', icon: 'utensils' },
    { name: 'Utilities', icon: 'zap' },
    { name: 'Entertainment', icon: 'shopping-cart' },
    { name: 'Healthcare', icon: 'shopping-cart' },
    { name: 'Shopping', icon: 'shopping-cart' },
    { name: 'Travel', icon: 'car' },
    { name: 'Education', icon: 'shopping-cart' },
    { name: 'Subscriptions', icon: 'zap' },
    { name: 'Insurance', icon: 'shopping-cart' },
];

export default function AppSettingsPage() {
    const [currency, setCurrency] = useState('usd');
    const [initialView, setInitialView] = useState('dashboard');

    const handleExport = () => {
        console.log('Exporting CSV...');
        // TODO: Implement CSV export
    };

    const handleDeleteAllData = () => {
        if (confirm('Are you sure you want to permanently delete all your data? This action cannot be undone.')) {
            console.log('Deleting all data...');
            // TODO: Implement data deletion
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Settings" />

            <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
                {/* Page Header */}
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            App Settings & Data Control
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Manage your financial environment, categories, and data
                            ownership.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-income/30 bg-income/10 px-3 py-1.5 text-income">
                        <ShieldCheck className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            Data Encrypted
                        </span>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="flex flex-col gap-8">
                    {/* General Preferences */}
                    <GeneralPreferences
                        currency={currency}
                        onCurrencyChange={setCurrency}
                        initialView={initialView}
                        onInitialViewChange={setInitialView}
                    />

                    {/* Spending Categories */}
                    <SpendingCategories
                        categories={mockCategories}
                        onAddCategory={() => console.log('Add category')}
                        onRemoveCategory={(name) => console.log('Remove:', name)}
                    />

                    {/* Data Control & Privacy */}
                    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ExportData onExport={handleExport} />
                        <DataOwnership onDeleteAllData={handleDeleteAllData} />
                    </section>

                    {/* Footer Meta */}
                    <footer className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 md:flex-row">
                        <div className="flex items-center gap-6">
                            <a
                                href="#"
                                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="#"
                                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                            >
                                Help Center
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-[10px] font-medium">
                                Build 1.0.0-stable
                            </span>
                            <div className="size-1 rounded-full bg-border" />
                            <span className="text-[10px] font-medium">
                                © 2026 FinFlow
                            </span>
                        </div>
                    </footer>
                </div>
            </div>
        </AppLayout>
    );
}
