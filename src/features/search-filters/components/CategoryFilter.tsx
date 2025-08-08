import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/features/search-filters/services/categoryService";
import { useFilters } from "@/features/search-filters/hooks/useFilters";
import { useState, useRef, useEffect } from "react";

export const CategoryFilter = () => {
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    const { filters, setFilters } = useFilters();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCategoryToggle = (categoryId: string) => {
        const currentCategories = filters.categoryIds || [];
        const newCategories = currentCategories.includes(categoryId)
            ? currentCategories.filter(id => id !== categoryId)
            : [...currentCategories, categoryId];

        setFilters({
            ...filters,
            categoryIds: newCategories.length > 0 ? newCategories : undefined,
        });
    };

    const getDisplayText = () => {
        if (!filters.categoryIds?.length) return "Categories";
        if (filters.categoryIds.length === 1) {
            const category = categories.find(c => c.id === filters.categoryIds![0]);
            return category?.name || "Categories";
        }
        return `${filters.categoryIds.length} categories`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="
                    px-4 py-2 rounded-lg border border-br-secondary
                    bg-bg-surface text-txt-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-br-secondary focus:border-br-secondary
                    cursor-pointer flex items-center justify-between min-w-[180px]
                "
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
            >
                <span className="truncate">{getDisplayText()}</span>
                <svg
                    className={`w-4 h-4 text-txt-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-bg-surface border border-br-secondary rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-3">
                        <div className="text-sm font-medium text-txt-primary mb-3">Select Categories</div>
                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className="flex items-center px-3 py-3 hover:bg-bg-secondary rounded cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.categoryIds?.includes(category.id) || false}
                                    onChange={() => handleCategoryToggle(category.id)}
                                    className="mr-3 h-4 w-4 text-accent focus:ring-accent border-br-secondary rounded"
                                />
                                <span className="text-sm text-txt-primary">{category.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
