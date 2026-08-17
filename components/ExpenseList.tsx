"use client";

import React, { useState } from "react";
import { Expense, Category, ExpenseFilter } from "@/types/expense";
import { formatCurrency, formatDateLabel } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpDown,
  XCircle,
  Receipt,
  Plus,
} from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  filter: ExpenseFilter;
  setFilter: React.Dispatch<React.SetStateAction<ExpenseFilter>>;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  filter,
  setFilter,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleResetFilters = () => {
    setFilter({
      searchQuery: "",
      categoryId: "all",
      startDate: "",
      endDate: "",
      sortBy: "date-desc",
    });
  };

  const getCategory = (catId: string): Category => {
    return (
      categories.find((c) => c.id === catId) || {
        id: catId,
        name: "Uncategorized",
        color: "#6B7280",
        icon: "MoreHorizontal",
      }
    );
  };

  const hasActiveFilters =
    filter.searchQuery || filter.categoryId !== "all" || filter.startDate || filter.endDate;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header & Search / Filter Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-500" />
              Recent Expenses
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses, notes, amount..."
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="lg:col-span-3 relative">
            <select
              value={filter.categoryId}
              onChange={(e) => setFilter((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={filter.sortBy}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value as ExpenseFilter["sortBy"],
                }))
              }
              className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Date range filter toggle or inputs */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter((prev) => ({ ...prev, startDate: e.target.value }))}
              title="Start Date Filter"
              className="w-full px-2 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Transaction List Cards / Items */}
      {expenses.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {expenses.map((expense) => {
            const category = getCategory(expense.categoryId);
            const isConfirmingDelete = deleteConfirmId === expense.id;

            return (
              <div
                key={expense.id}
                className="py-3.5 px-2 sm:px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4 group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  >
                    <CategoryIcon name={category.icon} className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {category.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        • {formatDateLabel(expense.date)}
                      </span>
                    </div>
                    {expense.description ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {expense.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
                        No description
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>

                  {/* Actions */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1.5 animate-fade-in">
                      <button
                        onClick={() => {
                          onDeleteExpense(expense.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <Receipt className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No expenses found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {hasActiveFilters
              ? "No transactions match your search or filter parameters."
              : "Start by logging your daily expenses to see transaction activity here."}
          </p>
          <div className="mt-4">
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={onOpenAddExpense}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Log Your First Expense
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
