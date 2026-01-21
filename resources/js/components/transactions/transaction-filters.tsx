import { Calendar, ChevronDown, Filter, Search, Tag } from 'lucide-react';

interface TransactionFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    dateFilter: string;
    onDateFilterChange: (filter: string) => void;
}

export function TransactionFilters({
    searchQuery,
    onSearchChange,
}: TransactionFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="min-w-[240px] flex-1">
                <div className="group relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search transactions, notes..."
                        className="w-full rounded-xl border-none bg-secondary py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:border-primary">
                    <Calendar className="size-4" />
                    <span>This Month</span>
                    <ChevronDown className="size-4" />
                </button>

                <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:border-primary">
                    <Tag className="size-4" />
                    <span>Categories</span>
                    <ChevronDown className="size-4" />
                </button>

                <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:border-primary">
                    <Filter className="size-4" />
                    <span>Type</span>
                    <ChevronDown className="size-4" />
                </button>
            </div>
        </div>
    );
}
