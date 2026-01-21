import { type PropsWithChildren } from 'react';

import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { MobileHeader } from '@/components/mobile-header';
import { MobileNav } from '@/components/mobile-nav';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
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
            <MobileNav />
        </AppShell>
    );
}
