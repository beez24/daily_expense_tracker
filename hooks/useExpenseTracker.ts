"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Expense, Category, ExpenseFilter, SummaryMetrics, DaySpending, CategorySpending } from "@/types/expense";
import { getStoredExpenses, saveStoredExpenses, getStoredCategories, saveStoredCategories, resetToSeedData } from "@/lib/storage";
import { DEFAULT_CATEGORIES, SEED_EXPENSES } from "@/lib/constants";
import { isDateInWeek, isDateInMonth, generateId } from "@/lib/utils";
import { startOfWeek, addDays, format, parseISO, isSameDay } from "date-fns";

export function useExpenseTracker() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [referenceDate, setReferenceDate] = useState<Date>(new Date("2026-08-15"));

  const [filter, setFilter] = useState<ExpenseFilter>({
    searchQuery: "",
    categoryId: "all",
    startDate: "",
    endDate: "",
    sortBy: "date-desc",
  });

  // Hydrate from LocalStorage on mount
  useEffect(() => {
    const storedExp = getStoredExpenses();
    const storedCat = getStoredCategories();
    setExpenses(storedExp);
    setCategories(storedCat);
    setIsLoaded(true);
  }, []);

  // Save expenses on update
  const addExpense = useCallback((data: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      saveStoredExpenses(updated);
      return updated;
    });
  }, []);

  const updateExpense = useCallback((id: string, data: Partial<Omit<Expense, "id">>) => {
    setExpenses((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveStoredExpenses(updated);
      return updated;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveStoredExpenses(updated);
      return updated;
    });
  }, []);

  // Category management
  const addCategory = useCallback((data: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...data,
      id: "cat-" + Math.random().toString(36).substring(2, 9),
    };
    setCategories((prev) => {
      const updated = [...prev, newCategory];
      saveStoredCategories(updated);
      return updated;
    });
  }, []);

  const updateCategory = useCallback((id: string, data: Partial<Omit<Category, "id">>) => {
    setCategories((prev) => {
      const updated = prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat));
      saveStoredCategories(updated);
      return updated;
    });
  }, []);

  const deleteCategory = useCallback((id: string, reassignCategoryId?: string) => {
    const targetReassign = reassignCategoryId || "cat-other";
    setCategories((prev) => {
      const updatedCat = prev.filter((cat) => cat.id !== id);
      saveStoredCategories(updatedCat);
      return updatedCat;
    });
    // Reassign affected expenses
    setExpenses((prev) => {
      const updatedExp = prev.map((exp) => (exp.categoryId === id ? { ...exp, categoryId: targetReassign } : exp));
      saveStoredExpenses(updatedExp);
      return updatedExp;
    });
  }, []);

  const resetAllData = useCallback(() => {
    const seed = resetToSeedData();
    setExpenses(seed.expenses);
    setCategories(seed.categories);
  }, []);

  const refreshFromStorage = useCallback(() => {
    setExpenses(getStoredExpenses());
    setCategories(getStoredCategories());
  }, []);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Search query filter (matches category name or description)
        if (filter.searchQuery.trim()) {
          const query = filter.searchQuery.toLowerCase();
          const categoryObj = categories.find((c) => c.id === exp.categoryId);
          const categoryName = categoryObj ? categoryObj.name.toLowerCase() : "";
          const desc = (exp.description || "").toLowerCase();
          const amountStr = exp.amount.toString();
          const matches = categoryName.includes(query) || desc.includes(query) || amountStr.includes(query);
          if (!matches) return false;
        }

        // Category filter
        if (filter.categoryId !== "all" && exp.categoryId !== filter.categoryId) {
          return false;
        }

        // Date Range filters
        if (filter.startDate && exp.date < filter.startDate) return false;
        if (filter.endDate && exp.date > filter.endDate) return false;

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === "date-desc") return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        if (filter.sortBy === "date-asc") return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        if (filter.sortBy === "amount-desc") return b.amount - a.amount;
        if (filter.sortBy === "amount-asc") return a.amount - b.amount;
        return 0;
      });
  }, [expenses, categories, filter]);

  // Derived Metrics
  const metrics: SummaryMetrics = useMemo(() => {
    let weekTotal = 0;
    let monthTotal = 0;
    const categoryTotalsMonth: Record<string, number> = {};

    expenses.forEach((exp) => {
      if (isDateInWeek(exp.date, referenceDate)) {
        weekTotal += exp.amount;
      }
      if (isDateInMonth(exp.date, referenceDate)) {
        monthTotal += exp.amount;
        categoryTotalsMonth[exp.categoryId] = (categoryTotalsMonth[exp.categoryId] || 0) + exp.amount;
      }
    });

    let highestCatObj: SummaryMetrics["highestCategory"] = null;
    let maxAmount = 0;

    Object.entries(categoryTotalsMonth).forEach(([catId, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        const cat = categories.find((c) => c.id === catId);
        if (cat) {
          highestCatObj = {
            id: cat.id,
            name: cat.name,
            amount: amount,
            color: cat.color,
            icon: cat.icon,
          };
        }
      }
    });

    const dailyAverageThisWeek = weekTotal > 0 ? weekTotal / 7 : 0;

    return {
      totalThisWeek: weekTotal,
      totalThisMonth: monthTotal,
      dailyAverageThisWeek,
      highestCategory: highestCatObj,
      totalExpensesCount: expenses.length,
    };
  }, [expenses, categories, referenceDate]);

  // Weekly Overview Data (Monday through Sunday for current reference date)
  const weeklyChartData: DaySpending[] = useMemo(() => {
    const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const today = new Date();

    return Array.from({ length: 7 }).map((_, idx) => {
      const dayDate = addDays(monday, idx);
      const dateStr = format(dayDate, "yyyy-MM-dd");
      const dayName = format(dayDate, "EEE"); // Mon, Tue, etc.
      const fullDateLabel = format(dayDate, "MMM d");

      const amount = expenses
        .filter((exp) => exp.date === dateStr)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        day: dayName,
        dateStr,
        fullDateLabel,
        amount,
        isToday: isSameDay(dayDate, today),
      };
    });
  }, [expenses, referenceDate]);

  // Monthly Overview Category Data (Pie / Donut chart for selected month)
  const monthlyCategoryChartData: CategorySpending[] = useMemo(() => {
    const categoryTotals: Record<string, { amount: number; count: number }> = {};
    let monthTotal = 0;

    expenses.forEach((exp) => {
      if (isDateInMonth(exp.date, referenceDate)) {
        monthTotal += exp.amount;
        if (!categoryTotals[exp.categoryId]) {
          categoryTotals[exp.categoryId] = { amount: 0, count: 0 };
        }
        categoryTotals[exp.categoryId].amount += exp.amount;
        categoryTotals[exp.categoryId].count += 1;
      }
    });

    return Object.entries(categoryTotals)
      .map(([catId, { amount, count }]) => {
        const cat = categories.find((c) => c.id === catId) || {
          id: catId,
          name: "Unknown",
          color: "#6B7280",
          icon: "MoreHorizontal",
        };
        const percentage = monthTotal > 0 ? (amount / monthTotal) * 100 : 0;
        return {
          categoryId: catId,
          name: cat.name,
          amount,
          color: cat.color,
          icon: cat.icon,
          percentage,
          count,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, categories, referenceDate]);

  return {
    isLoaded,
    expenses,
    categories,
    filter,
    setFilter,
    filteredExpenses,
    metrics,
    weeklyChartData,
    monthlyCategoryChartData,
    referenceDate,
    setReferenceDate,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    resetAllData,
    refreshFromStorage,
  };
}
