import { useState, type PropsWithChildren } from 'react';

import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { AddTransactionModal, type TransactionFormData } from '@/components/transactions/add-transaction-modal';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { transactions as transactionsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Category } from '@/types';
import { useEffect } from 'react';
import { categories as categoriesApi } from '@/lib/api';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Fetch categories when modal opens
    useEffect(() => {
        if (isModalOpen && categories.length === 0) {
            categoriesApi
                .list()
                .then((res) => {
                    setCategories(res.data.data);
                })
                .catch(console.error);
        }
    }, [isModalOpen, categories.length]);

    // Handle save transaction
    const handleSaveTransaction = async (data: TransactionFormData) => {
        try {
            await transactionsApi.create({
                category_id: data.category_id,
                account_id: data.account_id,
                type: data.type,
                amount: data.amount,
                note: data.note,
                transaction_date: data.date,
            });
            toast.success('Transaction added successfully!');
            setIsModalOpen(false);
            router.reload();
        } catch (error) {
            console.error('Failed to save transaction:', error);
            toast.error('Failed to add transaction.');
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden pb-24 md:pb-0">
                    {/* Desktop Header */}
                    <div className="hidden md:block">
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    </div>
                    {/* Mobile Header */}
                    <MobileHeader />
                    {children}
                </AppContent>
                {/* Mobile Bottom Navigation */}
                <MobileNav onAddTransaction={handleOpenModal} />
            </AppShell>

            {/* Add Transaction Modal */}
            <AddTransactionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                categories={categories}
                onSave={handleSaveTransaction}
                isSaving={false}
            />
        </>
    );
}
